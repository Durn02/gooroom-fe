from pydantic import BaseModel
from typing import Dict,List
from gremlin_python.process.traversal import T

class GetStickersResponse(BaseModel):
    content:List[str]
    image_url:List[str]

    @classmethod
    def from_data(cls, sticker: Dict[str,List[str]|str] ):
        return cls(
            content=sticker.get("content", []),
            image_url=sticker.get("image_url", []),
        )