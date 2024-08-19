from pydantic import BaseModel
from typing import List, Dict, Union


class GetBlockedResponse(BaseModel):
    block_edge_id: str
    user_id: str
    user_nickname: str

    @classmethod
    def from_data(cls, edge_id: str, node: Dict[str, Union[str, List[str]]]):
        return cls(
            block_edge_id=edge_id,
            user_id=node.get("node_id", ""),
            user_nickname=node.get("nickname", ""),
        )
