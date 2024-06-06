import ssl
from config.constants.ssh import ssh_host, ssh_port, ssh_user, ssh_key_path
from config.constants.neptune import neptune_endpoint, neptune_port
from fastapi import FastAPI
from api.v1.api import router as api_v1_router
from sshtunnel import SSHTunnelForwarder
from gremlin_python.driver import client as gremlin_client, serializer
# from config.database import connect_to_db, close_db_connection
# from config.connection import NeptuneConnection

app = FastAPI()

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE
tunnel = None


# SSH 터널링 설정
def create_ssh_tunnel():
    tunnel = SSHTunnelForwarder(
        (ssh_host, ssh_port),
        ssh_username=ssh_user,
        ssh_private_key=ssh_key_path,
        remote_bind_address=(neptune_endpoint, neptune_port),
        local_bind_address=("localhost", 8182),
    )
    return tunnel


def create_gremlin_client():
    client = gremlin_client.Client(
        "wss://localhost:8182/gremlin",
        "g",
        message_serializer=serializer.GraphSONSerializersV3d0(),
        ssl_context=ssl_context,  # SSL 인증서 검증 비활성화
    )
    return client


# 그래프 탐색 함수
def get_persons(gremlin_client):
    query = "g.V()"
    result = gremlin_client.submit(query).all().result()
    return result

@app.event.on('startup')
async def connect_to_ssh():
    tunnel = create_ssh_tunnel()
    tunnel.start()
    print("SSH 터널이 시작되었습니다. Neptune 데이터베이스에 연결합니다...")

@app.event.on('shutup')
async def close_ssh_tunnel():
    tunnel.stop()


@app.get("/persons")
async def read_persons():
        gremlin_client = create_gremlin_client()

        try:
            persons = get_persons(gremlin_client)
            return {"persons": persons}
        finally:
            gremlin_client.close()
            tunnel.stop()
            print("SSH 터널이 종료되었습니다.")

# @app.get("/persons")
# async def read_persons():
#     with create_ssh_tunnel() as tunnel:
#         tunnel.start()
#         print("SSH 터널이 시작되었습니다. Neptune 데이터베이스에 연결합니다...")

#         gremlin_client = create_gremlin_client()

#         try:
#             persons = get_persons(gremlin_client)
#             return {"persons": persons}
#         finally:
#             gremlin_client.close()
#             tunnel.stop()
#             print("SSH 터널이 종료되었습니다.")


app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}
