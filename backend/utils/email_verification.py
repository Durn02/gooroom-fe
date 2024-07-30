import os
import smtplib
import ssl
from email.message import EmailMessage
from dotenv import load_dotenv
from fastapi import HTTPException

from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def send_verification_email(email: str, code: str):
    smtp_server = "smtp.gmail.com"
    port = 587
    sender_email = os.getenv("smtp_user")
    password = os.getenv("smtp_password")
    print(sender_email, password)
    if not password:
        raise HTTPException(
            status_code=500, detail="Email password not found in environment variables"
        )

    em = EmailMessage()
    em["From"] = sender_email
    em["To"] = email
    em["Subject"] = "Your verification code"
    em.set_content(f"Your verification code is {code}.")

    # Create a secure SSL context
    context = ssl.create_default_context()

    try:
        with smtplib.SMTP(smtp_server, port) as server:
            server.ehlo()
            server.starttls(context=context)  # Secure the connection
            server.ehlo()
            server.login(sender_email, password)
            server.sendmail(sender_email, email, em.as_string())
        print(f"Verification email sent to {email}")
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send verification email")
