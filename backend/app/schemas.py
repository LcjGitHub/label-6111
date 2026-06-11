from datetime import datetime

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
    keycap_count: int = 0


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
    created_at: datetime
    updated_at: datetime
    keyboard_build_count: int = 0


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


class WishlistConvertResponse(BaseModel):
    keycap_id: int


class KeyboardBuildBase(BaseModel):
    keyboard_name: str = Field(..., min_length=1, max_length=200)
    keycap_id: int = Field(..., ge=1)
    install_date: datetime
    notes: str | None = None


class KeyboardBuildCreate(KeyboardBuildBase):
    pass


class KeyboardBuildUpdate(BaseModel):
    keyboard_name: str | None = Field(default=None, min_length=1, max_length=200)
    keycap_id: int | None = Field(default=None, ge=1)
    install_date: datetime | None = None
    notes: str | None = None


class KeyboardBuildResponse(KeyboardBuildBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class KeyboardBuildWithKeycapResponse(KeyboardBuildResponse):
    keycap_name: str
    keycap_color_scheme: str


class GroupCount(BaseModel):
    name: str
    count: int


class KeycapStats(BaseModel):
    total_count: int
    total_purchase_price: float
    avg_purchase_price: float | None
    priced_count: int
    by_brand: list[GroupCount]
    by_material: list[GroupCount]


class KeyboardDeviceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    layout: str = Field(..., min_length=1, max_length=50)
    switch_type: str = Field(..., min_length=1, max_length=100)
    purchase_date: datetime
    notes: str | None = None


class KeyboardDeviceCreate(KeyboardDeviceBase):
    pass


class KeyboardDeviceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    layout: str | None = Field(default=None, min_length=1, max_length=50)
    switch_type: str | None = Field(default=None, min_length=1, max_length=100)
    purchase_date: datetime | None = None
    notes: str | None = None


class KeyboardDeviceResponse(KeyboardDeviceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class GroupBuyBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=200)
    brand: str = Field(..., min_length=1, max_length=100)
    platform: str = Field(..., min_length=1, max_length=100)
    pre_sale_price: float | None = Field(default=None, ge=0)
    end_date: datetime
    status: str = Field(..., min_length=1, max_length=20)
    notes: str | None = None


class GroupBuyCreate(GroupBuyBase):
    pass


class GroupBuyUpdate(BaseModel):
    product_name: str | None = Field(default=None, min_length=1, max_length=200)
    brand: str | None = Field(default=None, min_length=1, max_length=100)
    platform: str | None = Field(default=None, min_length=1, max_length=100)
    pre_sale_price: float | None = Field(default=None, ge=0)
    end_date: datetime | None = None
    status: str | None = Field(default=None, min_length=1, max_length=20)
    notes: str | None = None


class GroupBuyResponse(GroupBuyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
