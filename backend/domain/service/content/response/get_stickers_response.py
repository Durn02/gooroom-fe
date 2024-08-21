from pydantic import BaseModel
from typing import Dict,List

class GetStickersResponse(BaseModel):
    sticker_node_id:str
    content:str
    image_url:List[str]
    created_at: str

    @classmethod
    def from_data(cls, sticker: Dict[str,List[str]|str] ):
        return cls(
            sticker_node_id = sticker.get('node_id',''),
            content=sticker.get("content", ''),
            image_url=sticker.get("image_url", []),
            created_at=sticker.get("created_at", '')
        )