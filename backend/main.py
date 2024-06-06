import ssl
from fastapi import FastAPI
from api.v1.api import router as api_v1_router

app = FastAPI()

from fastapi import FastAPI

from config.connection import create_ssh_tunnel, create_gremlin_client, get_persons


@app.get("/persons")
async def read_persons():
    with create_ssh_tunnel() as tunnel:
        tunnel.start()
        print("SSH 터널이 시작되었습니다. Neptune 데이터베이스에 연결합니다...")

        gremlin_client = create_gremlin_client()

        try:
            persons = get_persons(gremlin_client)
            return {"persons": persons}
        finally:
            gremlin_client.close()
            tunnel.stop()
            print("SSH 터널이 종료되었습니다.")


app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}
