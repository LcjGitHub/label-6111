from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, get_db
from app.migrations import run_migrations
from app.routers.brands import router as brands_router
from app.routers.keyboard_builds import router as keyboard_builds_router
from app.routers.keycaps import router as keycaps_router
from app.routers.wishlists import router as wishlists_router
from app.seed import seed_brands, seed_keycaps, seed_keyboard_builds, seed_wishlists

app = FastAPI(title="Keycap Collection API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8101"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


app.include_router(brands_router)
app.include_router(keycaps_router)
app.include_router(wishlists_router)
app.include_router(keyboard_builds_router)
