from pydantic import BaseModel, Field


class DeleteUserRequest(BaseModel):
    node_id: str
