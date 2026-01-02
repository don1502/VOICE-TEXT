import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class WhisperService:
    """
    Service for handling audio transcription using OpenAI Whisper API
    """
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "whisper-1"
    
    async def transcribe(self, audio_file_path: str) -> str:
        """
        Transcribe audio file to text using Whisper API
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Transcribed text string
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    response_format="text"
                )
                return transcript if isinstance(transcript, str) else transcript.text
        except Exception as e:
            raise Exception(f"Whisper transcription failed: {str(e)}")
