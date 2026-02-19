"""
Async email service using aiosmtplib with retry logic and HTML sanitization.
"""

import re
import logging
import asyncio

import aiosmtplib
import bleach
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import Settings

logger = logging.getLogger(__name__)

# Allowed HTML tags/attributes for email body sanitization
ALLOWED_TAGS = ["b", "i", "u", "br", "p", "a", "strong", "em"]
ALLOWED_ATTRS = {"a": ["href"]}


class EmailService:
    """Async email service via Gmail SMTP with retry and sanitization."""

    def __init__(self, settings: Settings):
        self.sender_email = settings.gmail_address
        self.app_password = settings.gmail_app_password
        self.smtp_server = settings.smtp_server
        self.smtp_port = settings.smtp_port
        self._max_retries = 2

        if self.is_configured():
            logger.info("Email service configured for %s", self.sender_email)
        else:
            logger.warning(
                "Email service NOT configured — set GMAIL_ADDRESS and GMAIL_APP_PASSWORD in .env"
            )

    def is_configured(self) -> bool:
        """Check if email credentials are configured."""
        return bool(self.sender_email and self.app_password)

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email address format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    def _build_message(self, to_email: str, subject: str, body: str) -> MIMEMultipart:
        """Build a MIME multipart email with plain text + sanitized HTML."""
        message = MIMEMultipart("alternative")
        message["From"] = self.sender_email
        message["To"] = to_email
        message["Subject"] = subject

        # Sanitize body content to prevent XSS
        safe_body = bleach.clean(body, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS)

        html_body = f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px;">
                    <h2 style="color: #1e1b4b; margin: 0;">{bleach.clean(subject)}</h2>
                </div>
                <div style="color: #374151; line-height: 1.6; font-size: 15px;">
                    {safe_body.replace(chr(10), '<br>')}
                </div>
                <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
                    Sent via Voice AI Agent
                </div>
            </div>
        </body>
        </html>
        """

        message.attach(MIMEText(body, "plain"))
        message.attach(MIMEText(html_body, "html"))
        return message

    async def send_email(self, to_email: str, subject: str, body: str) -> dict:
        """
        Send an email asynchronously via Gmail SMTP with retry logic.

        Returns:
            dict with success status and message/error
        """
        if not self.is_configured():
            return {
                "success": False,
                "error": "Email service not configured. Set GMAIL_ADDRESS and GMAIL_APP_PASSWORD in .env",
            }

        if not self.validate_email(to_email):
            return {
                "success": False,
                "error": f"Invalid email address: {to_email}",
            }

        message = self._build_message(to_email, subject, body)
        last_error = None

        for attempt in range(1, self._max_retries + 1):
            try:
                logger.info(
                    "Sending email to %s (attempt %d/%d)", to_email, attempt, self._max_retries
                )

                await aiosmtplib.send(
                    message,
                    hostname=self.smtp_server,
                    port=self.smtp_port,
                    start_tls=True,
                    username=self.sender_email,
                    password=self.app_password,
                    timeout=15,
                )

                logger.info("Email sent successfully to %s", to_email)
                return {
                    "success": True,
                    "message": f"Email sent successfully to {to_email}",
                    "details": {
                        "to": to_email,
                        "subject": subject,
                        "from": self.sender_email,
                    },
                }

            except aiosmtplib.SMTPAuthenticationError:
                logger.error("SMTP authentication failed for %s", self.sender_email)
                return {
                    "success": False,
                    "error": "Gmail authentication failed. Check your GMAIL_ADDRESS and GMAIL_APP_PASSWORD. Use an App Password, not your regular password.",
                }

            except (aiosmtplib.SMTPConnectError, aiosmtplib.SMTPConnectTimeoutError, OSError) as e:
                last_error = e
                if attempt < self._max_retries:
                    delay = 2 ** attempt
                    logger.warning(
                        "SMTP connection error (attempt %d): %s — retrying in %ds",
                        attempt, str(e)[:100], delay,
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.error("SMTP connection failed after %d attempts: %s", attempt, str(e))

            except aiosmtplib.SMTPException as e:
                logger.error("SMTP error: %s", str(e))
                return {"success": False, "error": f"SMTP error: {str(e)}"}

            except Exception as e:
                logger.error("Unexpected email error: %s", str(e))
                return {"success": False, "error": f"Failed to send email: {str(e)}"}

        return {
            "success": False,
            "error": f"Failed to connect to email server after {self._max_retries} attempts: {last_error}",
        }
