import os
import smtplib
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


class EmailService:
    """
    Service for sending emails via Gmail SMTP
    """

    def __init__(self):
        self.sender_email = os.getenv("GMAIL_ADDRESS", "")
        self.app_password = os.getenv("GMAIL_APP_PASSWORD", "")
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587

    def is_configured(self) -> bool:
        """Check if email credentials are configured"""
        return bool(self.sender_email and self.app_password)

    def validate_email(self, email: str) -> bool:
        """Validate email address format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    async def send_email(self, to_email: str, subject: str, body: str) -> dict:
        """
        Send an email via Gmail SMTP

        Args:
            to_email: Recipient email address
            subject: Email subject line
            body: Email body content

        Returns:
            dict with success status and message
        """
        if not self.is_configured():
            return {
                "success": False,
                "error": "Email service not configured. Please set GMAIL_ADDRESS and GMAIL_APP_PASSWORD in .env"
            }

        if not self.validate_email(to_email):
            return {
                "success": False,
                "error": f"Invalid email address: {to_email}"
            }

        try:
            # Create the email message
            message = MIMEMultipart("alternative")
            message["From"] = self.sender_email
            message["To"] = to_email
            message["Subject"] = subject

            # Create HTML version of the email
            html_body = f"""
            <html>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px;">
                        <h2 style="color: #1e1b4b; margin: 0;">📧 {subject}</h2>
                    </div>
                    <div style="color: #374151; line-height: 1.6; font-size: 15px;">
                        {body.replace(chr(10), '<br>')}
                    </div>
                    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
                        Sent via Voice AI Agent 🤖
                    </div>
                </div>
            </body>
            </html>
            """

            # Attach both plain text and HTML
            message.attach(MIMEText(body, "plain"))
            message.attach(MIMEText(html_body, "html"))

            # Send the email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.app_password)
                server.sendmail(self.sender_email, to_email, message.as_string())

            return {
                "success": True,
                "message": f"Email sent successfully to {to_email}",
                "details": {
                    "to": to_email,
                    "subject": subject,
                    "from": self.sender_email
                }
            }

        except smtplib.SMTPAuthenticationError:
            return {
                "success": False,
                "error": "Gmail authentication failed. Check your GMAIL_ADDRESS and GMAIL_APP_PASSWORD in .env. Make sure you're using an App Password (not your regular password)."
            }
        except smtplib.SMTPException as e:
            return {
                "success": False,
                "error": f"SMTP error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to send email: {str(e)}"
            }
