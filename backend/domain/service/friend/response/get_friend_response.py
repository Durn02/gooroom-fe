from typing import List, Dict, Union
from pydantic import BaseModel

class FriendDetail(BaseModel):
    node_id : str
    my_memo : str
    nickname : str
    username : str
    concern : List[str]
    about_friend_memo : str

class GetFriendResponse(BaseModel):
    friend_detail: FriendDetail

    @classmethod
    def from_data(cls, friend_node: Dict[str, Union[str, List[str]]], memo: Dict[str,str]):
        return cls(
            my_memo = friend_node.get('my_memo', ''),
            nickname = friend_node.get('nickname',''),
            username = friend_node.get('username',''),
            concern = friend_node.get('concern', []),
            node_id = friend_node.get('node_id', ''),
            about_friend_memo = memo.get('memo',''),
        )