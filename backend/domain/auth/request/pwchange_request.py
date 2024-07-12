from pydantic import BaseModel


class PwChangeRequest(BaseModel):
    currentpw: str
    changepw: str
