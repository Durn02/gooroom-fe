from pydantic import BaseModel, EmailStr
from typing import List


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    concern: List[str]
    nickname: str
    username: str
