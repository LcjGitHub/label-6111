from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.migrations import run_migrations
from app.models import Brand, Keycap, KeyboardBuild, Wishlist
from app.schemas import (
    BrandCreate,
    BrandResponse,
    BrandUpdate,
    KeyboardBuildCreate,
    KeyboardBuildResponse,
    KeyboardBuildUpdate,
    KeyboardBuildWithKeycapResponse,
    KeycapCreate,
    KeycapResponse,
    KeycapStats,
    KeycapUpdate,
    WishlistConvertResponse,
    WishlistCreate,
    WishlistResponse,
    WishlistUpdate,
)
from app.seed import seed_brands, seed_keycaps, seed_keyboard_builds, seed_wishlists

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
        run_migrations(db)
        seed_keycaps(db)
        seed_wishlists(db)
        seed_brands(db)
        seed_keyboard_builds(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/brands", response_model=list[BrandResponse])
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


@app.get("/api/brands/{brand_id}", response_model=BrandResponse)
def get_brand(brand_id: int, db: DbSession):
    brand = db.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="品牌不存在")
    return brand


@app.post("/api/brands", response_model=BrandResponse, status_code=201)
def create_brand(payload: BrandCreate, db: DbSession):
    if db.query(Brand).filter(Brand.name == payload.name).first():
        raise HTTPException(status_code=400, detail="品牌名称已存在")
    brand = Brand(**payload.model_dump())
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@app.put("/api/brands/{brand_id}", response_model=BrandResponse)
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


@app.delete("/api/brands/{brand_id}", status_code=204)
def delete_brand(brand_id: int, db: DbSession):
    brand = db.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="品牌不存在")
    db.delete(brand)
    db.commit()


@app.get("/api/keycaps", response_model=list[KeycapResponse])
def list_keycaps(
    db: DbSession,
    color_scheme: str | None = Query(default=None, description="按配色名搜索"),
    brand: str | None = Query(default=None, description="按品牌搜索"),
    material: str | None = Query(default=None, description="按材质搜索"),
):
    query = db.query(Keycap)
    if color_scheme:
        query = query.filter(Keycap.color_scheme.ilike(f"%{color_scheme}%"))
    if brand:
        query = query.filter(Keycap.brand.ilike(f"%{brand}%"))
    if material:
        query = query.filter(Keycap.material.ilike(f"%{material}%"))
    return query.order_by(Keycap.id.desc()).all()


@app.get("/api/keycaps/stats", response_model=KeycapStats)
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


@app.post("/api/wishlists/{wishlist_id}/convert", response_model=WishlistConvertResponse)
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


@app.get("/api/keyboard-builds", response_model=list[KeyboardBuildWithKeycapResponse])
def list_keyboard_builds(
    db: DbSession,
    keyboard_name: str | None = Query(default=None, description="按键盘名称搜索"),
):
    query = db.query(
        KeyboardBuild,
        Keycap.name.label("keycap_name"),
        Keycap.color_scheme.label("keycap_color_scheme"),
    ).join(Keycap, KeyboardBuild.keycap_id == Keycap.id)
    if keyboard_name:
        query = query.filter(KeyboardBuild.keyboard_name.ilike(f"%{keyboard_name}%"))
    results = query.order_by(KeyboardBuild.install_date.desc(), KeyboardBuild.id.desc()).all()
    return [
        {
            **build.__dict__,
            "keycap_name": keycap_name,
            "keycap_color_scheme": keycap_color_scheme,
        }
        for build, keycap_name, keycap_color_scheme in results
    ]


@app.get("/api/keyboard-builds/{build_id}", response_model=KeyboardBuildWithKeycapResponse)
def get_keyboard_build(build_id: int, db: DbSession):
    result = (
        db.query(
            KeyboardBuild,
            Keycap.name.label("keycap_name"),
            Keycap.color_scheme.label("keycap_color_scheme"),
        )
        .join(Keycap, KeyboardBuild.keycap_id == Keycap.id)
        .filter(KeyboardBuild.id == build_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="配装记录不存在")
    build, keycap_name, keycap_color_scheme = result
    return {
        **build.__dict__,
        "keycap_name": keycap_name,
        "keycap_color_scheme": keycap_color_scheme,
    }


@app.post("/api/keyboard-builds", response_model=KeyboardBuildResponse, status_code=201)
def create_keyboard_build(payload: KeyboardBuildCreate, db: DbSession):
    if not db.get(Keycap, payload.keycap_id):
        raise HTTPException(status_code=400, detail="键帽不存在")
    build = KeyboardBuild(**payload.model_dump())
    db.add(build)
    db.commit()
    db.refresh(build)
    return build


@app.put("/api/keyboard-builds/{build_id}", response_model=KeyboardBuildResponse)
def update_keyboard_build(build_id: int, payload: KeyboardBuildUpdate, db: DbSession):
    build = db.get(KeyboardBuild, build_id)
    if not build:
        raise HTTPException(status_code=404, detail="配装记录不存在")
    update_data = payload.model_dump(exclude_unset=True)
    if "keycap_id" in update_data and not db.get(Keycap, update_data["keycap_id"]):
        raise HTTPException(status_code=400, detail="键帽不存在")
    for field, value in update_data.items():
        setattr(build, field, value)
    db.commit()
    db.refresh(build)
    return build


@app.delete("/api/keyboard-builds/{build_id}", status_code=204)
def delete_keyboard_build(build_id: int, db: DbSession):
    build = db.get(KeyboardBuild, build_id)
    if not build:
        raise HTTPException(status_code=404, detail="配装记录不存在")
    db.delete(build)
    db.commit()
