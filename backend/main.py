"""
UPEMP 2020 Capital Subsidy Calculator — FastAPI Backend
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from models import CalculateRequest, CalculateResponse, SaveLeadRequest
from calculator import calculate_subsidy
from database import get_db, init_db, Lead, Calculation

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    try:
        init_db()
    except Exception:
        # Database may not be configured yet — that's okay for development
        pass
    yield

app = FastAPI(
    title="UPEMP 2020 Capital Subsidy Calculator API",
    description="Backend API for the UP Electronics Manufacturing Policy 2020 calculator.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





# ─── POST /api/calculate ─────────────────────────
@app.post("/api/calculate", response_model=CalculateResponse)
def api_calculate(req: CalculateRequest):
    """
    Full calculation: FCI + all subsidies + disbursement schedule.
    This is the source of truth — frontend calculations are for preview only.
    """
    # Validate mutual exclusivity
    if req.incentive_type == "focus" and req.anchor_count is not None:
        raise HTTPException(400, "Focus Area and Anchor Unit are mutually exclusive.")
    if req.incentive_type == "anchor" and req.focus_sector is not None:
        raise HTTPException(400, "Anchor Unit and Focus Area are mutually exclusive.")

    result = calculate_subsidy(
        land_cost=req.land_cost,
        building_cost=req.building_cost,
        new_machinery=req.new_machinery,
        refurb_machinery=req.refurb_machinery,
        is_goi_evaluated=req.is_goi_evaluated,
        is_rented_building=req.is_rented_building,
        employment_count=req.employment_count,
        incentive_type=req.incentive_type,
        focus_sector=req.focus_sector,
        anchor_count=req.anchor_count,
    )

    return result


# ─── POST /api/calculate-preview ─────────────────
@app.post("/api/calculate-preview", response_model=CalculateResponse)
def api_calculate_preview(req: CalculateRequest):
    """
    Lightweight preview — same calculation, no DB write.
    Used for live UI updates during form fill.
    """
    return api_calculate(req)


# ─── POST /api/save-lead ─────────────────────────
@app.post("/api/save-lead")
def api_save_lead(req: SaveLeadRequest, db: Session = Depends(get_db)):
    """
    Save the lead + final calculation to the database.
    """
    calc_data = req.calculation
    result = calculate_subsidy(
        land_cost=calc_data.land_cost,
        building_cost=calc_data.building_cost,
        new_machinery=calc_data.new_machinery,
        refurb_machinery=calc_data.refurb_machinery,
        is_goi_evaluated=calc_data.is_goi_evaluated,
        is_rented_building=calc_data.is_rented_building,
        employment_count=calc_data.employment_count,
        incentive_type=calc_data.incentive_type,
        focus_sector=calc_data.focus_sector,
        anchor_count=calc_data.anchor_count,
    )

    # Create Lead
    lead = Lead(
        name=req.name,
        company=req.company,
        email=req.email,
        contact_number=req.contact_number,
    )
    db.add(lead)
    db.flush()

    # Create Calculation
    calculation = Calculation(
        lead_id=lead.id,
        raw_land=calc_data.land_cost,
        raw_building=calc_data.building_cost,
        raw_new_machinery=calc_data.new_machinery,
        raw_refurb_machinery=calc_data.refurb_machinery,
        is_goi_evaluated=calc_data.is_goi_evaluated,
        is_rented_building=calc_data.is_rented_building,
        employment_count=calc_data.employment_count,
        is_focus_area=calc_data.incentive_type == "focus",
        focus_area_type=calc_data.focus_sector,
        anchor_units=calc_data.anchor_count,
        building_included=result["fci_result"]["building_included"],
        refurb_included=result["fci_result"]["refurb_included"],
        calc_fci=result["fci"],
        base_subsidy=result["base_subsidy"],
        mega_bonus=result["mega_bonus"],
        core_subsidy_capped=result["core_subsidy"],
        multiplier_bonus=result["multiplier_bonus"],
        total_subsidy=result["total_subsidy"],
        disbursement_years=result["disbursement_years"],
        disbursement_per_year=result["annual_payout"],
    )
    db.add(calculation)
    db.commit()
    db.refresh(lead)

    return {
        "message": "Lead saved successfully",
        "lead_id": lead.id,
        "result": result,
    }


# ─── Health Check ─────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "upemp2020-calculator"}
