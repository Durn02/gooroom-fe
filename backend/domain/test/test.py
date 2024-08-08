from utils import Logger
from config.connection import create_gremlin_client
from fastapi import APIRouter, HTTPException, Depends

router = APIRouter()
logger = Logger(__file__)


@router.get("/create-node")
async def create_nodes(name: str, user_id: str, client=Depends(create_gremlin_client)):
    logger.info("노드 정보 생성")
    try:
        query = f"""g.addV().property(id, '{user_id}').property('name', '{name}')"""
        result = client.submit(query).all().result()
        query = """graph.io(IoCore.graphson()).writeGraph("test.json")"""
        result = client.submit(query).all().result()
        logger.info("/nodes 200 ok")
        print(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        logger.info("노드 정보 생성 완료")
        client.close()


# 노드 정보 조회(테스트용)
@router.get("/get-node")
async def get_nodes(client=Depends(create_gremlin_client)):
    logger.info("노드 정보 조회")
    try:
        query = """g.V().valueMap(true)"""
        result = client.submit(query).all().result()
        logger.info("/nodes 200 ok")
        print(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        logger.info("노드 정보 조회 완료")
        client.close()
