from pydantic import BaseModel

class ModifyMemoResponse(BaseModel):
    message: str = "Memo modified successfully"