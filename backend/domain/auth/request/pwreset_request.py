from pydantic import BaseModel, EmailStr


class PwResetRequest(BaseModel):
    email: EmailStr
