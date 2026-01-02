# Quick Start Guide

Get the Voice-to-Text AI Agent up and running in 5 minutes!

## Prerequisites

- **Python 3.9+** installed
- **Node.js 18+** and npm installed
- **OpenAI API Key** (get one at https://platform.openai.com/api-keys)

## Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy the template and add your API key
echo OPENAI_API_KEY=your_key_here > .env
# Or manually create .env with:
# OPENAI_API_KEY=sk-...

# Start the server
uvicorn main:app --reload --port 8000
```

Backend should now be running at `http://localhost:8000` ✅

## Step 2: Frontend Setup

Open a **new terminal** (keep backend running):

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend should now be running at `http://localhost:5173` ✅

## Step 3: Use the App

1. Open your browser to `http://localhost:5173`
2. Click "Start Recording" to record from microphone
3. OR drag & drop an audio file to upload
4. Wait for transcription and AI response!

## Troubleshooting

### Backend won't start
- Make sure port 8000 is not in use
- Check that your `.env` file exists with `OPENAI_API_KEY`
- Verify Python virtual environment is activated

### Frontend won't start
- Make sure port 5173 is not in use
- Run `npm install` again if you see module errors
- Check that Node.js version is 18+

### API Errors
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Verify your OpenAI API key is valid

### Microphone not working
- Grant microphone permissions in your browser
- Use Chrome/Edge for best compatibility
- HTTPS is required in production (localhost works for development)

## Next Steps

- Add Anthropic API key for Claude AI (better responses!)
- Check the main README.md for full documentation
- Explore the codebase structure

Happy coding! 🚀

