from fastapi import FastAPI
from domain.api import router as domain_api_router
from utils import Logger
from config.connection import create_ssh_tunnel

app = FastAPI()
logger = Logger("main.py")

tunnel = None


@app.on_event("startup")
async def startup_event():
    global tunnel
    tunnel = create_ssh_tunnel()
    tunnel.start()
    logger.info("SSH 터널이 시작되었습니다. Neptune 데이터베이스에 연결합니다...")


@app.on_event("shutdown")
async def close_ssh_tunnel():
    global tunnel
    tunnel.stop()
    logger.info("SSH 터널이 종료되었습니다.")


app.include_router(domain_api_router, prefix="/domain")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}
