from pydantic import BaseModel, EmailStr,Field
from typing import List

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    concern: List[str]
    nickname: str = Field(..., min_length=1)
    username: str