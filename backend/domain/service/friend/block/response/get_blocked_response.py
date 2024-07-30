from pydantic import BaseModel
from typing import Dict
from gremlin_python.process.traversal import T

class GetBlockedResponse(BaseModel):
    block_edge: str
    user_id:str
    user_nickname:str

    @classmethod
    def from_data(cls, edge: Dict[T,str], node: Dict[str,str]):
        return cls(
            block_edge=edge.get(T.id, ''),
            user_id=node.get(T.id, ''),
            user_nickname=node.get('nickname')[0] if node.get('nickname') else ''
        )