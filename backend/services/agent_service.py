import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()


class AgentService:
    """
    Service for processing transcribed text with AI agent (Claude)
    """
    
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            # Fallback to OpenAI if Claude is not available
            openai_key = os.getenv("OPENAI_API_KEY")
            if openai_key:
                self.use_openai = True
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=openai_key)
                self.model = "gpt-4o-mini"
            else:
                raise ValueError("Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY found in environment variables")
        else:
            self.use_openai = False
            self.client = Anthropic(api_key=api_key)
            self.model = "claude-3-5-sonnet-20241022"
    
    async def process_text(self, text: str) -> str:
        
        try:
            if self.use_openai:
                return await self._process_with_openai(text)
            else:
                return await self._process_with_claude(text)
        except Exception as e:
            raise Exception(f"AI processing failed: {str(e)}")
    
    async def _process_with_claude(self, text: str) -> str:
        # Process text using Claude API
        message = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": f"""You are an intelligent voice assistant. The user has provided the following transcribed text from their voice input. 
                    Please process this text intelligently and provide a helpful, contextual response.
                    
                    Transcribed text: {text}
                    
                    Your response should:
                    - Understand the context and intent
                    - Provide useful information or assistance
                    - Be concise but comprehensive
                    - If it's a question, answer it directly
                    - If it's a request, acknowledge it appropriately
                    """
                }
            ]
        )
        return message.content[0].text
    
    async def _process_with_openai(self, text: str) -> str:
        """Process text using OpenAI API (fallback)"""
        response = self.openai_client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an intelligent voice assistant. Process the user's transcribed text and provide helpful, contextual responses."
                },
                {
                    "role": "user",
                    "content": f"Transcribed text: {text}\n\nPlease process this text and provide a helpful response."
                }
            ],
            max_tokens=1024
        )
        return response.choices[0].message.content

