from pydantic import BaseModel

class SignUpResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"