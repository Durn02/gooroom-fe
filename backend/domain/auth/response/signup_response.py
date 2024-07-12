from pydantic import BaseModel


class SignUpResponse(BaseModel):
    message: str = "user registered successfully"
