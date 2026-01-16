from fastapi import APIRouter, Depends, Request, status, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from app.websockets import manager
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Member,
    BedManage,
    ResponsibleNurse,
    BodyData,
)
from app.auth import get_current_user

router = APIRouter(prefix="/nurse", tags=["nurse"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    # Check permissions
    if current_user.permission not in ["1", "0"]:
        return templates.TemplateResponse(
            "login.html", {"request": request, "error": "Unauthorized access"}
        )

    # Get responsible nurse info
    nurse_info = (
        db.query(ResponsibleNurse)
        .filter(ResponsibleNurse.id_number == current_user.id_number)
        .first()
    )

    # Process patients for alerts
    patients_data = []
    if nurse_info:
        for p_attr in ["p1", "p2", "p3", "p4"]:
            p_name = getattr(nurse_info, p_attr)
            if p_name:
                # Get latest body data
                latest_data = (
                    db.query(BodyData)
                    .filter(BodyData.name == p_name)
                    .order_by(BodyData.date.desc(), BodyData.id.desc())
                    .first()
                )

                is_fever = False
                temp = "N/A"
                if latest_data and latest_data.T:
                    temp = latest_data.T
                    try:
                        if float(temp) > 38.0:
                            is_fever = True
                    except ValueError:
                        pass

                patients_data.append(
                    {"name": p_name, "temp": temp, "is_fever": is_fever}
                )

    # Get recent shift notes
    from app.models import ShiftNote

    shift_notes = db.query(ShiftNote).order_by(ShiftNote.id.desc()).limit(10).all()

    # Get all beds
    beds = db.query(BedManage).all()

    return templates.TemplateResponse(
        "nurse/index.html",
        {
            "request": request,
            "user": current_user,
            "nurse_info": nurse_info,  # Kept for backward compatibility if needed
            "patients_data": patients_data,
            "shift_notes": shift_notes,
            "beds": beds,
        },
    )


@router.get("/beds", response_class=HTMLResponse)
async def nurse_beds(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

    beds = db.query(BedManage).all()
    return templates.TemplateResponse(
        "nurse/beds.html", {"request": request, "user": current_user, "beds": beds}
    )


@router.post("/beds/{bed_id}/clear")
async def clear_bed(
    bed_id: str,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

    bed = db.query(BedManage).filter(BedManage.id_number == bed_id).first()
    if bed:
        bed.name = None
        bed.p_condition = "空床"
        db.commit()
        await manager.broadcast("bed_update")

    return RedirectResponse(url="/nurse/beds", status_code=status.HTTP_303_SEE_OTHER)


@router.post("/beds/{bed_id}/update")
async def update_bed(
    bed_id: str,
    name: str = Form(None),
    p_condition: str = Form(...),
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

    bed = db.query(BedManage).filter(BedManage.id_number == bed_id).first()
    if bed:
        bed.name = name if name else None
        bed.p_condition = p_condition
        db.commit()
        await manager.broadcast("bed_update")

    return RedirectResponse(url="/nurse/beds", status_code=status.HTTP_303_SEE_OTHER)


@router.post("/patient/vitals")
async def add_vitals(
    name: str = Form(...),
    temperature: str = Form(...),
    bp_sys: int = Form(None),
    bp_dia: int = Form(None),
    pulse: int = Form(None),
    remark: str = Form(None),
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

    from datetime import datetime

    current_date = datetime.now().strftime("%Y-%m-%d")

    new_data = BodyData(
        name=name,
        T=temperature,
        bp_sys=bp_sys,
        bp_dia=bp_dia,
        pulse=pulse,
        date=current_date,
        remark=remark,
    )
    db.add(new_data)
    db.commit()

    await manager.broadcast("bed_update")

    return RedirectResponse(
        url="/nurse/dashboard", status_code=status.HTTP_303_SEE_OTHER
    )


@router.post("/notes")
async def create_note(
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

    from datetime import datetime
    from app.models import ShiftNote

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M")

    new_note = ShiftNote(
        content=content, author_id=current_user.id_number, created_at=current_time
    )
    db.add(new_note)
    db.commit()

    await manager.broadcast("bed_update")  # Reuse existing event to trigger reload

    return RedirectResponse(
        url="/nurse/dashboard", status_code=status.HTTP_303_SEE_OTHER
    )


@router.delete("/notes/{note_id}")
async def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return HTMLResponse(status_code=403)

    from app.models import ShiftNote

    note = db.query(ShiftNote).filter(ShiftNote.id == note_id).first()
    if not note:
        return HTMLResponse(status_code=404)

    # Allow deleting if user is author OR some admin rule (here simplest: author only)
    if note.author_id != current_user.id_number:
        return HTMLResponse(status_code=403, content="Not your note")

    db.delete(note)
    db.commit()
    await manager.broadcast("bed_update")
    return HTMLResponse(status_code=200)


@router.put("/notes/{note_id}")
async def update_note(
    note_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return HTMLResponse(status_code=403)

    from app.models import ShiftNote

    note = db.query(ShiftNote).filter(ShiftNote.id == note_id).first()
    if not note:
        return HTMLResponse(status_code=404)

    if note.author_id != current_user.id_number:
        return HTMLResponse(status_code=403, content="Not your note")

    note.content = content
    db.commit()
    await manager.broadcast("bed_update")
    return HTMLResponse(status_code=200)


@router.get("/patient/{name}/history")
async def get_patient_history(
    name: str,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return []

    records = (
        db.query(BodyData)
        .filter(BodyData.name == name)
        .order_by(BodyData.date.desc(), BodyData.id.desc())
        .limit(20)
        .all()
    )

    # Reverse to show oldest to newest in chart
    data = [
        {
            "date": r.date,
            "temp": r.T,
            "pulse": r.pulse,
            "bp_sys": r.bp_sys,
            "bp_dia": r.bp_dia,
            "remark": r.remark,
        }
        for r in reversed(records)
    ]
    return data


@router.get("/patient/{name}/export")
async def export_patient_history(
    name: str,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_user),
):
    if current_user.permission != "1":
        return HTMLResponse(status_code=403)

    records = (
        db.query(BodyData)
        .filter(BodyData.name == name)
        .order_by(BodyData.date.desc(), BodyData.id.desc())
        .all()
    )

    import csv
    import io
    from fastapi.responses import StreamingResponse

    output = io.StringIO()
    writer = csv.writer(output)
    # Header
    writer.writerow(
        ["Date", "Name", "Temperature", "Pulse", "BP_Sys", "BP_Dia", "Remark"]
    )

    for r in records:
        writer.writerow(
            [
                r.date,
                r.name,
                r.T,
                r.pulse if r.pulse else "",
                r.bp_sys if r.bp_sys else "",
                r.bp_dia if r.bp_dia else "",
                r.remark if r.remark else "",
            ]
        )

    output.seek(0)

    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={name}_history.csv"
    return response
