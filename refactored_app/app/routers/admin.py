from fastapi import APIRouter, Depends, Request, Form, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Member
from app.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/users", response_class=HTMLResponse)
async def list_users(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "0":
        return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

    users = db.query(Member).all()
    return templates.TemplateResponse(
        "admin/users.html", {"request": request, "user": current_user, "users": users}
    )


@router.post("/users")
async def create_user(
    request: Request,
    id_number: str = Form(...),
    name: str = Form(...),
    userid: str = Form(...),
    password: str = Form(...),
    permission: str = Form(...),
    identity: str = Form(...),
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "0":
        return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

    existing = (
        db.query(Member)
        .filter((Member.userid == userid) | (Member.id_number == id_number))
        .first()
    )
    if existing:
        users = db.query(Member).all()
        return templates.TemplateResponse(
            "admin/users.html",
            {
                "request": request,
                "user": current_user,
                "users": users,
                "error": "User with this ID or UserID already exists",
            },
        )

    # In a real app we would hash the password here.
    # For compatibility with seed_data approach (plaintext for now as per comments), we store as is.
    # But ideally should be hashed. Let's stick to simple consistency with seed_data logic.
    new_user = Member(
        id_number=id_number,
        name=name,
        userid=userid,
        password=password,  # In production: hash this!
        permission=permission,
        identity=identity,
    )
    db.add(new_user)
    db.commit()

    return RedirectResponse(url="/admin/users", status_code=status.HTTP_303_SEE_OTHER)


@router.delete("/users/{id_number}")
async def delete_user(
    id_number: str,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "0":
        return HTMLResponse(status_code=403)

    if id_number == current_user.id_number:
        return HTMLResponse(status_code=400, content="Cannot delete yourself")

    user_to_delete = db.query(Member).filter(Member.id_number == id_number).first()
    if not user_to_delete:
        return HTMLResponse(status_code=404)

    db.delete(user_to_delete)
    db.commit()
    return HTMLResponse(status_code=200)
