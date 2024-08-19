import os
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
from fastapi import HTTPException
import jwt
from .logger import Logger

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

logger = Logger(__file__)


def create_access_token(user_node_id: str) -> str:
    logger.info("create access token(func)")
    to_encode = {
        "user_node_id": user_node_id,
        "exp": int((datetime.now() + timedelta(hours=1)).timestamp()),
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_node_id: str) -> str:
    logger.info("create refresh token(func)")
    to_encode = {
        "user_node_id": user_node_id,
        "exp": int((datetime.now() + timedelta(days=30)).timestamp()),
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# def refresh_access_token(token: str) -> str:
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
#         user_node_id = payload.get("user_node_id")
#         return create_access_token(user_node_id)
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(status_code=401, detail="token has expired")
#     except jwt.InvalidTokenError:
#         raise HTTPException(status_code=401, detail="invalid token")


def verify_access_token(token: str) -> dict:
    try:
        logger.info("verify access token(func)")
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        if payload.get("exp") < int(datetime.now().timestamp()):
            raise HTTPException(status_code=401, detail="token has expired")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="invalid token")


# def verify_access_token(token: str) -> bool:
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
#         session = get_session()
#         query = f"""
#         MATCH (n {{node_id: "{payload.get("user_node_id")}"}})
#         RETURN n
#         """
#         record = session.run(query).single()

#         if not record:
#             return False
#         if payload.get("exp") < int(datetime.now(timezone.utc).timestamp()):
#             return False

#         return True
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(status_code=401, detail="Token has expired")
#     except jwt.InvalidTokenError:
#         raise HTTPException(status_code=401, detail="Invalid token")


def verify_refresh_token(token: str) -> dict:
    try:
        logger.info("verify refresh token(func)")
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        if payload.get("exp") < int(datetime.now().timestamp()):
            raise HTTPException(status_code=401, detail="token has expired")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="invalid token")
