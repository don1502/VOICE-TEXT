# Voice-to-Text AI Agent - Backend

FastAPI backend for the Voice-to-Text AI Agent application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file (copy from `.env.example`) and add your API keys:
```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here  # Optional, will use OpenAI if not provided
```

3. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## Endpoints

- `POST /api/transcribe` - Transcribe audio file
- `POST /api/generate-response` - Generate AI response from text
- `POST /api/process-audio` - Complete pipeline (transcribe + AI response)

