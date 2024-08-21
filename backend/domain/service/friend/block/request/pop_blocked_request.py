from pydantic import BaseModel


class PopBlockedRequest(BaseModel):
    block_edge_id: str
