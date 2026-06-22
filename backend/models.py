"""
UPEMP 2020 Capital Subsidy Calculator — Pydantic Models
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


# ── Enums ──

class FocusSector(str, Enum):
    DRONES = "DRONES"
    IOT = "IOT"
    DEFENSE = "DEFENSE"
    STRATEGIC = "STRATEGIC"
    ROBOTICS = "ROBOTICS"


class AnchorCount(str, Enum):
    ONE_TO_FIVE = "1_TO_5"
    SIX_TO_TEN = "6_TO_10"
    MORE_THAN_TEN = "MORE_THAN_10"


class IncentiveType(str, Enum):
    NONE = "none"
    FOCUS = "focus"
    ANCHOR = "anchor"


# ── Request Models ──

class CalculateRequest(BaseModel):
    land_cost: float = Field(ge=0, description="Land cost in ₹ Cr (excluded from FCI)")
    building_cost: float = Field(ge=0, description="Building cost in ₹ Cr")
    new_machinery: float = Field(gt=0, description="New plant & machinery in ₹ Cr")
    refurb_machinery: float = Field(ge=0, description="Refurbished machinery in ₹ Cr")
    is_goi_evaluated: bool = Field(default=False, description="GOI evaluation for refurbished P&M")
    is_rented_building: bool = Field(default=False, description="Plug & Play / Rented building")
    employment_count: int = Field(ge=0, description="Expected employment generation")
    incentive_type: IncentiveType = Field(default=IncentiveType.NONE)
    focus_sector: Optional[FocusSector] = Field(default=None)
    anchor_count: Optional[AnchorCount] = Field(default=None)


class SaveLeadRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    company: str = Field(min_length=1, max_length=200)
    email: str = Field(min_length=1, max_length=200)
    contact_number: Optional[str] = Field(default=None, max_length=20)
    calculation: CalculateRequest


# ── Response Models ──

class FCIResult(BaseModel):
    fci: float
    building_included: float
    refurb_included: float
    building_capped: bool
    refurb_capped: bool
    case_used: int


class EligibilityItem(BaseModel):
    name: str
    reason: str


class CalculateResponse(BaseModel):
    inputs: dict
    fci_result: FCIResult
    fci: float
    base_subsidy: float
    mega_bonus: float
    mega_eligible: bool
    mega_reason: str
    core_uncapped: float
    core_subsidy: float
    core_capped: bool
    multiplier_bonus: float
    multiplier_type: str
    multiplier_rate: float
    multiplier_label: str
    multiplier_eligible: bool
    multiplier_reason: str
    total_uncapped: float
    total_subsidy: float
    total_capped: bool
    disbursement_years: int
    disbursement_tier: str
    disbursement_note: str
    annual_payout: float
    eligible: list[EligibilityItem]
    not_eligible: list[EligibilityItem]
