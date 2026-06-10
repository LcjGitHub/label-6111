from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Keycap
from app.schemas import KeycapCreate, KeycapResponse, KeycapUpdate
from app.seed import seed_keycaps

app = FastAPI(title="Keycap Collection API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8101"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DbSession = Annotated[Session, Depends(get_db)]


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_keycaps(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/keycaps", response_model=list[KeycapResponse])
def list_keycaps(
    db: DbSession,
    color_scheme: str | None = Query(default=None, description="按配色名搜索"),
):
    query = db.query(Keycap)
    if color_scheme:
        query = query.filter(Keycap.color_scheme.ilike(f"%{color_scheme}%"))
    return query.order_by(Keycap.id.desc()).all()


@app.get("/api/keycaps/{keycap_id}", response_model=KeycapResponse)
def get_keycap(keycap_id: int, db: DbSession):
    keycap = db.get(Keycap, keycap_id)
    if not keycap:
        raise HTTPException(status_code=404, detail="键帽不存在")
    return keycap


@app.post("/api/keycaps", response_model=KeycapResponse, status_code=201)
def create_keycap(payload: KeycapCreate, db: DbSession):
    keycap = Keycap(**payload.model_dump())
    db.add(keycap)
    db.commit()
    db.refresh(keycap)
    return keycap


@app.put("/api/keycaps/{keycap_id}", response_model=KeycapResponse)
def update_keycap(keycap_id: int, payload: KeycapUpdate, db: DbSession):
    keycap = db.get(Keycap, keycap_id)
    if not keycap:
        raise HTTPException(status_code=404, detail="键帽不存在")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(keycap, field, value)
    db.commit()
    db.refresh(keycap)
    return keycap


@app.delete("/api/keycaps/{keycap_id}", status_code=204)
def delete_keycap(keycap_id: int, db: DbSession):
    keycap = db.get(Keycap, keycap_id)
    if not keycap:
        raise HTTPException(status_code=404, detail="键帽不存在")
    db.delete(keycap)
    db.commit()
