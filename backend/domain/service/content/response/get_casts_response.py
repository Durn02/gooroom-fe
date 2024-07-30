from pydantic import BaseModel
from typing import Dict,List
from gremlin_python.process.traversal import T

class GetCastsResponse(BaseModel):
    cast_edge_id:str
    message:str

    @classmethod
    def from_data(cls, cast: Dict[str|T,str] ):
        return cls(
            cast_edge_id = cast.get(T.id,''),
            message=cast.get("message", ''),
        )