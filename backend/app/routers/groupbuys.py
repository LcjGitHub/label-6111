from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GroupBuy
from app.schemas import (
    GroupBuyCreate,
    GroupBuyResponse,
    GroupBuyUpdate,
)

router = APIRouter(prefix="/api/groupbuys", tags=["groupbuys"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[GroupBuyResponse])
def list_groupbuys(
    db: DbSession,
    status: str | None = Query(default=None, description="按状态过滤"),
    product_name: str | None = Query(default=None, description="按商品名称搜索"),
):
    query = db.query(GroupBuy)
    if status:
        query = query.filter(GroupBuy.status == status)
    if product_name:
        query = query.filter(GroupBuy.product_name.ilike(f"%{product_name}%"))
    return query.order_by(GroupBuy.end_date.asc(), GroupBuy.id.desc()).all()


@router.get("/{groupbuy_id}", response_model=GroupBuyResponse)
def get_groupbuy(groupbuy_id: int, db: DbSession):
    groupbuy = db.get(GroupBuy, groupbuy_id)
    if not groupbuy:
        raise HTTPException(status_code=404, detail="团购不存在")
    return groupbuy


@router.post("", response_model=GroupBuyResponse, status_code=201)
def create_groupbuy(payload: GroupBuyCreate, db: DbSession):
    groupbuy = GroupBuy(**payload.model_dump())
    db.add(groupbuy)
    db.commit()
    db.refresh(groupbuy)
    return groupbuy


@router.put("/{groupbuy_id}", response_model=GroupBuyResponse)
def update_groupbuy(groupbuy_id: int, payload: GroupBuyUpdate, db: DbSession):
    groupbuy = db.get(GroupBuy, groupbuy_id)
    if not groupbuy:
        raise HTTPException(status_code=404, detail="团购不存在")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(groupbuy, field, value)
    db.commit()
    db.refresh(groupbuy)
    return groupbuy


@router.delete("/{groupbuy_id}", status_code=204)
def delete_groupbuy(groupbuy_id: int, db: DbSession):
    groupbuy = db.get(GroupBuy, groupbuy_id)
    if not groupbuy:
        raise HTTPException(status_code=404, detail="团购不存在")
    db.delete(groupbuy)
    db.commit()
