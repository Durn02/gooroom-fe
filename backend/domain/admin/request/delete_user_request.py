from pydantic import BaseModel, Field


class DeleteUserRequest(BaseModel):
    deletedUserNodeId: str
