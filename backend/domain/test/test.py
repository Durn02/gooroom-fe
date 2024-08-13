from utils import Logger
from config.connection import get_driver
from fastapi import APIRouter, HTTPException, Depends

router = APIRouter()
logger = Logger(__file__)

@router.get("/nodes/")
async def read_nodes(driver = Depends(get_driver)):

    session = driver.session()
    try:
        result = session.run("MATCH (n) RETURN n LIMIT 10")
        nodes = []
        for record in result:
            nodes.append(record["n"])
        return {"nodes": nodes}
    finally:
        session.close()
