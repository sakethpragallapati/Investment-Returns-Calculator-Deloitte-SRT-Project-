import React, { forwardRef } from 'react';
import './ReportTemplate.css';

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
  if (!iso) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// Map both API snake_case and frontend camelCase data into a unified object
function normalizeData(data, type) {
  if (!data) return {};
  
  if (type === 'api') {
    return {
      land: data.land,
      building: data.building,
      newMachinery: data.new_machinery,
      refurbMachinery: data.refurb_machinery,
      isGoiEval: data.is_goi_evaluated,
      isRented: data.is_rented_building,
      employment: data.employment,
      buildingIncl: data.building_included,
      refurbIncl: data.refurb_included,
      buildingCapped: data.building_included < data.building,
      refurbCapped: data.is_goi_evaluated && data.refurb_included < data.refurb_machinery,
      fci: data.fci,
      baseSubsidy: data.base_subsidy,
      megaBonus: data.mega_bonus,
      megaEligible: data.mega_bonus > 0,
      coreUncapped: (data.base_subsidy || 0) + (data.mega_bonus || 0),
      coreSubsidy: data.core_subsidy,
      coreCapped: ((data.base_subsidy || 0) + (data.mega_bonus || 0)) > 250,
      multiplierBonus: data.multiplier_bonus,
      focusArea: data.focus_area,
      anchorUnits: data.anchor_units,
      totalUncapped: data.core_subsidy + (data.multiplier_bonus || 0),
      totalSubsidy: data.total_subsidy,
      totalCapped: (data.core_subsidy + (data.multiplier_bonus || 0)) > data.fci,
      years: data.disbursement_years,
      payout: data.annual_payout,
    };
  }
  
  // Frontend local format
  return {
    land: data.inputs.landCost,
    building: data.inputs.buildingCost,
    newMachinery: data.inputs.newMachinery,
    refurbMachinery: data.inputs.refurbMachinery,
    isGoiEval: data.inputs.isGoiEval,
    isRented: data.inputs.isRented,
    employment: data.inputs.employmentCount,
    buildingIncl: data.fciResult.bIncl,
    refurbIncl: data.fciResult.rIncl,
    buildingCapped: data.fciResult.bCapped,
    refurbCapped: data.fciResult.rCapped,
    fci: data.fci,
    baseSubsidy: data.baseSubsidy,
    megaBonus: data.megaBonus,
    megaEligible: data.megaEligible,
    coreUncapped: data.coreUncapped,
    coreSubsidy: data.coreSubsidy,
    coreCapped: data.coreCapped,
    multiplierBonus: data.multiplierBonus,
    focusArea: data.multiplierType === 'focus' ? data.multiplierLabel : null,
    anchorUnits: data.multiplierType === 'anchor' ? data.multiplierLabel : null,
    totalUncapped: data.totalUncapped,
    totalSubsidy: data.totalSubsidy,
    totalCapped: data.totalCapped,
    years: data.disbursementYears,
    payout: data.annualPayout,
  };
}

