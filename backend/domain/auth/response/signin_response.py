from pydantic import BaseModel


class SignInResponse(BaseModel):
    message: str = "login success"
