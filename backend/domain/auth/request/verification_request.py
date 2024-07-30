from pydantic import BaseModel, EmailStr


class VerificationRequest(BaseModel):
    verifycode: str
    email: EmailStr
