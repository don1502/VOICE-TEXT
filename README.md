# Voice-to-Text AI Agent

An intelligent voice agent that captures audio input (voice or pre-recorded audio), processes it intelligently using AI, and delivers contextual text output with advanced understanding.

## Features

### Phase 1 MVP (Current)
- ✅ **Voice Recording**: Record audio directly from your browser using Web Audio API
- ✅ **Audio File Upload**: Upload audio files (MP3, WAV, M4A, WEBM, etc.)
- ✅ **Speech-to-Text**: Accurate transcription using OpenAI Whisper API
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
- **PostgreSQL** For data storage


## Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+

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

5. Run the backend server:
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

3. Start the development server:
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

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
uvicorn main:app --reload --port 8000
```


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
- [ ] Phase 2 - Multi-turn conversations and advanced features
- [ ] Phase 3 - User authentication and data persistence
- [ ] Phase 4 - Advanced task execution and integrations

