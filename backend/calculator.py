"""
UPEMP 2020 Capital Subsidy Calculator — Calculation Engine
All monetary values in INR Crores (₹ Cr)
"""


def calculate_fci(new_machinery: float, building_cost: float, refurb_machinery: float, is_goi_evaluated: bool) -> dict:
    """
    Closed-form FCI calculation.
    Evaluates 4 algebraic cases to resolve circular cap dependencies.
    """
    P = new_machinery
    B = building_cost
    R = refurb_machinery if is_goi_evaluated else 0.0

    # Case 1: Neither capped
    provisional = P + B + R
    if provisional > 0 and B <= 0.10 * provisional and R <= 0.40 * provisional:
        return {
            "fci": round(provisional, 2),
            "building_included": round(B, 2),
            "refurb_included": round(R, 2),
            "building_capped": False,
            "refurb_capped": False,
            "case_used": 1,
        }

    # Case 2: Only Building capped
    if P + R > 0:
        fci2 = (P + R) / 0.90
        b2 = 0.10 * fci2
        if B > b2 and R <= 0.40 * fci2:
            return {
                "fci": round(fci2, 2),
                "building_included": round(b2, 2),
                "refurb_included": round(R, 2),
                "building_capped": True,
                "refurb_capped": False,
                "case_used": 2,
            }

    # Case 3: Only Refurbished capped
    if P + B > 0:
        fci3 = (P + B) / 0.60
        r3 = 0.40 * fci3
        if R > r3 and B <= 0.10 * fci3:
            return {
                "fci": round(fci3, 2),
                "building_included": round(B, 2),
                "refurb_included": round(r3, 2),
                "building_capped": False,
                "refurb_capped": True,
                "case_used": 3,
            }

    # Case 4: Both capped
    fci4 = P / 0.50
    b4 = 0.10 * fci4
    r4 = 0.40 * fci4
    return {
        "fci": round(fci4, 2),
        "building_included": round(b4, 2),
        "refurb_included": round(r4, 2),
        "building_capped": True,
        "refurb_capped": True,
        "case_used": 4,
    }


