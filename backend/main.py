from fastapi import FastAPI
from domain.api import router as domain_api_router
from config.connection import create_ssh_tunnel

app = FastAPI()

tunnel = None


@app.on_event("startup")
async def startup_event():
    global tunnel
    tunnel = create_ssh_tunnel()
    tunnel.start()
    print("SSH 터널 시작.")


@app.on_event("shutdown")
async def close_ssh_tunnel():
    global tunnel
    tunnel.stop()
    print("SSH 터널 종료.")


app.include_router(domain_api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}
