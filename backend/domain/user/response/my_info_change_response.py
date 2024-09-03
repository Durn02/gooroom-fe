from pydantic import BaseModel, Field
from typing import List


class MyInfoChangeResponse(BaseModel):
    message: str
