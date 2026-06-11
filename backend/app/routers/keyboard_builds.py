from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Keycap, KeyboardBuild
from app.schemas import (
    KeyboardBuildCreate,
    KeyboardBuildResponse,
    KeyboardBuildUpdate,
    KeyboardBuildWithKeycapResponse,
)

router = APIRouter(prefix="/api/keyboard-builds", tags=["keyboard-builds"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[KeyboardBuildWithKeycapResponse])
def list_keyboard_builds(
    db: DbSession,
    keyboard_name: str | None = Query(default=None, description="按键盘名称搜索"),
    keycap_id: int | None = Query(default=None, description="按键帽ID筛选"),
):
    query = db.query(
        KeyboardBuild,
        Keycap.name.label("keycap_name"),
        Keycap.color_scheme.label("keycap_color_scheme"),
    ).join(Keycap, KeyboardBuild.keycap_id == Keycap.id)
    if keyboard_name:
        query = query.filter(KeyboardBuild.keyboard_name.ilike(f"%{keyboard_name}%"))
    if keycap_id is not None:
        query = query.filter(KeyboardBuild.keycap_id == keycap_id)
    results = query.order_by(KeyboardBuild.install_date.desc(), KeyboardBuild.id.desc()).all()
    return [
        {
            **build.__dict__,
            "keycap_name": keycap_name,
            "keycap_color_scheme": keycap_color_scheme,
        }
        for build, keycap_name, keycap_color_scheme in results
    ]


@router.get("/{build_id}", response_model=KeyboardBuildWithKeycapResponse)
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


@router.post("", response_model=KeyboardBuildResponse, status_code=201)
def create_keyboard_build(payload: KeyboardBuildCreate, db: DbSession):
    if not db.get(Keycap, payload.keycap_id):
        raise HTTPException(status_code=400, detail="键帽不存在")
    build = KeyboardBuild(**payload.model_dump())
    db.add(build)
    db.commit()
    db.refresh(build)
    return build


@router.put("/{build_id}", response_model=KeyboardBuildResponse)
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


@router.delete("/{build_id}", status_code=204)
def delete_keyboard_build(build_id: int, db: DbSession):
    build = db.get(KeyboardBuild, build_id)
    if not build:
        raise HTTPException(status_code=404, detail="配装记录不存在")
    db.delete(build)
    db.commit()
