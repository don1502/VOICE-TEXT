"""
Centralized configuration using Pydantic Settings.
Validates all environment variables at startup with clear error messages.
"""

import logging
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    # --- Gemini AI ---
    gemini_api_key: str = Field(
        ...,
        description="Google Gemini API key. Get free at https://aistudio.google.com/apikey"
    )
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        description="Primary Gemini model to use"
    )
    gemini_fallback_model: str = Field(
        default="gemini-2.0-flash-lite",
        description="Fallback model if primary is unavailable or quota-limited"
    )
    gemini_max_retries: int = Field(
        default=3,
        description="Max retries for Gemini API calls on transient errors"
    )
    gemini_timeout_seconds: int = Field(
        default=30,
        description="Timeout for Gemini API calls in seconds"
    )

    # --- Gmail SMTP ---
    gmail_address: str = Field(
        default="",
        description="Gmail address for sending emails"
    )
    gmail_app_password: str = Field(
        default="",
        description="Gmail App Password (not regular password)"
    )
    smtp_server: str = Field(default="smtp.gmail.com")
    smtp_port: int = Field(default=587)

    # --- Application ---
    cors_origins: list[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        description="Allowed CORS origins"
    )
    log_level: str = Field(default="INFO", description="Logging level")
    conversation_history_limit: int = Field(
        default=10,
        description="Max messages to keep in conversation history"
    )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


def get_settings() -> Settings:
    """Load and validate settings. Raises clear errors if required vars missing."""
    return Settings()


def setup_logging(level: str = "INFO") -> None:
    """Configure structured logging for the application."""
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # Quiet down noisy third-party loggers
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
