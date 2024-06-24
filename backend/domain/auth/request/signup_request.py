from pydantic import BaseModel, EmailStr
from typing import Dict

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    concern: Dict[str, str]
    nickname: str
    username: str