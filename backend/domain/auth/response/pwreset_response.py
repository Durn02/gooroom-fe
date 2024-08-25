from pydantic import BaseModel


class PwResetResponse(BaseModel):
    message: str = "pw reset"
