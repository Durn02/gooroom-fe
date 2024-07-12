from pydantic import BaseModel


class PwChangeResponse(BaseModel):
    message: str = "pw changed"
