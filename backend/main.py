"""
UPEMP 2020 Capital Subsidy Calculator — FastAPI Backend
"""

import csv
import io
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

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


# ─── GET /api/leads ───────────────────────────────
@app.get("/api/leads")
def api_get_leads(
    search: str = Query(default="", description="Search by company name or email"),
    db: Session = Depends(get_db),
):
    """
    Return all leads and their calculations.
    Supports optional search filtering by company name or email.
    """
    query = db.query(Lead).order_by(Lead.created_at.desc())

    if search.strip():
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Lead.company.ilike(pattern),
                Lead.email.ilike(pattern),
                Lead.name.ilike(pattern),
            )
        )

    leads = query.all()
    results = []
    for lead in leads:
        calc = lead.calculations[0] if lead.calculations else None
        results.append({
            "id": lead.id,
            "name": lead.name,
            "company": lead.company,
            "email": lead.email,
            "contact_number": lead.contact_number,
            "created_at": lead.created_at.isoformat() if lead.created_at else None,
            "calculation": {
                "land": calc.raw_land,
                "building": calc.raw_building,
                "new_machinery": calc.raw_new_machinery,
                "refurb_machinery": calc.raw_refurb_machinery,
                "is_goi_evaluated": calc.is_goi_evaluated,
                "is_rented_building": calc.is_rented_building,
                "employment": calc.employment_count,
                "is_focus_area": calc.is_focus_area,
                "focus_area": calc.focus_area_type,
                "anchor_units": calc.anchor_units,
                "building_included": calc.building_included,
                "refurb_included": calc.refurb_included,
                "fci": calc.calc_fci,
                "base_subsidy": calc.base_subsidy,
                "mega_bonus": calc.mega_bonus,
                "core_subsidy": calc.core_subsidy_capped,
                "multiplier_bonus": calc.multiplier_bonus,
                "total_subsidy": calc.total_subsidy,
                "disbursement_years": calc.disbursement_years,
                "annual_payout": calc.disbursement_per_year,
            } if calc else None,
        })

    return {"leads": results, "total": len(results)}


# ─── GET /api/dashboard-stats ─────────────────────
@app.get("/api/dashboard-stats")
def api_dashboard_stats(db: Session = Depends(get_db)):
    """
    Aggregate analytics for the admin dashboard.
    """
    total_leads = db.query(func.count(Lead.id)).scalar() or 0
    total_subsidy = db.query(func.sum(Calculation.total_subsidy)).scalar() or 0.0
    avg_fci = db.query(func.avg(Calculation.calc_fci)).scalar() or 0.0
    total_employment = db.query(func.sum(Calculation.employment_count)).scalar() or 0

    return {
        "total_leads": total_leads,
        "total_subsidy_processed": round(total_subsidy, 2),
        "average_fci": round(avg_fci, 2),
        "total_employment": total_employment,
    }


# ─── GET /api/export-csv ──────────────────────────
@app.get("/api/export-csv")
def api_export_csv(db: Session = Depends(get_db)):
    """
    Stream all leads + calculations as a downloadable CSV file.
    """
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "Lead ID", "Name", "Company", "Email", "Contact", "Date",
        "Land (₹ Cr)", "Building (₹ Cr)", "New Machinery (₹ Cr)",
        "Refurb Machinery (₹ Cr)", "Employment",
        "FCI (₹ Cr)", "Base Subsidy (₹ Cr)", "Mega Bonus (₹ Cr)",
        "Core Subsidy (₹ Cr)", "Multiplier Bonus (₹ Cr)",
        "Total Subsidy (₹ Cr)", "Disbursement Years", "Annual Payout (₹ Cr)",
        "Focus Area", "Anchor Units",
    ])

    for lead in leads:
        calc = lead.calculations[0] if lead.calculations else None
        writer.writerow([
            lead.id,
            lead.name,
            lead.company,
            lead.email,
            lead.contact_number or "",
            lead.created_at.strftime("%Y-%m-%d %H:%M") if lead.created_at else "",
            calc.raw_land if calc else "",
            calc.raw_building if calc else "",
            calc.raw_new_machinery if calc else "",
            calc.raw_refurb_machinery if calc else "",
            calc.employment_count if calc else "",
            calc.calc_fci if calc else "",
            calc.base_subsidy if calc else "",
            calc.mega_bonus if calc else "",
            calc.core_subsidy_capped if calc else "",
            calc.multiplier_bonus if calc else "",
            calc.total_subsidy if calc else "",
            calc.disbursement_years if calc else "",
            calc.disbursement_per_year if calc else "",
            calc.focus_area_type if calc else "",
            calc.anchor_units if calc else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=upemp2020_leads_export.csv"},
    )


# ─── Health Check ─────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "upemp2020-calculator"}
