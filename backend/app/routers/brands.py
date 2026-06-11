from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Brand, Keycap
from app.schemas import BrandCreate, BrandResponse, BrandUpdate

router = APIRouter(prefix="/api/brands", tags=["brands"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[BrandResponse])
def list_brands(
    db: DbSession,
    name: str | None = Query(default=None, description="按品牌名称搜索"),
):
    keycap_count_subq = (
        db.query(
            Keycap.brand.label("brand_name"),
            func.count(Keycap.id).label("count"),
        )
        .group_by(Keycap.brand)
        .subquery()
    )

    query = db.query(
        Brand,
        func.coalesce(keycap_count_subq.c.count, 0).label("keycap_count"),
    ).outerjoin(
        keycap_count_subq,
        Brand.name == keycap_count_subq.c.brand_name,
    )

    if name:
        query = query.filter(Brand.name.ilike(f"%{name}%"))

    results = query.order_by(Brand.id.desc()).all()

    return [
        {
            **brand.__dict__,
            "keycap_count": keycap_count,
        }
        for brand, keycap_count in results
    ]


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(brand_id: int, db: DbSession):
    brand = db.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="品牌不存在")
    return brand


@router.post("", response_model=BrandResponse, status_code=201)
def create_brand(payload: BrandCreate, db: DbSession):
    if db.query(Brand).filter(Brand.name == payload.name).first():
        raise HTTPException(status_code=400, detail="品牌名称已存在")
    brand = Brand(**payload.model_dump())
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(brand_id: int, payload: BrandUpdate, db: DbSession):
    brand = db.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="品牌不存在")
    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != brand.name:
        if db.query(Brand).filter(Brand.name == update_data["name"]).first():
            raise HTTPException(status_code=400, detail="品牌名称已存在")
    for field, value in update_data.items():
        setattr(brand, field, value)
    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/{brand_id}", status_code=204)
def delete_brand(brand_id: int, db: DbSession):
    brand = db.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="品牌不存在")
    db.delete(brand)
    db.commit()
