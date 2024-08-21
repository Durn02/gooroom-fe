from pydantic import BaseModel


class PopMutedResponse(BaseModel):
    message: str
