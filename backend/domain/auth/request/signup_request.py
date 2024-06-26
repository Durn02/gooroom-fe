from pydantic import BaseModel, EmailStr


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    concern: list
    nickname: str
    username: str
