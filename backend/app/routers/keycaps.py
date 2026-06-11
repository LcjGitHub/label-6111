from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Keycap, KeyboardBuild
from app.schemas import KeycapCreate, KeycapResponse, KeycapStats, KeycapUpdate

router = APIRouter(prefix="/api/keycaps", tags=["keycaps"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[KeycapResponse])
def list_keycaps(
    db: DbSession,
    color_scheme: str | None = Query(default=None, description="按配色名搜索"),
    brand: str | None = Query(default=None, description="按品牌搜索"),
    material: str | None = Query(default=None, description="按材质搜索"),
):
    build_count_subq = (
        db.query(
            KeyboardBuild.keycap_id.label("keycap_id"),
            func.count(KeyboardBuild.id).label("count"),
        )
        .group_by(KeyboardBuild.keycap_id)
        .subquery()
    )

    query = db.query(
        Keycap,
        func.coalesce(build_count_subq.c.count, 0).label("keyboard_build_count"),
    ).outerjoin(
        build_count_subq,
        Keycap.id == build_count_subq.c.keycap_id,
    )

    if color_scheme:
        query = query.filter(Keycap.color_scheme.ilike(f"%{color_scheme}%"))
    if brand:
        query = query.filter(Keycap.brand.ilike(f"%{brand}%"))
    if material:
        query = query.filter(Keycap.material.ilike(f"%{material}%"))

    results = query.order_by(Keycap.id.desc()).all()

    return [
        {
            **keycap.__dict__,
            "keyboard_build_count": keyboard_build_count,
        }
        for keycap, keyboard_build_count in results
    ]


@router.get("/stats", response_model=KeycapStats)
def get_keycap_stats(db: DbSession):
    total_count = db.query(func.count(Keycap.id)).scalar() or 0
    total_purchase_price = (
        db.query(func.sum(func.coalesce(Keycap.purchase_price, 0))).scalar() or 0
    )

    priced_count = (
        db.query(func.count(Keycap.id))
        .filter(Keycap.purchase_price.isnot(None))
        .scalar() or 0
    )

    avg_purchase_price = None
    if priced_count > 0:
        avg_value = (
            db.query(func.avg(Keycap.purchase_price))
            .filter(Keycap.purchase_price.isnot(None))
            .scalar()
        )
        if avg_value is not None:
            avg_purchase_price = round(float(avg_value), 2)

    by_brand = (
        db.query(Keycap.brand, func.count(Keycap.id).label("count"))
        .group_by(Keycap.brand)
        .order_by(func.count(Keycap.id).desc())
        .all()
    )
    by_material = (
        db.query(Keycap.material, func.count(Keycap.id).label("count"))
        .group_by(Keycap.material)
        .order_by(func.count(Keycap.id).desc())
        .all()
    )

    return KeycapStats(
        total_count=total_count,
        total_purchase_price=float(total_purchase_price),
        avg_purchase_price=avg_purchase_price,
        priced_count=priced_count,
        by_brand=[{"name": name, "count": count} for name, count in by_brand],
        by_material=[{"name": name, "count": count} for name, count in by_material],
    )


@router.get("/{keycap_id}", response_model=KeycapResponse)
def get_keycap(keycap_id: int, db: DbSession):
    build_count = (
        db.query(func.count(KeyboardBuild.id))
        .filter(KeyboardBuild.keycap_id == keycap_id)
        .scalar()
        or 0
    )
    keycap = db.get(Keycap, keycap_id)
    if not keycap:
        raise HTTPException(status_code=404, detail="键帽不存在")
    return {
        **keycap.__dict__,
        "keyboard_build_count": build_count,
    }


@router.post("", response_model=KeycapResponse, status_code=201)
def create_keycap(payload: KeycapCreate, db: DbSession):
    keycap = Keycap(**payload.model_dump())
    db.add(keycap)
    db.commit()
    db.refresh(keycap)
    return keycap


@router.put("/{keycap_id}", response_model=KeycapResponse)
def update_keycap(keycap_id: int, payload: KeycapUpdate, db: DbSession):
    keycap = db.get(Keycap, keycap_id)
    if not keycap:
        raise HTTPException(status_code=404, detail="键帽不存在")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(keycap, field, value)
    db.commit()
    db.refresh(keycap)
    return keycap


@router.delete("/{keycap_id}", status_code=204)
def delete_keycap(keycap_id: int, db: DbSession):
    keycap = db.get(Keycap, keycap_id)
    if not keycap:
        raise HTTPException(status_code=404, detail="键帽不存在")
    db.delete(keycap)
    db.commit()
