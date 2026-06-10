from pydantic import BaseModel, ConfigDict, Field


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
