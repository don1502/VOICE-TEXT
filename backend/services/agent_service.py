import os
import json
from dotenv import load_dotenv

load_dotenv()


class AgentService:
    """
    AI Agent service powered by Google Gemini.
    Parses user intent from voice commands and executes actions.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables. Get a free key at https://aistudio.google.com/apikey")

        import google.generativeai as genai
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")

        # Import email service
        from services.email_service import EmailService
        self.email_service = EmailService()

    async def parse_intent(self, text: str) -> dict:
        """
        Use Gemini to parse user's voice command into structured intent.

        Args:
            text: Transcribed voice command

        Returns:
            dict with intent type and extracted parameters
        """
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
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Clean up response - remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("\n", 1)[1] if "\n" in response_text else response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            parsed = json.loads(response_text)
            return parsed

        except json.JSONDecodeError:
            # If Gemini doesn't return valid JSON, treat as general chat
            return {
                "intent": "general_chat",
                "parameters": {},
                "message": response.text if response else "I couldn't understand that command. Could you try again?"
            }
        except Exception as e:
            return {
                "intent": "error",
                "parameters": {},
                "message": f"Failed to process your command: {str(e)}"
            }

    async def execute(self, text: str) -> dict:
        """
        Main agent execution pipeline:
        1. Parse intent from text using Gemini
        2. Execute the appropriate action
        3. Return result

        Args:
            text: User's voice command text

        Returns:
            dict with action result and status
        """
        # Step 1: Parse intent
        intent_data = await self.parse_intent(text)
        intent = intent_data.get("intent", "general_chat")
        params = intent_data.get("parameters", {})
        message = intent_data.get("message", "")

        # Step 2: Execute based on intent
        if intent == "send_email":
            to_email = params.get("to_email", "")
            subject = params.get("subject", "")
            body = params.get("body", "")

            if not to_email:
                return {
                    "action": "need_more_info",
                    "intent": "send_email",
                    "message": "I need the recipient's email address. Could you provide it?",
                    "success": False
                }

            # Send the email
            email_result = await self.email_service.send_email(to_email, subject, body)

            if email_result["success"]:
                return {
                    "action": "email_sent",
                    "intent": "send_email",
                    "message": f"✅ Email sent successfully to {to_email}",
                    "success": True,
                    "details": email_result.get("details", {}),
                    "parsed": {
                        "to": to_email,
                        "subject": subject,
                        "body": body
                    }
                }
            else:
                return {
                    "action": "email_failed",
                    "intent": "send_email",
                    "message": f"❌ Failed to send email: {email_result.get('error', 'Unknown error')}",
                    "success": False,
                    "error": email_result.get("error", "")
                }

        elif intent == "need_more_info":
            return {
                "action": "need_more_info",
                "intent": intent,
                "message": message,
                "success": True
            }

        elif intent == "general_chat":
            return {
                "action": "chat_response",
                "intent": "general_chat",
                "message": message,
                "success": True
            }

        else:
            return {
                "action": "error",
                "intent": intent,
                "message": message or "I encountered an error processing your request.",
                "success": False
            }
