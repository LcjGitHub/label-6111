from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Keycap, Wishlist
from app.schemas import (
    KeycapCreate,
    WishlistConvertResponse,
    WishlistCreate,
    WishlistResponse,
    WishlistUpdate,
)

router = APIRouter(prefix="/api/wishlists", tags=["wishlists"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[WishlistResponse])
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


@router.get("/{wishlist_id}", response_model=WishlistResponse)
def get_wishlist(wishlist_id: int, db: DbSession):
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="心愿单不存在")
    return wishlist


@router.post("", response_model=WishlistResponse, status_code=201)
def create_wishlist(payload: WishlistCreate, db: DbSession):
    wishlist = Wishlist(**payload.model_dump())
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)
    return wishlist


@router.put("/{wishlist_id}", response_model=WishlistResponse)
def update_wishlist(wishlist_id: int, payload: WishlistUpdate, db: DbSession):
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="心愿单不存在")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(wishlist, field, value)
    db.commit()
    db.refresh(wishlist)
    return wishlist


@router.delete("/{wishlist_id}", status_code=204)
def delete_wishlist(wishlist_id: int, db: DbSession):
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="心愿单不存在")
    db.delete(wishlist)
    db.commit()


@router.post("/{wishlist_id}/convert", response_model=WishlistConvertResponse)
def convert_wishlist_to_keycap(wishlist_id: int, db: DbSession):
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="心愿单不存在")

    notes_parts = ["转自心愿单"]
    if wishlist.notes:
        notes_parts.append(wishlist.notes)
    keycap_notes = "：".join(notes_parts)

    keycap_payload = KeycapCreate(
        name=wishlist.name,
        brand=wishlist.brand,
        color_scheme=wishlist.color_scheme,
        material="未填",
        purchase_price=wishlist.expected_price,
        notes=keycap_notes,
    )
    keycap = Keycap(**keycap_payload.model_dump())
    db.add(keycap)
    db.flush()

    db.delete(wishlist)
    db.commit()
    db.refresh(keycap)

    return WishlistConvertResponse(keycap_id=keycap.id)
