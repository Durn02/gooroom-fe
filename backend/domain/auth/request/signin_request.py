from pydantic import BaseModel, EmailStr
from typing import Dict


class SignInRequest(BaseModel):
    email: EmailStr
    password: str
