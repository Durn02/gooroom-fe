from pydantic import BaseModel


class RejectKnockResponse(BaseModel):
    message: str = "knock rejected successfully"
