from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app import database, models
from app.database import engine
from app.routers import auth, nurse, patient, admin
from app.websockets import manager

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bed Information System")

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Templates
templates = Jinja2Templates(directory="app/templates")

# Include Routers
app.include_router(auth.router)
app.include_router(nurse.router)
app.include_router(patient.router)
app.include_router(admin.router)


@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
