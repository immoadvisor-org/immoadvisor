import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Catalogo pubblico dei pacchetti (public.sales_packages)
# ---------------------------------------------------------------------------


class SalesPackageRead(BaseModel):
    id: uuid.UUID
    slug: str
    monthly_price_chf: Decimal
    featured: bool
    installments: int
    allow_single_payment: bool
    name: str
    featured_label: str | None = None
    includes_label: str | None = None
    features: list[str]


# ---------------------------------------------------------------------------
# Testi della pagina "Pacchetti di vendita" (public.sales_packages_content)
# ---------------------------------------------------------------------------


class SalesPackageComparisonRowInput(BaseModel):
    name: str
    description: str = ""
    individualPrice: str
    basic: str = ""
    medium: str = ""
    allInclusive: str = ""


class SalesPackagesTranslationInput(BaseModel):
    title: str
    subtitle: str
    comparisonRows: list[SalesPackageComparisonRowInput] = []
    monthlyFeeLabel: str
    notes: list[str] = []
    buyLabel: str


class SalesPackagesContentRead(SalesPackagesTranslationInput):
    """Contenuto risolto per una singola lingua, quello che consuma il pubblico."""


class SalesPackagesContentAdminRead(BaseModel):
    translations: dict[str, SalesPackagesTranslationInput]


class SalesPackagesContentAdminUpdate(BaseModel):
    translations: dict[str, SalesPackagesTranslationInput]


# ---------------------------------------------------------------------------
# Amministrazione del catalogo pacchetti (stesso pattern di admin_service.py)
# ---------------------------------------------------------------------------


class SalesPackageTranslationInput(BaseModel):
    name: str
    featuredLabel: str | None = None
    includesLabel: str | None = None
    features: list[str] = []


class AdminSalesPackageBase(BaseModel):
    slug: str
    monthly_price_chf: Decimal
    featured: bool = False
    active: bool = True
    display_order: int = 0
    installments: int = 4
    allow_single_payment: bool = True
    translations: dict[str, SalesPackageTranslationInput]


class AdminSalesPackageCreate(AdminSalesPackageBase):
    pass


class AdminSalesPackageUpdate(BaseModel):
    slug: str | None = None
    monthly_price_chf: Decimal | None = None
    featured: bool | None = None
    active: bool | None = None
    display_order: int | None = None
    installments: int | None = None
    allow_single_payment: bool | None = None
    translations: dict[str, SalesPackageTranslationInput] | None = None


class AdminSalesPackageRead(AdminSalesPackageBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID


class SalesPackageReorderItem(BaseModel):
    id: uuid.UUID
    display_order: int


class SalesPackageReorderRequest(BaseModel):
    items: list[SalesPackageReorderItem]
