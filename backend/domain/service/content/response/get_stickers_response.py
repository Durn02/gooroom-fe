from pydantic import BaseModel
from typing import Dict,List
from gremlin_python.process.traversal import T

class GetStickersResponse(BaseModel):
    sticker_node_id:str
    content:List[str]
    image_url:List[str]

    @classmethod
    def from_data(cls, sticker: Dict[str|T,List[str]|str] ):
        return cls(
            sticker_node_id = sticker.get(T.id,''),
            content=sticker.get("content", []),
            image_url=sticker.get("image_url", []),
        )