def calculate_subsidy(
    land_cost: float,
    building_cost: float,
    new_machinery: float,
    refurb_machinery: float,
    is_goi_evaluated: bool,
    is_rented_building: bool,
    employment_count: int,
    incentive_type: str,       # "none" | "focus" | "anchor"
    focus_sector: str | None,  # "DRONES" | "IOT" | "DEFENSE" | "STRATEGIC" | "ROBOTICS"
    anchor_count: str | None,  # "1_TO_5" | "6_TO_10" | "MORE_THAN_10"
) -> dict:
    """Full subsidy calculation pipeline — Steps 1 through 7."""

    # ── Step 1: FCI ──
    fci_result = calculate_fci(new_machinery, building_cost, refurb_machinery, is_goi_evaluated)
    fci = fci_result["fci"]

    # ── Step 2: Base Subsidy (15%) ──
    base_subsidy = round(fci * 0.15, 2)

    # ── Step 3: Mega Project Bonus ──
    mega_bonus = 0.0
    mega_eligible = False
    mega_reason = ""

    if fci >= 1000 and employment_count >= 3000:
        mega_bonus = round(min((fci - 1000) * 0.10, 100), 2)
        mega_eligible = True
        mega_reason = (
            f"Your FCI (₹{fci:.2f} Cr) ≥ ₹1,000 Cr and "
            f"employment ({employment_count:,}) ≥ 3,000."
        )
    else:
        reasons = []
        if fci < 1000:
            reasons.append(f"FCI (₹{fci:.2f} Cr) is below ₹1,000 Cr threshold")
        if employment_count < 3000:
            reasons.append(f"Employment ({employment_count:,}) is below 3,000 minimum")
        mega_reason = " and ".join(reasons) + "."

    # ── Step 4: Core Subsidy Cap (₹250 Cr) ──
    core_uncapped = round(base_subsidy + mega_bonus, 2)
    core_subsidy = round(min(core_uncapped, 250), 2)
    core_capped = core_uncapped > 250

    # ── Step 5: Multiplier Bonus ──
    multiplier_bonus = 0.0
    multiplier_type = "none"
    multiplier_rate = 0.0
    multiplier_label = ""
    multiplier_eligible = False
    multiplier_reason = ""

    focus_sector_names = {
        "DRONES": "Drones & Components",
        "IOT": "Internet of Things (IoT)",
        "DEFENSE": "Defense Electronics",
        "STRATEGIC": "Strategic Electronics",
        "ROBOTICS": "Robotics",
    }

    anchor_labels = {
        "1_TO_5": "1 to 5 ancillary units",
        "6_TO_10": "6 to 10 ancillary units",
        "MORE_THAN_10": "More than 10 ancillary units",
    }

    anchor_rates = {
        "1_TO_5": 0.015,
        "6_TO_10": 0.025,
        "MORE_THAN_10": 0.05,
    }

    if incentive_type == "focus" and focus_sector:
        multiplier_rate = 0.05
        multiplier_bonus = round(fci * multiplier_rate, 2)
        multiplier_type = "focus"
        sector_name = focus_sector_names.get(focus_sector, focus_sector)
        multiplier_label = f"Focus Area: {sector_name}"
        multiplier_eligible = True
        multiplier_reason = (
            f"Your unit qualifies under the {sector_name} focus sector — "
            f"eligible for 5% additional capital subsidy."
        )
    elif incentive_type == "anchor" and anchor_count:
        multiplier_rate = anchor_rates.get(anchor_count, 0)
        multiplier_bonus = round(fci * multiplier_rate, 2)
        multiplier_type = "anchor"
        label = anchor_labels.get(anchor_count, anchor_count)
        multiplier_label = f"Anchor Unit: {label}"
        multiplier_eligible = True
        multiplier_reason = (
            f"Your unit qualifies as an Anchor Unit with {label} — "
            f"eligible for {multiplier_rate * 100:.1f}% additional capital subsidy."
        )

    # ── Step 6: Total & Overall Cap ──
    total_uncapped = round(core_subsidy + multiplier_bonus, 2)
    total_subsidy = round(min(total_uncapped, fci), 2)
    total_capped = total_uncapped > fci

    # ── Step 7: Disbursement Schedule ──
    if is_rented_building:
        disbursement_years = 5
        disbursement_tier = "Plug & Play / Rented Building"
        disbursement_note = (
            "Capital subsidy for units in rented/Plug & Play buildings is "
            "disbursed in 5 yearly installments after commencement of commercial production."
        )
    elif fci >= 1000:
        disbursement_years = 5
        disbursement_tier = "Tier 3 (FCI ≥ ₹1,000 Cr)"
        disbursement_note = (
            "First installment will be released from the year in which the unit "
            "achieves commercial production at minimum 80% of its total capacity."
        )
    elif fci > 200:
        disbursement_years = 3
        disbursement_tier = "Tier 2 (₹200 Cr < FCI < ₹1,000 Cr)"
        disbursement_note = (
            "Subsidy is payable in 3 yearly installments after commencement of commercial production."
        )
    else:
        disbursement_years = 1
        disbursement_tier = "Tier 1 (FCI ≤ ₹200 Cr)"
        disbursement_note = (
            "Subsidy is payable as a lump sum after commencement of commercial production."
        )

    annual_payout = round(total_subsidy / disbursement_years, 2)

    # ── Eligibility Assessment ──
    eligible = []
    not_eligible = []

    if fci > 0:
        eligible.append({
            "name": "Base Capital Subsidy (15%)",
            "reason": (
                f"All units with a valid FCI are eligible. "
                f"Your FCI of ₹{fci:.2f} Cr qualifies for ₹{base_subsidy:.2f} Cr."
            ),
        })

    if mega_eligible:
        eligible.append({
            "name": "Mega Project Bonus (10%)",
            "reason": f"{mega_reason} Bonus: ₹{mega_bonus:.2f} Cr.",
        })
    else:
        not_eligible.append({
            "name": "Mega Project Bonus (10%)",
            "reason": mega_reason,
        })

    if multiplier_eligible:
        eligible.append({
            "name": multiplier_label,
            "reason": multiplier_reason,
        })

    if incentive_type == "none":
        not_eligible.append({
            "name": "Focus Area Bonus (5%)",
            "reason": "No additional incentive category was selected.",
        })
        not_eligible.append({
            "name": "Anchor Unit Bonus (1.5%–5%)",
            "reason": "No additional incentive category was selected.",
        })
    elif incentive_type == "focus":
        not_eligible.append({
            "name": "Anchor Unit Bonus (1.5%–5%)",
            "reason": "Mutually exclusive with Focus Area incentive — you selected Focus Area.",
        })
    elif incentive_type == "anchor":
        not_eligible.append({
            "name": "Focus Area Bonus (5%)",
            "reason": "Mutually exclusive with Anchor Unit incentive — you selected Anchor Unit.",
        })

    if refurb_machinery > 0 and not is_goi_evaluated:
        not_eligible.append({
            "name": "Refurbished Machinery in FCI",
            "reason": (
                f"You entered ₹{refurb_machinery:.2f} Cr in refurbished machinery, "
                f"but GOI evaluation is not enabled. This amount was excluded from FCI."
            ),
        })

    return {
        "inputs": {
            "land_cost": land_cost,
            "building_cost": building_cost,
            "new_machinery": new_machinery,
            "refurb_machinery": refurb_machinery,
            "is_goi_evaluated": is_goi_evaluated,
            "is_rented_building": is_rented_building,
            "employment_count": employment_count,
            "incentive_type": incentive_type,
            "focus_sector": focus_sector,
            "anchor_count": anchor_count,
        },
        "fci_result": fci_result,
        "fci": fci,
        "base_subsidy": base_subsidy,
        "mega_bonus": mega_bonus,
        "mega_eligible": mega_eligible,
        "mega_reason": mega_reason,
        "core_uncapped": core_uncapped,
        "core_subsidy": core_subsidy,
        "core_capped": core_capped,
        "multiplier_bonus": multiplier_bonus,
        "multiplier_type": multiplier_type,
        "multiplier_rate": multiplier_rate,
        "multiplier_label": multiplier_label,
        "multiplier_eligible": multiplier_eligible,
        "multiplier_reason": multiplier_reason,
        "total_uncapped": total_uncapped,
        "total_subsidy": total_subsidy,
        "total_capped": total_capped,
        "disbursement_years": disbursement_years,
        "disbursement_tier": disbursement_tier,
        "disbursement_note": disbursement_note,
        "annual_payout": annual_payout,
        "eligible": eligible,
        "not_eligible": not_eligible,
    }
