from pydantic import BaseModel, EmailStr


class SendVerificationCodeRequest(BaseModel):
    email: EmailStr
