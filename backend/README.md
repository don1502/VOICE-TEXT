# Voice AI Agent — Backend

FastAPI backend for the Voice AI Agent. It takes a natural-language command
(typed or spoken), uses **Google Gemini** to understand the intent and *write*
a professional email from the given context, then sends it via **Gmail SMTP**.

## Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create your `.env` file from the template and fill in your keys:
   ```bash
   # Windows
   copy .env.example .env
   # macOS/Linux
   cp .env.example .env
   ```

   Required values:
   - `GEMINI_API_KEY` — free key from https://aistudio.google.com/apikey
   - `GMAIL_ADDRESS` — the Gmail account that sends mail
   - `GMAIL_APP_PASSWORD` — a Gmail **App Password** (not your login password).
     Create one at https://myaccount.google.com/apppasswords (requires 2-Step
     Verification enabled).

4. Run the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

- API root:          http://localhost:8000
- Interactive docs:  http://localhost:8000/docs

## How it works

1. The frontend sends the user's command text to `POST /api/agent/execute`.
2. `AgentService` prompts Gemini to classify the intent and, for emails,
   extract the recipient, infer a subject, and **compose a professional body**
   from the context.
3. If the intent is `send_email`, `EmailService` sanitizes the content and
   sends it over Gmail SMTP with retry + model-fallback logic.
4. The structured result (action, parsed email, status) is returned to the UI.

## Endpoints

| Method | Path                       | Description                                   |
|--------|----------------------------|-----------------------------------------------|
| GET    | `/`                        | Basic liveness/info                           |
| GET    | `/health`                  | Health + model/email configuration status     |
| GET    | `/api/agent/status`        | Agent capabilities and online status          |
| POST   | `/api/agent/execute`       | Run a command (parse intent + act)            |
| POST   | `/api/agent/clear-history` | Clear in-memory conversation context          |

### Example

```bash
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"text": "Send an email to jane@example.com letting her know the Q3 report is ready for review"}'
```

The agent will infer a subject, write a professional body, send the email, and
return the parsed details.
