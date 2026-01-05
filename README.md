# Voice-to-Text AI Agent

An intelligent voice agent that captures audio input (voice or pre-recorded audio), processes it intelligently using AI, and delivers contextual text output with advanced understanding.

## Features

### Phase 1 MVP (Current)
- ✅ **Voice Recording**: Record audio directly from your browser using Web Audio API
- ✅ **Audio File Upload**: Upload audio files (MP3, WAV, M4A, WEBM, etc.)
- ✅ **Speech-to-Text**: Accurate transcription using OpenAI Whisper API
- ✅ **AI-Powered Responses**: Contextual understanding and intelligent responses using Claude AI (or OpenAI as fallback)
- ✅ **Modern UI**: Clean, responsive interface built with React, TypeScript, and Tailwind CSS
- ✅ **Real-time Processing**: Live feedback during audio processing

### Phase 2 (Planned)
- 🔄 Multi-turn conversations with context memory
- 🔄 Task-specific modes (summarization, Q&A, meeting transcription)
- 🔄 User preferences and customization
- 🔄 Conversation history
- 🔄 Database integration

## Technology Stack

### Frontend
- **React 19** with **TypeScript**
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **Web Audio API** for browser-based audio recording
- **Axios** for API communication

### Backend
- **FastAPI** (Python) for REST API
- **OpenAI Whisper API** for speech-to-text transcription
- **Anthropic Claude API** for AI agent processing (with OpenAI fallback)
- **PostgreSQL** (ready for Phase 2)
- **Redis** (ready for Phase 2)

## Project Structure

```
voice-text/
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AudioRecorder.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── TranscriptionDisplay.tsx
│   │   │   └── ResponseDisplay.tsx
│   │   ├── services/      # API services
│   │   │   └── api.ts
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # FastAPI backend
│   ├── services/          # Business logic
│   │   ├── whisper_service.py
│   │   └── agent_service.py
│   ├── main.py            # FastAPI app
│   ├── requirements.txt
│   └── README.md
│
└── README.md             # This file
```

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **OpenAI API Key** (required for Whisper transcription)
- **Anthropic API Key** (optional - will use OpenAI if not provided)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **macOS/Linux**: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the `backend` directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Optional
```

6. Run the backend server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file if you need to customize the API URL:
```env
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Start both servers** (backend on port 8000, frontend on port 5173)

2. **Open your browser** and navigate to `http://localhost:5173`

3. **Record or Upload Audio**:
   - Click "Start Recording" to record audio from your microphone
   - Or drag and drop/click to upload an audio file

4. **View Results**:
   - The transcribed text will appear in the Transcription section
   - The AI-generated response will appear below in the AI Response section

## API Endpoints

### `POST /api/transcribe`
Transcribe an audio file to text.

**Request**: Multipart form data with audio file
**Response**: `{ "success": true, "transcription": "...", "message": "..." }`

### `POST /api/generate-response`
Generate AI response from text.

**Request**: `{ "text": "..." }`
**Response**: `{ "success": true, "response": "...", "message": "..." }`

### `POST /api/process-audio`
Complete pipeline: transcribe audio and generate AI response.

**Request**: Multipart form data with audio file
**Response**: `{ "success": true, "transcription": "...", "response": "...", "message": "..." }`

## Development

### Backend Development
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build
```

**Backend**:
The FastAPI app can be deployed using any ASGI server like uvicorn, gunicorn, etc.

## Environment Variables

### Backend (.env)
- `OPENAI_API_KEY` (required): Your OpenAI API key for Whisper transcription
- `ANTHROPIC_API_KEY` (optional): Your Anthropic API key for Claude AI (uses OpenAI if not provided)
- `DATABASE_URL` (optional): PostgreSQL connection string (for Phase 2)
- `REDIS_URL` (optional): Redis connection string (for Phase 2)

### Frontend (.env)
- `VITE_API_URL` (optional): Backend API URL (defaults to http://localhost:8000)

## Troubleshooting

### Microphone Access Issues
- Ensure your browser has microphone permissions
- Use HTTPS in production (required for microphone access)
- Check browser console for permission errors

### API Errors
- Verify your API keys are correct in the `.env` file
- Check that the backend server is running on port 8000
- Review backend logs for detailed error messages

### CORS Issues
- Ensure the frontend URL is added to CORS origins in `backend/main.py`
- Check that you're using the correct port (5173 for Vite dev server)

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

- [x] Phase 1 MVP - Basic voice-to-text with AI responses
- [ ] Phase 2 - Multi-turn conversations and advanced features
- [ ] Phase 3 - User authentication and data persistence
- [ ] Phase 4 - Advanced task execution and integrations

