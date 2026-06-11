from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import KeyboardDevice
from app.schemas import (
    KeyboardDeviceCreate,
    KeyboardDeviceResponse,
    KeyboardDeviceUpdate,
)

router = APIRouter(prefix="/api/keyboard-devices", tags=["keyboard-devices"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[KeyboardDeviceResponse])
def list_keyboard_devices(
    db: DbSession,
    layout: str | None = Query(default=None, description="按配列搜索"),
    switch_type: str | None = Query(default=None, description="按轴体类型搜索"),
    name: str | None = Query(default=None, description="按设备名称搜索"),
):
    query = db.query(KeyboardDevice)

    if layout:
        query = query.filter(KeyboardDevice.layout.ilike(f"%{layout}%"))
    if switch_type:
        query = query.filter(KeyboardDevice.switch_type.ilike(f"%{switch_type}%"))
    if name:
        query = query.filter(KeyboardDevice.name.ilike(f"%{name}%"))

    return query.order_by(KeyboardDevice.id.desc()).all()


@router.get("/{device_id}", response_model=KeyboardDeviceResponse)
def get_keyboard_device(device_id: int, db: DbSession):
    device = db.get(KeyboardDevice, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="键盘设备不存在")
    return device


@router.post("", response_model=KeyboardDeviceResponse, status_code=201)
def create_keyboard_device(payload: KeyboardDeviceCreate, db: DbSession):
    device = KeyboardDevice(**payload.model_dump())
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.put("/{device_id}", response_model=KeyboardDeviceResponse)
def update_keyboard_device(
    device_id: int, payload: KeyboardDeviceUpdate, db: DbSession
):
    device = db.get(KeyboardDevice, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="键盘设备不存在")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(device, field, value)
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}", status_code=204)
def delete_keyboard_device(device_id: int, db: DbSession):
    device = db.get(KeyboardDevice, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="键盘设备不存在")
    db.delete(device)
    db.commit()
