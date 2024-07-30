from pydantic import BaseModel

class SendCastResponse(BaseModel):
    message:str = "created successfully"
