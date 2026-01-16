from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Member
from app.auth import verify_password, create_access_token

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@router.post("/login")
async def login(
    request: Request,
    userid: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = db.query(Member).filter(Member.userid == userid).first()
    if not user or not verify_password(password, user.password):
        return templates.TemplateResponse(
            "login.html", {"request": request, "error": "Invalid username or password"}
        )

    # Create Token
    access_token = create_access_token(
        data={"sub": user.userid, "role": user.identity, "name": user.name}
    )

    # Redirect based on role
    if user.permission == "1":  # Nurse
        response = RedirectResponse(
            url="/nurse/dashboard", status_code=status.HTTP_303_SEE_OTHER
        )
    elif user.permission == "0":  # Admin
        response = RedirectResponse(
            url="/admin/users", status_code=status.HTTP_303_SEE_OTHER
        )
    else:  # Patient
        response = RedirectResponse(
            url="/patient/dashboard", status_code=status.HTTP_303_SEE_OTHER
        )

    response.set_cookie(
        key="access_token", value=f"Bearer {access_token}", httponly=True
    )
    return response


@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=status.HTTP_303_SEE_OTHER)
    response.delete_cookie("access_token")
    return response
