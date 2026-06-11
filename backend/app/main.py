from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Keycap, Wishlist
from app.schemas import (
    KeycapCreate,
    KeycapResponse,
    KeycapUpdate,
    WishlistCreate,
    WishlistResponse,
    WishlistUpdate,
)
from app.seed import seed_keycaps, seed_wishlists

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
        seed_wishlists(db)
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


@app.get("/api/wishlists", response_model=list[WishlistResponse])
def list_wishlists(
    db: DbSession,
    color_scheme: str | None = Query(default=None, description="按配色名搜索"),
    priority: int | None = Query(default=None, description="按优先级过滤"),
):
    query = db.query(Wishlist)
    if color_scheme:
        query = query.filter(Wishlist.color_scheme.ilike(f"%{color_scheme}%"))
    if priority is not None:
        query = query.filter(Wishlist.priority == priority)
    return query.order_by(Wishlist.priority.desc(), Wishlist.id.desc()).all()


@app.get("/api/wishlists/{wishlist_id}", response_model=WishlistResponse)
def get_wishlist(wishlist_id: int, db: DbSession):
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="心愿单不存在")
    return wishlist


@app.post("/api/wishlists", response_model=WishlistResponse, status_code=201)
def create_wishlist(payload: WishlistCreate, db: DbSession):
    wishlist = Wishlist(**payload.model_dump())
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)
    return wishlist


@app.put("/api/wishlists/{wishlist_id}", response_model=WishlistResponse)
def update_wishlist(wishlist_id: int, payload: WishlistUpdate, db: DbSession):
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="心愿单不存在")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(wishlist, field, value)
    db.commit()
    db.refresh(wishlist)
    return wishlist


@app.delete("/api/wishlists/{wishlist_id}", status_code=204)
def delete_wishlist(wishlist_id: int, db: DbSession):
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="心愿单不存在")
    db.delete(wishlist)
    db.commit()
