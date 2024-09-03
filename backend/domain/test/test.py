from utils import Logger
from config.connection import get_session
from fastapi import APIRouter, HTTPException, Depends
from .dummy import CREATE_DUMMY_NODES_QUERY, CREATE_DUMMY_EDGES_QUERY

router = APIRouter()
logger = Logger(__file__)


@router.get("/nodes")
async def read_nodes(session=Depends(get_session)):
    try:
        logger.info("get nodes - test")
        result = session.run("MATCH (n) RETURN n")
        nodes = []
        for record in result:
            nodes.append(record["n"])
        return {"nodes": nodes}
    finally:
        session.close()


@router.post("/dummy_create")
async def dummy_create(
    session=Depends(get_session),
):
    logger.info("dummy-create")

    try:

        query = CREATE_DUMMY_NODES_QUERY
        result = session.run(query)

        if "data already exists" in [d["value.message"] for d in result.data()]:
            raise HTTPException(status_code=400, detail="Data already exists")

        query = CREATE_DUMMY_EDGES_QUERY
        result = session.run(query)
        record = result.single()

        if record is None:
            raise HTTPException(status_code=400, detail="Failed to create dummy data")

        return "creating dummy data successfully"

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
