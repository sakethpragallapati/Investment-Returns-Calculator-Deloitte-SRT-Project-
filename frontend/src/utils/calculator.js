/*
 * UPEMP 2020 — Client-side Calculation Engine
 * Mirrors backend/calculator.py exactly for live preview.
 * All monetary values in INR Crores (₹ Cr).
 */

// ─── FCI Closed-Form Solver ─────────────────────
export function calculateFCI(newMachinery, buildingCost, refurbMachinery, isGoiEval) {
  const P = newMachinery;
  const B = buildingCost;
  const R = isGoiEval ? refurbMachinery : 0;

  // Case 1: Neither capped
  const provisional = P + B + R;
  if (provisional > 0 && B <= 0.10 * provisional && R <= 0.40 * provisional) {
    return { fci: provisional, bIncl: B, rIncl: R, bCapped: false, rCapped: false, caseUsed: 1 };
  }

  // Case 2: Only Building capped
  if (P + R > 0) {
    const fci2 = (P + R) / 0.90;
    const b2 = 0.10 * fci2;
    if (B > b2 && R <= 0.40 * fci2) {
      return { fci: fci2, bIncl: b2, rIncl: R, bCapped: true, rCapped: false, caseUsed: 2 };
    }
  }

  // Case 3: Only Refurbished capped
  if (P + B > 0) {
    const fci3 = (P + B) / 0.60;
    const r3 = 0.40 * fci3;
    if (R > r3 && B <= 0.10 * fci3) {
      return { fci: fci3, bIncl: B, rIncl: r3, bCapped: false, rCapped: true, caseUsed: 3 };
    }
  }

  // Case 4: Both capped
  const fci4 = P / 0.50;
  return { fci: fci4, bIncl: 0.10 * fci4, rIncl: 0.40 * fci4, bCapped: true, rCapped: true, caseUsed: 4 };
}

