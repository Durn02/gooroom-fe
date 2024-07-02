from pydantic import BaseModel
from typing import List

class KnockData(BaseModel):
    edge_id: str
    nickname: str

class ListKnockResponse(BaseModel):
    knocks: List[KnockData]

    def append_knock(self, edge_id: str, nickname: str):
        edge_data = KnockData(edge_id=edge_id, nickname=nickname)
        self.knocks.append(edge_data)