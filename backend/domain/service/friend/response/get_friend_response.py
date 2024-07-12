from typing import List, Dict, Any
from pydantic import BaseModel
from gremlin_python.process.traversal import T

class FriendDetail(BaseModel):
    my_memo : List[str]
    nickname : str
    username : str
    concern : List
    node_id : str
    memo : str

class GetFriendResponse(BaseModel):
    friend_detail: FriendDetail

    @classmethod
    def from_data(cls, friend_node: Dict[str, List], memo: str):
        friend_detail = FriendDetail(
            my_memo = friend_node.get('my_memo', []),
            nickname = friend_node.get('nickname', [])[0] if friend_node.get('nickname', []) else '',
            username = friend_node.get('username', [])[0] if friend_node.get('username', []) else '',
            concern = friend_node.get('concern', []),
            node_id = friend_node.get('node_id', ''),
            memo = memo
        )
        return cls(friend_detail=friend_detail)