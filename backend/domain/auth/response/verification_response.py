from pydantic import BaseModel


class VerificationResponse(BaseModel):
    message: str = "verified successfully"
