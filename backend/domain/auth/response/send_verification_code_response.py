from pydantic import BaseModel


class SendVerificationCodeResponse(BaseModel):
    message: str = "verification code sent successfully"
