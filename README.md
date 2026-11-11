# Voice AI Agent

An intelligent agent that takes a natural-language command — **typed or spoken** —
understands the context with **Google Gemini**, **writes a professional email**
for you, and sends it via **Gmail**. Speak something like *"email john@acme.com
that the demo is rescheduled to Friday 3pm"* and the agent composes and delivers
the message.

## Features

- 🎙️ **Voice commands** — browser speech recognition (Web Speech API)
- ⌨️ **Type commands too** — works without a mic
- 🧠 **Context-aware intent parsing** — Gemini figures out what you want
- ✍️ **Email authoring** — infers the subject and writes a professional body from your context
- 📧 **Sends real email** — Gmail SMTP with HTML formatting + sanitization
- 💬 **General chat** — ask questions when you're not sending mail
- 🔁 **Resilient** — retries with exponential backoff and automatic model fallback
- 🧵 **Conversation memory** — resolves references like *"send that as an email"*

## Technology Stack

### Frontend
- **React 19** + **TypeScript**
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Axios** for API calls
- **Web Speech API** for voice input

### Backend
- **FastAPI** (Python 3.10+)
- **Google Gemini** (`google-generativeai`) for intent + email authoring
- **aiosmtplib** for async Gmail SMTP delivery
- **bleach** for HTML sanitization
- **pydantic-settings** for configuration

## Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- A **Gemini API key** (free): https://aistudio.google.com/apikey
- A **Gmail App Password**: https://myaccount.google.com/apppasswords

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# configure
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux
# ...edit .env and fill in GEMINI_API_KEY, GMAIL_ADDRESS, GMAIL_APP_PASSWORD

uvicorn main:app --reload --port 8000
```

API: http://localhost:8000 — docs at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Usage

1. Start both servers (backend on `:8000`, frontend on `:5173`).
2. Open http://localhost:5173.
3. Click the mic and speak, or type a command such as:
   - *"Send an email to jane@example.com about the project update"*
   - *"Email my teammate at bob@acme.com that I'll be 10 minutes late"*
4. The agent parses your intent, writes the email, sends it, and shows the
   recipient, subject, and body it composed.

> Tip: If email isn't configured, the agent still parses intent and chats —
> it just reports that email delivery is unavailable until you set
> `GMAIL_ADDRESS` and `GMAIL_APP_PASSWORD`.

## Project Structure

```
backend/
  main.py                    FastAPI app, routes, request/response models
  config.py                  Pydantic settings + logging
  services/
    agent_service.py         Gemini intent parsing + orchestration
    email_service.py         Async Gmail SMTP sending + sanitization
  requirements.txt
  .env.example
frontend/
  src/
    App.tsx                  Chat UI shell
    components/              VoiceInput, ChatMessage, AgentStatus
    services/api.ts          Backend API client
  .env.example
```

## Roadmap
- [ ] Draft-before-send confirmation step
- [ ] Attachments and CC/BCC
- [ ] Persistent conversation history (database)
- [ ] User authentication
