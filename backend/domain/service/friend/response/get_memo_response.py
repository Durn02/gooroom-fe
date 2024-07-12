from pydantic import BaseModel

class GetMemoResponse(BaseModel):
    memo: str