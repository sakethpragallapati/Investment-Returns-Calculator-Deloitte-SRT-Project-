import { useState } from 'react';
import { fmt } from '../utils/calculator';
import './Results.css';

export default function Results({ result, onRecalculate }) {
  const r = result;

  return (
    <div className="results animate-in">

      {/* ═══ HERO SUMMARY ═══ */}
      <div className="result-hero">
        <div className="result-hero-label">Your Estimated Total Capital Subsidy</div>
        <div className="result-hero-amount">
          ₹{fmt(r.totalSubsidy)} <span className="result-hero-unit">Cr</span>
        </div>
        <div className="result-hero-sub">
          Against a Fixed Capital Investment of <span>₹{fmt(r.fci)} Cr</span>
        </div>
        <div className="result-meta-row">
          <div className="result-meta-item">
            <div className="result-meta-value">{r.disbursementYears}</div>
            <div className="result-meta-label">Years</div>
          </div>
          <div className="result-meta-item">
            <div className="result-meta-value">₹{fmt(r.annualPayout)} Cr</div>
            <div className="result-meta-label">Per Year</div>
          </div>
          <div className="result-meta-item">
            <div className="result-meta-value">{((r.totalSubsidy / r.fci) * 100).toFixed(1)}%</div>
            <div className="result-meta-label">of FCI</div>
          </div>
        </div>
      </div>

      {/* ═══ ELIGIBILITY ═══ */}
      <div className="section-title">
        <span className="section-title-icon">🎯</span>
        Eligibility Assessment
      </div>
      <div className="eligibility-grid">
        <div>
          <div className="eligibility-column-title eligible">✓ Eligible Incentives</div>
          {r.eligible.map((e, i) => (
            <div key={i} className="eligibility-item eligible">
              <div className="eligibility-item-header">✅ {e.name}</div>
              <div className="eligibility-item-reason">{e.reason}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="eligibility-column-title not-eligible">✗ Not Eligible</div>
          {r.notEligible.map((e, i) => (
            <div key={i} className="eligibility-item not-eligible">
              <div className="eligibility-item-header">❌ {e.name}</div>
              <div className="eligibility-item-reason">{e.reason}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CALCULATION BREAKDOWN ═══ */}
      <div className="section-title">
        <span className="section-title-icon">📐</span>
        How We Calculated This — Step by Step
      </div>

      <CalcStep num={1} title="Your Investment → Fixed Capital Investment (FCI)" result={`₹${fmt(r.fci)} Cr`} defaultOpen>
        <p className="calc-intro">
          The FCI is calculated from your building and machinery costs. Land is excluded, and some components may be capped by policy rules.
        </p>
        <CalcDetail icon="🏗️">
          <strong>Land Cost: ₹{fmt(r.inputs.landCost)} Cr</strong> → <span className="excluded">Excluded from FCI</span><br/>
          As per UPEMP 2020 policy, land cost is not counted towards FCI.
        </CalcDetail>
        <CalcDetail icon="🏢">
          <strong>Building Cost: ₹{fmt(r.inputs.buildingCost)} Cr</strong> →{' '}
          {r.fciResult.bCapped ? (
            <><span className="cap-applied">Capped at ₹{fmt(r.fciResult.bIncl)} Cr</span> (10% of FCI)<br/>
            Your building cost exceeds the 10% FCI cap. ₹{fmt(r.inputs.buildingCost - r.fciResult.bIncl)} Cr was excluded.</>
          ) : (
            <><span className="amount">Fully included: ₹{fmt(r.fciResult.bIncl)} Cr</span><br/>
            Within the 10% of FCI cap (limit: ₹{fmt(r.fci * 0.10)} Cr).</>
          )}
        </CalcDetail>
        <CalcDetail icon="⚙️">
          <strong>New Plant & Machinery: ₹{fmt(r.inputs.newMachinery)} Cr</strong> → <span className="amount">Fully included (100%)</span><br/>
          New machinery is always included at full value.
        </CalcDetail>
        <CalcDetail icon="🔧">
          <strong>Refurbished Machinery: ₹{fmt(r.inputs.refurbMachinery)} Cr</strong> →{' '}
          {!r.inputs.isGoiEval ? (
            <><span className="excluded">Excluded (No GOI evaluation)</span><br/>
            Refurbished machinery requires GOI evaluation. Since this is not enabled, the entire amount is excluded.</>
          ) : r.fciResult.rCapped ? (
            <><span className="cap-applied">Capped at ₹{fmt(r.fciResult.rIncl)} Cr</span> (40% of FCI)<br/>
            Exceeds the 40% FCI cap. ₹{fmt(r.inputs.refurbMachinery - r.fciResult.rIncl)} Cr was excluded.</>
          ) : (
            <><span className="amount">Included: ₹{fmt(r.fciResult.rIncl)} Cr</span><br/>
            Within the 40% of FCI cap (limit: ₹{fmt(r.fci * 0.40)} Cr). GOI evaluation approved.</>
          )}
        </CalcDetail>
        <div className="calc-result-box">
          <span>Fixed Capital Investment (FCI)</span>
          <span>₹{fmt(r.fci)} Cr</span>
        </div>
      </CalcStep>

      <CalcStep num={2} title="Base Capital Subsidy (15% of FCI)" result={`₹${fmt(r.baseSubsidy)} Cr`} defaultOpen>
        <CalcDetail icon="📊">
          Every eligible unit receives a base capital subsidy of <strong>15%</strong> of their calculated FCI.<br/>
          <span className="amount">₹{fmt(r.fci)} Cr × 15% = ₹{fmt(r.baseSubsidy)} Cr</span>
        </CalcDetail>
        <div className="calc-result-box">
          <span>Base Subsidy</span>
          <span>₹{fmt(r.baseSubsidy)} Cr</span>
        </div>
      </CalcStep>

      <CalcStep num={3} title="Mega Project Bonus Check" result={r.megaEligible ? `₹${fmt(r.megaBonus)} Cr` : 'Not Eligible'} defaultOpen>
        <p className="calc-intro">
          An additional 10% capital subsidy (max ₹100 Cr) is available for investments ≥ ₹1,000 Cr with ≥ 3,000 employees.
        </p>
        <CalcDetail icon={r.fci >= 1000 ? '✅' : '❌'}>
          <strong>FCI ≥ ₹1,000 Cr?</strong> — Your FCI: ₹{fmt(r.fci)} Cr{' '}
          {r.fci >= 1000 ? <span className="amount">(Qualifies)</span> : <span className="excluded">(Does not qualify)</span>}
        </CalcDetail>
        <CalcDetail icon={r.inputs.employmentCount >= 3000 ? '✅' : '❌'}>
          <strong>Employment ≥ 3,000?</strong> — Your employment: {r.inputs.employmentCount.toLocaleString()}{' '}
          {r.inputs.employmentCount >= 3000 ? <span className="amount">(Qualifies)</span> : <span className="excluded">(Does not qualify)</span>}
        </CalcDetail>
        {r.megaEligible && (
          <CalcDetail icon="🧮">
            <strong>Calculation:</strong> 10% of FCI exceeding ₹1,000 Cr<br/>
            (₹{fmt(r.fci)} − ₹1,000) × 10% = ₹{fmt((r.fci - 1000) * 0.10)} Cr<br/>
            {(r.fci - 1000) * 0.10 > 100
              ? <span className="cap-applied">Capped at ₹100 Cr (policy maximum)</span>
              : 'Within the ₹100 Cr policy cap.'}
          </CalcDetail>
        )}
        <div className={`calc-result-box ${r.megaEligible ? 'success' : 'warning'}`}>
          <span>Mega Project Bonus</span>
          <span>{r.megaEligible ? `₹${fmt(r.megaBonus)} Cr` : '₹0.00 Cr — Not Eligible'}</span>
        </div>
      </CalcStep>

      <CalcStep num={4} title="Core Subsidy Cap Check (₹250 Cr Maximum)" result={`₹${fmt(r.coreSubsidy)} Cr`} defaultOpen>
        <p className="calc-intro">
          The policy caps the combined Base Subsidy + Mega Bonus at ₹250 Cr maximum.
        </p>
        <CalcDetail icon="➕">
          Base Subsidy (₹{fmt(r.baseSubsidy)} Cr) + Mega Bonus (₹{fmt(r.megaBonus)} Cr) = <strong>₹{fmt(r.coreUncapped)} Cr</strong>
        </CalcDetail>
        <CalcDetail icon={r.coreCapped ? '⚠️' : '✅'}>
          {r.coreCapped
            ? <><span className="cap-applied">Cap applied!</span> ₹{fmt(r.coreUncapped)} Cr exceeds the ₹250 Cr policy limit. Reduced by ₹{fmt(r.coreUncapped - 250)} Cr.</>
            : 'Within the ₹250 Cr cap. No reduction needed.'}
        </CalcDetail>
        <div className={`calc-result-box ${r.coreCapped ? 'warning' : 'success'}`}>
          <span>Core Subsidy (after cap)</span>
          <span>₹{fmt(r.coreSubsidy)} Cr</span>
        </div>
      </CalcStep>

      <CalcStep num={5} title={`Additional Incentive (${r.multiplierEligible ? r.multiplierLabel : 'None Selected'})`} result={r.multiplierEligible ? `₹${fmt(r.multiplierBonus)} Cr` : '₹0.00 Cr'} defaultOpen>
        {r.multiplierEligible ? (
          <>
            <CalcDetail icon="🎯">
              {r.multiplierReason}<br/>
              <span className="amount">₹{fmt(r.fci)} Cr × {(r.multiplierRate * 100).toFixed(1)}% = ₹{fmt(r.multiplierBonus)} Cr</span>
            </CalcDetail>
            {r.multiplierType === 'anchor' && (
              <CalcDetail icon="⚠️">
                <span className="cap-applied">Important:</span> This incentive is payable only after the successful establishment of all proposed ancillary units. The anchor unit must procure a minimum of 40% of its raw material requirement from these ancillary units.
              </CalcDetail>
            )}
          </>
        ) : (
          <CalcDetail icon="ℹ️">
            No additional incentive category was selected. You may be eligible for a <strong>Focus Area Bonus (5%)</strong> or an <strong>Anchor Unit Bonus (1.5%–5%)</strong> if applicable.
          </CalcDetail>
        )}
        <div className={`calc-result-box ${r.multiplierEligible ? '' : 'warning'}`}>
          <span>Additional Incentive</span>
          <span>₹{fmt(r.multiplierBonus)} Cr</span>
        </div>
      </CalcStep>

      <CalcStep num={6} title="Final Total & 100% FCI Cap Check" result={`₹${fmt(r.totalSubsidy)} Cr`} defaultOpen>
        <CalcDetail icon="➕">
          Core Subsidy (₹{fmt(r.coreSubsidy)} Cr) + Additional Incentive (₹{fmt(r.multiplierBonus)} Cr) = <strong>₹{fmt(r.totalUncapped)} Cr</strong>
        </CalcDetail>
        <CalcDetail icon={r.totalCapped ? '⚠️' : '✅'}>
          <strong>100% FCI cap check:</strong> Total incentives cannot exceed your FCI of ₹{fmt(r.fci)} Cr.<br/>
          {r.totalCapped
            ? <><span className="cap-applied">Cap applied!</span> Total reduced from ₹{fmt(r.totalUncapped)} Cr to ₹{fmt(r.totalSubsidy)} Cr.</>
            : <>Your total (₹{fmt(r.totalSubsidy)} Cr) is {((r.totalSubsidy / r.fci) * 100).toFixed(1)}% of FCI — within the 100% limit.</>}
        </CalcDetail>
        <div className="calc-result-box success">
          <span>Total Capital Subsidy</span>
          <span>₹{fmt(r.totalSubsidy)} Cr</span>
        </div>
      </CalcStep>

      {/* ═══ SUMMARY TABLE ═══ */}
      <div className="section-title">
        <span className="section-title-icon">📋</span>
        Subsidy Breakdown Summary
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="summary-table">
          <thead>
            <tr><th>Component</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>Calculated FCI</td><td>₹{fmt(r.fci)} Cr</td></tr>
            <tr><td>Base Capital Subsidy (15%)</td><td>₹{fmt(r.baseSubsidy)} Cr</td></tr>
            <tr>
              <td>Mega Project Bonus (10%){!r.megaEligible && <span className="cap-note">Not Eligible</span>}</td>
              <td>₹{fmt(r.megaBonus)} Cr</td>
            </tr>
            <tr>
              <td>Core Subsidy (Base + Mega){r.coreCapped && <span className="cap-note">⚠ Capped at ₹250 Cr</span>}</td>
              <td>₹{fmt(r.coreSubsidy)} Cr</td>
            </tr>
            <tr>
              <td>
                {r.multiplierEligible ? r.multiplierLabel : 'Additional Incentive'}
                <span className="cap-note">{r.multiplierEligible ? `${(r.multiplierRate * 100).toFixed(1)}%` : 'Not Selected'}</span>
              </td>
              <td>₹{fmt(r.multiplierBonus)} Cr</td>
            </tr>
            <tr className="total-row">
              <td>Total Capital Subsidy{r.totalCapped && <span className="cap-note" style={{ color: 'var(--accent-amber)' }}>⚠ Capped at 100% FCI</span>}</td>
              <td>₹{fmt(r.totalSubsidy)} Cr</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ═══ DISBURSEMENT ═══ */}
      <div className="section-title">
        <span className="section-title-icon">📅</span>
        Disbursement Schedule
      </div>
      <div className="disbursement-card">
        <div className="disbursement-header">
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Payment Timeline</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>How your subsidy will be disbursed</div>
          </div>
          <div className="disbursement-tier">📌 {r.disbursementTier}</div>
        </div>
        <div className="disbursement-timeline">
          {Array.from({ length: r.disbursementYears }, (_, i) => (
            <div key={i} className="disbursement-year">
              <div className="disbursement-year-label">Year {i + 1}</div>
              <div className="disbursement-year-amount">₹{fmt(r.annualPayout)}</div>
            </div>
          ))}
        </div>
        <div className="disbursement-note">⚠ {r.disbursementNote}</div>
      </div>

      {/* ═══ DISCLAIMERS ═══ */}
      <div className="disclaimers">
        <div className="disclaimers-title">📌 Important Policy Notes & Disclaimers</div>
        <Disclaimer>This is an estimate based on the UP Electronics Manufacturing Policy 2020. Actual subsidy is subject to evaluation by Financial Institutions / Banks / Financial Consultants or a committee constituted by the State Government.</Disclaimer>
        {r.inputs.isGoiEval && (
          <Disclaimer>Refurbished machinery dispensation is available for only the first 20 investors from the date of policy notification. Eligibility is subject to GOI evaluation.</Disclaimer>
        )}
        {r.multiplierType === 'anchor' && (
          <Disclaimer>Anchor unit incentive is payable after the successful establishment of all proposed ancillary units. The anchor unit must procure a minimum of 40% of its raw material requirement from the proposed ancillary units.</Disclaimer>
        )}
        {r.fci >= 1000 && (
          <Disclaimer>First installment will be released from the year in which the unit achieves commercial production at minimum 80% of its total capacity.</Disclaimer>
        )}
        <Disclaimer>All incentives are over and above GOI incentives. Total incentives from all sources (excluding PLI scheme) shall not exceed 100% of FCI.</Disclaimer>
        <Disclaimer>Investors setting up units for remanufacturing, repair, or refurbishment of Electronics products in UP are eligible for all incentives under this policy.</Disclaimer>
      </div>

      {/* ═══ RECALCULATE ═══ */}
      <div className="recalculate-row">
        <button className="btn btn-recalculate" onClick={onRecalculate}>
          <span className="btn-icon">↺</span> Modify Inputs & Recalculate
        </button>
      </div>
    </div>
  );
}

/* ── Reusable sub-components ── */

function CalcStep({ num, title, result, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`calc-step ${open ? 'open' : ''}`}>
      <div className="calc-step-header" onClick={() => setOpen(!open)}>
        <div className="calc-step-num">{num}</div>
        <div className="calc-step-title">{title}</div>
        <div className="calc-step-result">{result}</div>
        <div className="calc-step-chevron">▼</div>
      </div>
      <div className="calc-step-body">
        <div className="calc-step-content">{children}</div>
      </div>
    </div>
  );
}

function CalcDetail({ icon, children }) {
  return (
    <div className="calc-detail">
      <span className="calc-detail-icon">{icon}</span>
      <div className="calc-detail-text">{children}</div>
    </div>
  );
}

function Disclaimer({ children }) {
  return (
    <div className="disclaimer-item">
      <span className="disclaimer-bullet">▸</span>
      <span>{children}</span>
    </div>
  );
}
