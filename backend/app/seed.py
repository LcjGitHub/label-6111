from sqlalchemy.orm import Session

from app.models import Keycap

SEED_DATA = [
    {
        "name": "1976",
        "brand": "SA",
        "color_scheme": "Retro Rainbow",
        "material": "ABS",
        "purchase_price": 1200.0,
        "notes": "经典复古配色，1976 年风格渐变",
    },
    {
        "name": "Oblivion",
        "brand": "GMK",
        "color_scheme": "Grey Orange",
        "material": "ABS",
        "purchase_price": 980.0,
        "notes": "赛博朋克灰橙配色，偏冷门",
    },
    {
        "name": "Dracula",
        "brand": "GMK",
        "color_scheme": "Purple Pink",
        "material": "ABS",
        "purchase_price": 850.0,
        "notes": "暗夜紫粉，程序员社区小众热门",
    },
    {
        "name": "Bento",
        "brand": "GMK",
        "color_scheme": "Salmon Cream",
        "material": "ABS",
        "purchase_price": 720.0,
        "notes": "日式便当盒灵感，三文鱼色主调",
    },
    {
        "name": "Nautilus",
        "brand": "SA",
        "color_scheme": "Deep Sea Blue",
        "material": "PBT",
        "purchase_price": 1350.0,
        "notes": "鹦鹉螺深海蓝，球帽高度",
    },
]


def seed_keycaps(db: Session) -> None:
    if db.query(Keycap).count() > 0:
        return
    for item in SEED_DATA:
        db.add(Keycap(**item))
    db.commit()
