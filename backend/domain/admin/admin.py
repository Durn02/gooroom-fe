# backend/domain/admin/admin.py
from fastapi import APIRouter

router = APIRouter()

access_token = "access_token"


@router.post("/admin/user/delete")
@router.post("/admin/user/get-users-detail")
def get_users_detail(request: Request, response: Response):
    token = request.cookies.get(access_token)
    print("token :", token)

    if token:
        response.delete_cookie(key=access_token)
        return SignOutResponse(message="logout success")
    else:
        return SignOutResponse(message="not logined")