const ReportTemplate = forwardRef(({ calculationData, dataType, leadInfo }, ref) => {
  const c = normalizeData(calculationData, dataType);
  const now = new Date();

  return (
    <div className="report-container" ref={ref}>
      {/* HEADER */}
      <div className="report-header">
        <div className="report-logo">
          {/* Simulated Corporate Logo Area */}
          <div className="logo-box">Advisory</div>
          <div className="logo-text">Policy Estimator</div>
        </div>
        <div className="report-title-area">
          <h1 className="report-title">Capital Subsidy Estimate</h1>
          <p className="report-subtitle">UP Electronics Manufacturing Policy 2020</p>
        </div>
      </div>

      {/* LEAD & DATE INFO */}
      <div className="report-meta">
        <div className="meta-left">
          <div className="meta-row"><strong>Company:</strong> {leadInfo?.company || 'Draft Calculation (Unsaved)'}</div>
          <div className="meta-row"><strong>Prepared For:</strong> {leadInfo?.name || '—'}</div>
          {leadInfo?.email && <div className="meta-row"><strong>Email:</strong> {leadInfo.email}</div>}
        </div>
        <div className="meta-right">
          <div className="meta-row"><strong>Date:</strong> {formatDate(leadInfo?.created_at || now.toISOString())}</div>
          <div className="meta-row"><strong>Ref ID:</strong> {leadInfo?.id ? `UPEMP-${String(leadInfo.id).padStart(6, '0')}` : 'DRAFT'}</div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="report-section highlight-section">
        <h2>Executive Summary</h2>
        <div className="exec-grid">
          <div className="exec-item">
            <span className="exec-label">Total Capital Subsidy</span>
            <span className="exec-value primary">₹{fmt(c.totalSubsidy)} <small>Cr</small></span>
          </div>
          <div className="exec-item">
            <span className="exec-label">Fixed Capital Investment (FCI)</span>
            <span className="exec-value">₹{fmt(c.fci)} <small>Cr</small></span>
          </div>
          <div className="exec-item">
            <span className="exec-label">Disbursement</span>
            <span className="exec-value">{c.years} Years</span>
            <span className="exec-sub">₹{fmt(c.payout)} Cr/year</span>
          </div>
        </div>
      </div>

      {/* STEP 1: FCI BREAKDOWN */}
      <div className="report-section page-break-inside-avoid">
        <h2>1. Investment & FCI Breakdown</h2>
        <table className="report-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Investment Value</th>
              <th>Status / Included in FCI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Land Cost</td>
              <td>₹{fmt(c.land)} Cr</td>
              <td className="status-excluded">Excluded from FCI</td>
            </tr>
            <tr>
              <td>Building Cost</td>
              <td>₹{fmt(c.building)} Cr</td>
              <td className={c.buildingCapped ? "status-capped" : "status-included"}>
                {c.buildingCapped ? `Capped at ₹${fmt(c.buildingIncl)} Cr (10%)` : `Fully included`}
              </td>
            </tr>
            <tr>
              <td>New Plant & Machinery</td>
              <td>₹{fmt(c.newMachinery)} Cr</td>
              <td className="status-included">Fully included (100%)</td>
            </tr>
            <tr>
              <td>Refurbished Machinery</td>
              <td>₹{fmt(c.refurbMachinery)} Cr</td>
              <td className={!c.isGoiEval ? "status-excluded" : c.refurbCapped ? "status-capped" : "status-included"}>
                {!c.isGoiEval ? 'Excluded (No GOI eval)' : c.refurbCapped ? `Capped at ₹${fmt(c.refurbIncl)} Cr (40%)` : `Included: ₹${fmt(c.refurbIncl)} Cr`}
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan="2"><strong>Calculated Fixed Capital Investment (FCI)</strong></td>
              <td><strong>₹{fmt(c.fci)} Cr</strong></td>
            </tr>
          </tbody>
        </table>
        <div className="report-tags">
          <span>{c.isGoiEval ? '☑' : '☐'} GOI Evaluated</span>
          <span>{c.isRented ? '☑' : '☐'} Rented/Plug & Play</span>
          <span>Employment: {(c.employment || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* STEP 2: SUBSIDY CALCULATION */}
      <div className="report-section page-break-inside-avoid">
        <h2>2. Subsidy Calculation</h2>
        <table className="report-table calc-table">
          <tbody>
            <tr>
              <td><strong>Base Subsidy (15% of FCI)</strong></td>
              <td className="amount">₹{fmt(c.baseSubsidy)} Cr</td>
            </tr>
            <tr>
              <td>
                <strong>Mega Project Bonus (10%)</strong><br/>
                <span className="muted">Criteria: FCI ≥ 1000 Cr & Employment ≥ 3000</span>
              </td>
              <td className="amount">
                {c.megaEligible ? `₹${fmt(c.megaBonus)} Cr` : 'Not Eligible'}
              </td>
            </tr>
            <tr className="subtotal-row">
              <td><strong>Core Subsidy</strong> {c.coreCapped && <span className="status-capped">(Capped at ₹250 Cr)</span>}</td>
              <td className="amount"><strong>₹{fmt(c.coreSubsidy)} Cr</strong></td>
            </tr>
            <tr>
              <td>
                <strong>Additional Incentive</strong><br/>
                <span className="muted">
                  {c.focusArea ? `Focus Area: ${c.focusArea}` : c.anchorUnits ? `Anchor: ${c.anchorUnits}` : 'None Selected'}
                </span>
              </td>
              <td className="amount">₹{fmt(c.multiplierBonus)} Cr</td>
            </tr>
            <tr className="final-total-row">
              <td>
                <strong>Total Capital Subsidy</strong>
                {c.totalCapped && <span className="status-capped"> (Capped at 100% of FCI)</span>}
              </td>
              <td className="amount">₹{fmt(c.totalSubsidy)} Cr</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER & DISCLAIMERS */}
      <div className="report-footer">
        <h3>Important Policy Notes & Disclaimers</h3>
        <ul>
          <li>This document is a preliminary estimate based on the UP Electronics Manufacturing Policy 2020.</li>
          <li>Actual subsidy is subject to final evaluation by Financial Institutions / Banks / State Government Committees.</li>
          <li>All incentives combined (excluding PLI scheme) shall not exceed 100% of the Fixed Capital Investment (FCI).</li>
          {c.totalSubsidy >= 250 && <li>As a large-scale project, rigorous auditing of employment and investment thresholds will be required prior to disbursement.</li>}
          {c.isGoiEval && <li>Refurbished machinery dispensation is limited to the first 20 investors from policy notification.</li>}
        </ul>
        <div className="footer-brand">Generated via Deloitte Policy Advisory Tool • {formatDate(now.toISOString())}</div>
      </div>

    </div>
  );
});

ReportTemplate.displayName = 'ReportTemplate';

export default ReportTemplate;
