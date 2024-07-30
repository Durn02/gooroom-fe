import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import HTTPException
import os

from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"


def create_access_token(user_node_id: str) -> str:
    to_encode = {
        "user_node_id": user_node_id,
        "exp": datetime.now() + timedelta(hours=1),
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
