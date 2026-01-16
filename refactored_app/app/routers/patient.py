from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Member, PatientAdmissionInfo, BodyData, MedTime
from app.auth import get_current_user

router = APIRouter(prefix="/patient", tags=["patient"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    # Check permissions
    if current_user.permission != "2":
        return templates.TemplateResponse(
            "login.html", {"request": request, "error": "Unauthorized access"}
        )

    # Get patient info
    patient_info = (
        db.query(PatientAdmissionInfo)
        .filter(PatientAdmissionInfo.name == current_user.name)
        .first()
    )  # Linking by name as per legacy schema logic usually
    # Note: Legacy schema relied on Names or IDs. I'll try ID first if possible or Name.
    # Current User has id_number. PatientAdmissionInfo doesn't clearly have id_number, but has 'name'.
    # Let's use Name for now as legacy did.

    body_data = db.query(BodyData).filter(BodyData.name == current_user.name).all()
    med_times = db.query(MedTime).filter(MedTime.name == current_user.name).all()

    return templates.TemplateResponse(
        "patient/index.html",
        {
            "request": request,
            "user": current_user,
            "patient_info": patient_info,
            "body_data": body_data,
            "med_times": med_times,
        },
    )
