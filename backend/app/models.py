from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Brand(Base):
    __tablename__ = "brands"
    __table_args__ = (UniqueConstraint("name", name="uq_brand_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    origin: Mapped[str | None] = mapped_column(String(200), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class Keycap(Base):
    __tablename__ = "keycaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    color_scheme: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    material: Mapped[str] = mapped_column(String(50), nullable=False)
    purchase_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )


class Wishlist(Base):
    __tablename__ = "wishlists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    color_scheme: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    expected_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class KeyboardBuild(Base):
    __tablename__ = "keyboard_builds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    keyboard_name: Mapped[str] = mapped_column(String(200), nullable=False)
    keycap_id: Mapped[int] = mapped_column(ForeignKey("keycaps.id"), nullable=False, index=True)
    install_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    keycap: Mapped[Keycap] = relationship("Keycap")


class KeyboardDevice(Base):
    __tablename__ = "keyboard_devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    layout: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    switch_type: Mapped[str] = mapped_column(String(100), nullable=False)
    purchase_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class GroupBuy(Base):
    __tablename__ = "groupbuys"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    platform: Mapped[str] = mapped_column(String(100), nullable=False)
    pre_sale_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
