from datetime import datetime

from sqlalchemy.orm import Session

from app.models import Brand, Keycap, KeyboardBuild, Wishlist

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

WISHLIST_SEED_DATA = [
    {
        "name": "激光",
        "brand": "GMK",
        "color_scheme": "Cyan Magenta",
        "expected_price": 1100.0,
        "priority": 5,
        "notes": "赛博朋克激光配色，优先级最高",
    },
    {
        "name": "植物学",
        "brand": "GMK",
        "color_scheme": "Green Cream",
        "expected_price": 900.0,
        "priority": 3,
        "notes": "植物学绿白配色，清新自然",
    },
    {
        "name": "迷彩电",
        "brand": "SA",
        "color_scheme": "Purple Orange",
        "expected_price": 1200.0,
        "priority": 4,
        "notes": "迷彩电经典紫橙撞色，球帽高度",
    },
]


def seed_keycaps(db: Session) -> None:
    if db.query(Keycap).count() > 0:
        return
    for item in SEED_DATA:
        db.add(Keycap(**item))
    db.commit()


BRAND_SEED_DATA = [
    {
        "name": "GMK",
        "origin": "德国",
        "website": "https://www.gmkkeycaps.com",
        "notes": "德国顶级键帽制造商，以高精度双射工艺闻名",
    },
    {
        "name": "Cherry",
        "origin": "德国",
        "website": "https://www.cherry.de",
        "notes": "Cherry MX 轴体创始者，也生产原厂高度键帽",
    },
    {
        "name": "SP (Signature Plastics)",
        "origin": "美国",
        "website": "https://www.signatureplastics.com",
        "notes": "SA 与 DSA 等球帽高度的制造商，美式复古风格",
    },
]


def seed_brands(db: Session) -> None:
    if db.query(Brand).count() > 0:
        return
    for item in BRAND_SEED_DATA:
        db.add(Brand(**item))
    db.commit()


def seed_wishlists(db: Session) -> None:
    existing_names = {w.name for w in db.query(Wishlist).all()}
    for item in WISHLIST_SEED_DATA:
        if item["name"] not in existing_names:
            db.add(Wishlist(**item))
    db.commit()


KEYBOARD_BUILD_SEED_DATA = [
    {
        "keyboard_name": "Keychron Q1",
        "keycap_id": 1,
        "install_date": datetime(2025, 12, 20),
        "notes": "首次组装，搭配复古 1976 配色，手感极佳",
    },
    {
        "keyboard_name": "HHKB Professional HYBRID",
        "keycap_id": 3,
        "install_date": datetime(2026, 3, 15),
        "notes": "程序员专属，Dracula 暗夜紫粉配色提升编码心情",
    },
]


def seed_keyboard_builds(db: Session) -> None:
    if db.query(KeyboardBuild).count() > 0:
        return
    for item in KEYBOARD_BUILD_SEED_DATA:
        db.add(KeyboardBuild(**item))
    db.commit()
