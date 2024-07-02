from pydantic import BaseModel

class SendKnockResponse(BaseModel):
    message: str = "knock sended successfully"