from pydantic import BaseModel

class ModifyMemoRequest(BaseModel):
    user_node_id:str
    new_memo:str
