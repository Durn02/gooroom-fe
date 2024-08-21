from pydantic import BaseModel


class MuteFriendResponse(BaseModel):
    message: str = "muted succesfully"