// ─── Full Subsidy Calculation ────────────────────
export function performCalculation(inputs) {
  const {
    landCost, buildingCost, newMachinery, refurbMachinery,
    isGoiEval, isRented, employmentCount,
    incentiveType, focusSector, anchorCount,
  } = inputs;

  // Step 1: FCI
  const fciResult = calculateFCI(newMachinery, buildingCost, refurbMachinery, isGoiEval);
  const fci = fciResult.fci;

  // Step 2: Base Subsidy
  const baseSubsidy = fci * 0.15;

  // Step 3: Mega Bonus
  let megaBonus = 0, megaEligible = false, megaReason = '';
  if (fci >= 1000 && employmentCount >= 3000) {
    megaBonus = Math.min((fci - 1000) * 0.10, 100);
    megaEligible = true;
    megaReason = `Your FCI (₹${fmt(fci)} Cr) ≥ ₹1,000 Cr and employment (${employmentCount.toLocaleString()}) ≥ 3,000.`;
  } else {
    const reasons = [];
    if (fci < 1000) reasons.push(`FCI (₹${fmt(fci)} Cr) is below ₹1,000 Cr threshold`);
    if (employmentCount < 3000) reasons.push(`Employment (${employmentCount.toLocaleString()}) is below 3,000 minimum`);
    megaReason = reasons.join(' and ') + '.';
  }

  // Step 4: Core Subsidy Cap
  const coreUncapped = baseSubsidy + megaBonus;
  const coreSubsidy = Math.min(coreUncapped, 250);
  const coreCapped = coreUncapped > 250;

  // Step 5: Multiplier Bonus
  let multiplierBonus = 0, multiplierType = 'none', multiplierRate = 0;
  let multiplierLabel = '', multiplierEligible = false, multiplierReason = '';

  const FOCUS_NAMES = {
    DRONES: 'Drones & Components', IOT: 'Internet of Things (IoT)',
    DEFENSE: 'Defense Electronics', STRATEGIC: 'Strategic Electronics', ROBOTICS: 'Robotics',
  };
  const ANCHOR_LABELS = {
    '1_TO_5': '1 to 5 ancillary units', '6_TO_10': '6 to 10 ancillary units',
    MORE_THAN_10: 'More than 10 ancillary units',
  };
  const ANCHOR_RATES = { '1_TO_5': 0.015, '6_TO_10': 0.025, MORE_THAN_10: 0.05 };

  if (incentiveType === 'focus' && focusSector) {
    multiplierRate = 0.05;
    multiplierBonus = fci * multiplierRate;
    multiplierType = 'focus';
    multiplierLabel = `Focus Area: ${FOCUS_NAMES[focusSector] || focusSector}`;
    multiplierEligible = true;
    multiplierReason = `Your unit qualifies under the ${FOCUS_NAMES[focusSector]} focus sector — eligible for 5% additional capital subsidy.`;
  } else if (incentiveType === 'anchor' && anchorCount) {
    multiplierRate = ANCHOR_RATES[anchorCount] || 0;
    multiplierBonus = fci * multiplierRate;
    multiplierType = 'anchor';
    multiplierLabel = `Anchor Unit: ${ANCHOR_LABELS[anchorCount]}`;
    multiplierEligible = true;
    multiplierReason = `Your unit qualifies as an Anchor Unit with ${ANCHOR_LABELS[anchorCount]} — eligible for ${(multiplierRate * 100).toFixed(1)}% additional capital subsidy.`;
  }

  // Step 6: Total & Cap
  const totalUncapped = coreSubsidy + multiplierBonus;
  const totalSubsidy = Math.min(totalUncapped, fci);
  const totalCapped = totalUncapped > fci;

  // Step 7: Disbursement
  let disbursementYears, disbursementTier, disbursementNote;
  if (isRented) {
    disbursementYears = 5;
    disbursementTier = 'Plug & Play / Rented Building';
    disbursementNote = 'Capital subsidy for units in rented/Plug & Play buildings is disbursed in 5 yearly installments after commencement of commercial production.';
  } else if (fci >= 1000) {
    disbursementYears = 5;
    disbursementTier = 'Tier 3 (FCI ≥ ₹1,000 Cr)';
    disbursementNote = 'First installment will be released from the year in which the unit achieves commercial production at minimum 80% of its total capacity.';
  } else if (fci > 200) {
    disbursementYears = 3;
    disbursementTier = 'Tier 2 (₹200 Cr < FCI < ₹1,000 Cr)';
    disbursementNote = 'Subsidy is payable in 3 yearly installments after commencement of commercial production.';
  } else {
    disbursementYears = 1;
    disbursementTier = 'Tier 1 (FCI ≤ ₹200 Cr)';
    disbursementNote = 'Subsidy is payable as a lump sum after commencement of commercial production.';
  }
  const annualPayout = totalSubsidy / disbursementYears;

  // Eligibility
  const eligible = [];
  const notEligible = [];

  if (fci > 0) {
    eligible.push({ name: 'Base Capital Subsidy (15%)', reason: `All units with a valid FCI are eligible. Your FCI of ₹${fmt(fci)} Cr qualifies for ₹${fmt(baseSubsidy)} Cr.` });
  }
  if (megaEligible) {
    eligible.push({ name: 'Mega Project Bonus (10%)', reason: `${megaReason} Bonus: ₹${fmt(megaBonus)} Cr.` });
  } else {
    notEligible.push({ name: 'Mega Project Bonus (10%)', reason: megaReason });
  }
  if (multiplierEligible) {
    eligible.push({ name: multiplierLabel, reason: multiplierReason });
  }
  if (incentiveType === 'none') {
    notEligible.push({ name: 'Focus Area Bonus (5%)', reason: 'No additional incentive category was selected.' });
    notEligible.push({ name: 'Anchor Unit Bonus (1.5%–5%)', reason: 'No additional incentive category was selected.' });
  } else if (incentiveType === 'focus') {
    notEligible.push({ name: 'Anchor Unit Bonus (1.5%–5%)', reason: 'Mutually exclusive with Focus Area incentive — you selected Focus Area.' });
  } else if (incentiveType === 'anchor') {
    notEligible.push({ name: 'Focus Area Bonus (5%)', reason: 'Mutually exclusive with Anchor Unit incentive — you selected Anchor Unit.' });
  }
  if (refurbMachinery > 0 && !isGoiEval) {
    notEligible.push({ name: 'Refurbished Machinery in FCI', reason: `You entered ₹${fmt(refurbMachinery)} Cr in refurbished machinery, but GOI evaluation is not enabled. This amount was excluded from FCI.` });
  }

  return {
    inputs, fciResult, fci, baseSubsidy, megaBonus, megaEligible, megaReason,
    coreUncapped, coreSubsidy, coreCapped,
    multiplierBonus, multiplierType, multiplierRate, multiplierLabel, multiplierEligible, multiplierReason,
    totalUncapped, totalSubsidy, totalCapped,
    disbursementYears, disbursementTier, disbursementNote, annualPayout,
    eligible, notEligible,
  };
}

export function fmt(num) {
  return num.toFixed(2);
}
