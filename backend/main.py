from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from services.agent_service import AgentService

load_dotenv()

app = FastAPI(title="Voice AI Agent", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
agent_service = AgentService()


class AgentRequest(BaseModel):
    text: str


@app.get("/")
async def root():
    return {"message": "Voice AI Agent API", "status": "running", "version": "2.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/agent/status")
async def agent_status():
    """Get agent capabilities and status"""
    return {
        "status": "online",
        "capabilities": [
            {
                "id": "send_email",
                "name": "Send Email",
                "description": "Send emails to any address via voice command",
                "icon": "📧",
                "example": "Send an email to john@example.com about the project update"
            },
            {
                "id": "general_chat",
                "name": "General Chat",
                "description": "Ask questions or have a conversation",
                "icon": "💬",
                "example": "What's the weather like today?"
            }
        ],
        "email_configured": agent_service.email_service.is_configured()
    }


@app.post("/api/agent/execute")
async def execute_agent(request: AgentRequest):
    """
    Execute an agent action based on voice command text.
    The agent parses the intent using Gemini and executes the appropriate action.
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        result = await agent_service.execute(request.text)

        return JSONResponse(
            status_code=200,
            content={
                "success": result.get("success", False),
                "action": result.get("action", "unknown"),
                "intent": result.get("intent", "unknown"),
                "message": result.get("message", ""),
                "details": result.get("details", {}),
                "parsed": result.get("parsed", {})
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
