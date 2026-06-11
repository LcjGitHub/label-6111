from pydantic import BaseModel, ConfigDict, Field


class BrandBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    origin: str | None = Field(default=None, max_length=200)
    website: str | None = Field(default=None, max_length=500)
    notes: str | None = None


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    origin: str | None = Field(default=None, max_length=200)
    website: str | None = Field(default=None, max_length=500)
    notes: str | None = None


class BrandResponse(BrandBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class KeycapBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    brand: str = Field(..., min_length=1, max_length=100)
    color_scheme: str = Field(..., min_length=1, max_length=100)
    material: str = Field(..., min_length=1, max_length=50)
    purchase_price: float | None = Field(default=None, ge=0)
    notes: str | None = None


class KeycapCreate(KeycapBase):
    pass


class KeycapUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    brand: str | None = Field(default=None, min_length=1, max_length=100)
    color_scheme: str | None = Field(default=None, min_length=1, max_length=100)
    material: str | None = Field(default=None, min_length=1, max_length=50)
    purchase_price: float | None = Field(default=None, ge=0)
    notes: str | None = None


class KeycapResponse(KeycapBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class WishlistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    brand: str = Field(..., min_length=1, max_length=100)
    color_scheme: str = Field(..., min_length=1, max_length=100)
    expected_price: float | None = Field(default=None, ge=0)
    priority: int = Field(..., ge=1, le=5)
    notes: str | None = None


class WishlistCreate(WishlistBase):
    pass


class WishlistUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    brand: str | None = Field(default=None, min_length=1, max_length=100)
    color_scheme: str | None = Field(default=None, min_length=1, max_length=100)
    expected_price: float | None = Field(default=None, ge=0)
    priority: int | None = Field(default=None, ge=1, le=5)
    notes: str | None = None


class WishlistResponse(WishlistBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class GroupCount(BaseModel):
    name: str
    count: int


class KeycapStats(BaseModel):
    total_count: int
    total_purchase_price: float
    by_brand: list[GroupCount]
    by_material: list[GroupCount]
