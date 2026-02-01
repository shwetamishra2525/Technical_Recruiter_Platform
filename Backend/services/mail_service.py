import aiosmtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

async def send_status_email(email: str, status: str, candidate_name: str):
    subject = f"Update on your Application - {status.capitalize()}"
    
    # Glassmorphism HTML Template
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="width: 100%; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div style="
                background: rgba(255, 255, 255, 0.25);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.18);
                padding: 40px;
                max-width: 500px;
                width: 90%;
                color: white;
                text-align: center;
                margin: 20px auto;
            ">
                <h1 style="margin-bottom: 20px; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Application Update</h1>
                
                <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                    Dear <strong>{candidate_name}</strong>,
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    We have reviewed your application and interview results.
                    The current status of your application is:
                </p>
                
                <div style="
                    background: rgba(255, 255, 255, 0.3);
                    padding: 15px 30px;
                    border-radius: 50px;
                    display: inline-block;
                    font-weight: bold;
                    font-size: 20px;
                    letter-spacing: 1px;
                    margin-bottom: 40px;
                    text-transform: uppercase;
                ">
                    {status}
                </div>
                
                <p style="font-size: 14px; opacity: 0.8;">
                    Best Regards,<br>
                    AI Recruitment Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    message = EmailMessage()
    message["From"] = SMTP_USER
    message["To"] = email
    message["Subject"] = subject
    message.set_content(html_content, subtype="html")

    try:
        if not SMTP_USER or not SMTP_PASSWORD:
            print("SMTP Credentials not set. Skipping email.")
            return

        await aiosmtplib.send(
            message,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        print(f"Email sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
