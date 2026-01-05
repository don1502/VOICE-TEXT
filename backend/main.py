from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import tempfile
import aiofiles

from services.whisper_service import WhisperService
from services.agent_service import AgentService

load_dotenv()

app = FastAPI(title="Voice-to-Text AI Agent", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
whisper_service = WhisperService()
agent_service = AgentService()


class TranscriptionRequest(BaseModel):
    text: str


@app.get("/")
async def root():
    return {"message": "Voice-to-Text AI Agent API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio file using Whisper API
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("audio/"):
            raise HTTPException(status_code=400, detail="File must be an audio file")

        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".webm"
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp_file_path = tmp_file.name
        tmp_file.close()
        
        try:
            content = await file.read()
            async with aiofiles.open(tmp_file_path, 'wb') as f:
                await f.write(content)

            # Transcribe audio
            transcription = await whisper_service.transcribe(tmp_file_path)
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "transcription": transcription,
                    "message": "Audio transcribed successfully"
                }
            )
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")


@app.post("/api/generate-response")
async def generate_response(request: TranscriptionRequest):
    """
    Generate AI response from transcribed text
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        response = await agent_service.process_text(request.text)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "response": response,
                "message": "Response generated successfully"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Response generation error: {str(e)}")


@app.post("/api/process-audio")
async def process_audio(file: UploadFile = File(...)):
    """
    Complete pipeline: transcribe audio and generate AI response
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("audio/"):
            raise HTTPException(status_code=400, detail="File must be an audio file")

        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".webm"
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp_file_path = tmp_file.name
        tmp_file.close()
        
        try:
            content = await file.read()
            async with aiofiles.open(tmp_file_path, 'wb') as f:
                await f.write(content)

            # Step 1: Transcribe audio
            transcription = await whisper_service.transcribe(tmp_file_path)
            
            # Step 2: Generate AI response
            if transcription and transcription.strip():
                ai_response = await agent_service.process_text(transcription)
            else:
                ai_response = "I couldn't transcribe any audio. Please try speaking more clearly."
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "transcription": transcription,
                    "response": ai_response,
                    "message": "Audio processed successfully"
                }
            )
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

