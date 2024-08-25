from pydantic import BaseModel


class PopMutedRequest(BaseModel):
    mute_edge_id: str
