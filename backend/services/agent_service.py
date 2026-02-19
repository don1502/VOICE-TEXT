"""
AI Agent service powered by Google Gemini.
Parses user intent from voice commands and executes actions.

Features:
- Retry with exponential backoff on 429/transient errors
- Automatic model fallback (primary → fallback)
- In-memory conversation history for context
- Structured logging throughout
"""

import json
import asyncio
import logging
import re
from collections import deque

import google.generativeai as genai

from config import Settings

logger = logging.getLogger(__name__)


class AgentService:
    """
    AI Agent service powered by Google Gemini.
    Parses user intent from voice commands and executes actions.
    """

    def __init__(self, settings: Settings):
        self.settings = settings

        genai.configure(api_key=settings.gemini_api_key)
        self.primary_model = genai.GenerativeModel(settings.gemini_model)
        self.fallback_model = genai.GenerativeModel(settings.gemini_fallback_model)
        logger.info(
            "Gemini configured — primary: %s, fallback: %s",
            settings.gemini_model,
            settings.gemini_fallback_model,
        )

        # Import email service
        from services.email_service import EmailService
        self.email_service = EmailService(settings)

        # Conversation history (bounded deque)
        self._history: deque[dict] = deque(maxlen=settings.conversation_history_limit)

    # --------------------------------------------------------------------- #
    #  Gemini call with retry + fallback                                     #
    # --------------------------------------------------------------------- #

    async def _call_gemini(self, prompt: str) -> str:
        """
        Call Gemini with retry logic and model fallback.
        1. Try primary model up to max_retries times
        2. On persistent failure, try fallback model once
        """
        last_error = None

        for model, label in [
            (self.primary_model, self.settings.gemini_model),
            (self.fallback_model, self.settings.gemini_fallback_model),
        ]:
            for attempt in range(1, self.settings.gemini_max_retries + 1):
                try:
                    logger.debug(
                        "Gemini call attempt %d/%d on %s",
                        attempt, self.settings.gemini_max_retries, label,
                    )
                    response = model.generate_content(prompt)
                    logger.info("Gemini response received from %s", label)
                    return response.text.strip()

                except Exception as e:
                    last_error = e
                    error_str = str(e)
                    is_quota = "429" in error_str or "quota" in error_str.lower()
                    is_transient = is_quota or "503" in error_str or "500" in error_str

                    if is_transient and attempt < self.settings.gemini_max_retries:
                        delay = 2 ** attempt  # 2s, 4s, 8s
                        logger.warning(
                            "Transient error on %s (attempt %d): %s — retrying in %ds",
                            label, attempt, error_str[:120], delay,
                        )
                        await asyncio.sleep(delay)
                    else:
                        logger.error(
                            "Failed on %s (attempt %d): %s",
                            label, attempt, error_str[:200],
                        )
                        break  # Move to fallback model

        raise Exception(
            f"All Gemini models failed after retries. Last error: {last_error}"
        )

    # --------------------------------------------------------------------- #
    #  JSON extraction                                                       #
    # --------------------------------------------------------------------- #

    @staticmethod
    def _extract_json(text: str) -> dict:
        """
        Robustly extract JSON from Gemini response.
        Handles markdown code blocks, extra text before/after JSON, etc.
        """
        # Strip markdown code fences
        cleaned = text.strip()
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

        # Try direct parse first
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Try to find JSON object in the text
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        raise json.JSONDecodeError("No valid JSON found in response", cleaned, 0)

    # --------------------------------------------------------------------- #
    #  Intent parsing                                                        #
    # --------------------------------------------------------------------- #

    async def parse_intent(self, text: str) -> dict:
        """
        Use Gemini to parse user's voice command into structured intent.
        """
        # Build context from conversation history
        history_ctx = ""
        if self._history:
            recent = list(self._history)[-5:]  # Last 5 messages for context
            history_lines = []
            for msg in recent:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                history_lines.append(f"  {role}: {content}")
            history_ctx = (
                "\n\nRecent conversation context:\n"
                + "\n".join(history_lines)
                + "\n"
            )

        prompt = f"""You are an AI agent assistant. Analyze the user's voice command and extract the intent.

Currently supported actions:
1. "send_email" - Send an email to someone
2. "general_chat" - General conversation/questions

For "send_email", extract these parameters:
- "to_email": the recipient's email address
- "subject": the email subject
- "body": the email body/content

IMPORTANT RULES:
- If the user says something like "send email to john@example.com about meeting tomorrow", extract the email, infer a good subject, and compose a professional body.
- If the user gives a subject but no body, compose an appropriate professional email body based on the subject.
- If the user mentions sending an email but doesn't provide an email address, set intent to "need_more_info" with a message asking for the email address.
- For any other command, use "general_chat" intent.
- Use conversation context (if available) to resolve references like "send that as an email" or "email the previous response".
{history_ctx}
Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{{
    "intent": "send_email" | "general_chat" | "need_more_info",
    "parameters": {{
        "to_email": "email@example.com",
        "subject": "Subject here",
        "body": "Email body here"
    }},
    "message": "A friendly message to show the user about what you understood"
}}

For "general_chat", the parameters should be empty {{}} and put your response in "message".
For "need_more_info", parameters should be empty {{}} and put your question in "message".

User's command: "{text}"
"""

        try:
            response_text = await self._call_gemini(prompt)
            parsed = self._extract_json(response_text)

            # Store in history
            self._history.append({"role": "user", "content": text})
            self._history.append({
                "role": "assistant",
                "content": parsed.get("message", ""),
            })

            return parsed

        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from Gemini response")
            return {
                "intent": "general_chat",
                "parameters": {},
                "message": "I couldn't understand that command. Could you try again?",
            }
        except Exception as e:
            logger.error("Intent parsing failed: %s", str(e)[:200])
            return {
                "intent": "error",
                "parameters": {},
                "message": f"Failed to process your command: {str(e)}",
            }

    # --------------------------------------------------------------------- #
    #  Main execution pipeline                                               #
    # --------------------------------------------------------------------- #

    async def execute(self, text: str) -> dict:
        """
        Main agent execution pipeline:
        1. Parse intent from text using Gemini
        2. Execute the appropriate action
        3. Return result
        """
        logger.info("Executing command: %s", text[:100])

        # Step 1: Parse intent
        intent_data = await self.parse_intent(text)
        intent = intent_data.get("intent", "general_chat")
        params = intent_data.get("parameters", {})
        message = intent_data.get("message", "")

        # Step 2: Execute based on intent
        if intent == "send_email":
            return await self._handle_email(params, message)
        elif intent == "need_more_info":
            return {
                "action": "need_more_info",
                "intent": intent,
                "message": message,
                "success": True,
            }
        elif intent == "general_chat":
            return {
                "action": "chat_response",
                "intent": "general_chat",
                "message": message,
                "success": True,
            }
        else:
            return {
                "action": "error",
                "intent": intent,
                "message": message or "I encountered an error processing your request.",
                "success": False,
            }

    async def _handle_email(self, params: dict, message: str) -> dict:
        """Handle the send_email intent."""
        to_email = params.get("to_email", "")
        subject = params.get("subject", "")
        body = params.get("body", "")

        if not to_email:
            return {
                "action": "need_more_info",
                "intent": "send_email",
                "message": "I need the recipient's email address. Could you provide it?",
                "success": False,
            }

        logger.info("Sending email to %s (subject: %s)", to_email, subject[:50])
        email_result = await self.email_service.send_email(to_email, subject, body)

        if email_result["success"]:
            return {
                "action": "email_sent",
                "intent": "send_email",
                "message": f"Email sent successfully to {to_email}",
                "success": True,
                "details": email_result.get("details", {}),
                "parsed": {"to": to_email, "subject": subject, "body": body},
            }
        else:
            error_msg = email_result.get("error", "Unknown error")
            logger.error("Email failed: %s", error_msg)
            return {
                "action": "email_failed",
                "intent": "send_email",
                "message": f"Failed to send email: {error_msg}",
                "success": False,
                "error": error_msg,
            }

    def clear_history(self) -> None:
        """Clear conversation history."""
        self._history.clear()
        logger.info("Conversation history cleared")
