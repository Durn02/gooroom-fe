from pydantic import BaseModel


class SignOutResponse(BaseModel):
    message: str = "signout success"
