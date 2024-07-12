from pydantic import BaseModel

class AcceptKnockResponse(BaseModel):
    message: str = "knock accepted successfully"