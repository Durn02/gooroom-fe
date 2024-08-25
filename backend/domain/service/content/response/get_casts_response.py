from pydantic import BaseModel
from typing import Dict

class GetCastsResponse(BaseModel):
    cast_edge_id:str
    cast_id:str
    message:str
    created_at:str
    friend_nickname:str
    friend_node_id:str

    @classmethod
    def from_data(cls, cast: Dict[str,str] ,friend:Dict[str,str]):
        return cls(
            cast_edge_id = cast.get("edge_id",''),
            cast_id=cast.get("cast_id",''),
            message=cast.get("message", ''),
            created_at=cast.get("created_at",''),
            friend_nickname=friend.get("nickname"),
            friend_node_id=friend.get("node_id",'')
        )