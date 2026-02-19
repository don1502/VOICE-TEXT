"""
Voice AI Agent — FastAPI application.
Features: structured logging, Pydantic response models, request IDs,
enhanced health check, proper startup/shutdown lifecycle.
"""

import uuid
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from config import get_settings, setup_logging
from services.agent_service import AgentService

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------ #
#  Settings & startup                                                 #
# ------------------------------------------------------------------ #

settings = get_settings()
setup_logging(settings.log_level)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle."""
    logger.info("=== Voice AI Agent starting ===")
    logger.info("Primary model : %s", settings.gemini_model)
    logger.info("Fallback model: %s", settings.gemini_fallback_model)
    logger.info("Email config  : %s", "OK" if settings.gmail_address else "NOT SET")
    logger.info("CORS origins  : %s", settings.cors_origins)
    yield
    logger.info("=== Voice AI Agent shutting down ===")


app = FastAPI(
    title="Voice AI Agent",
    version="2.1.0",
    description="Voice-powered AI agent with email capabilities",
    lifespan=lifespan,
)

# ------------------------------------------------------------------ #
#  Middleware                                                          #
# ------------------------------------------------------------------ #

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    """Attach a unique request ID to every request for traceability."""
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    logger.info(
        "[%s] %s %s", request_id, request.method, request.url.path
    )
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# ------------------------------------------------------------------ #
#  Services                                                           #
# ------------------------------------------------------------------ #

agent_service = AgentService(settings)

# ------------------------------------------------------------------ #
#  Request / Response models                                          #
# ------------------------------------------------------------------ #


class AgentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Voice command text")


class EmailDetails(BaseModel):
    to: str | None = None
    subject: str | None = None
    from_address: str | None = Field(None, alias="from")

    model_config = {"populate_by_name": True}


class ParsedEmail(BaseModel):
    to: str | None = None
    subject: str | None = None
    body: str | None = None


class AgentResponse(BaseModel):
    success: bool
    action: str
    intent: str
    message: str
    details: EmailDetails | dict = {}
    parsed: ParsedEmail | dict = {}
    error: str | None = None


class HealthResponse(BaseModel):
    status: str
    gemini_model: str
    fallback_model: str
    email_configured: bool
    version: str


class AgentCapability(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    example: str


class AgentStatusResponse(BaseModel):
    status: str
    capabilities: list[AgentCapability]
    email_configured: bool


# ------------------------------------------------------------------ #
#  Routes                                                             #
# ------------------------------------------------------------------ #


@app.get("/", tags=["General"])
async def root():
    return {"message": "Voice AI Agent API", "status": "running", "version": "2.1.0"}


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """Enhanced health check — reports model config and email status."""
    return {
        "status": "healthy",
        "gemini_model": settings.gemini_model,
        "fallback_model": settings.gemini_fallback_model,
        "email_configured": agent_service.email_service.is_configured(),
        "version": "2.1.0",
    }


@app.get("/api/agent/status", response_model=AgentStatusResponse, tags=["Agent"])
async def agent_status():
    """Get agent capabilities and status."""
    return {
        "status": "online",
        "capabilities": [
            {
                "id": "send_email",
                "name": "Send Email",
                "description": "Send emails to any address via voice command",
                "icon": "mail",
                "example": "Send an email to john@example.com about the project update",
            },
            {
                "id": "general_chat",
                "name": "General Chat",
                "description": "Ask questions or have a conversation",
                "icon": "chat",
                "example": "What's the weather like today?",
            },
        ],
        "email_configured": agent_service.email_service.is_configured(),
    }


@app.post("/api/agent/execute", response_model=AgentResponse, tags=["Agent"])
async def execute_agent(request: AgentRequest):
    """
    Execute an agent action based on voice command text.
    The agent parses the intent using Gemini and executes the appropriate action.
    """
    try:
        result = await agent_service.execute(request.text)

        return AgentResponse(
            success=result.get("success", False),
            action=result.get("action", "unknown"),
            intent=result.get("intent", "unknown"),
            message=result.get("message", ""),
            details=result.get("details", {}),
            parsed=result.get("parsed", {}),
            error=result.get("error"),
        )

    except Exception as e:
        logger.error("Agent execution error: %s", str(e)[:200])
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")


@app.post("/api/agent/clear-history", tags=["Agent"])
async def clear_history():
    """Clear conversation history."""
    agent_service.clear_history()
    return {"message": "Conversation history cleared"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
