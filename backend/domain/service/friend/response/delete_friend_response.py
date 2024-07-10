from pydantic import BaseModel

class DeleteFriendResponse(BaseModel):
    message: str