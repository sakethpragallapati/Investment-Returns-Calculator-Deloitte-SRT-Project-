import { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ReportTemplate from './ReportTemplate';
import './LeadDetailModal.css';

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function LeadDetailModal({ lead, onClose }) {
  const reportRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Subsidy_Report_${lead?.company?.replace(/\s+/g, '_') || 'Draft'}`,
  });

  if (!lead) return null;
  const c = lead.calculation || {};

  // Derived values
  const coreUncapped = (c.base_subsidy || 0) + (c.mega_bonus || 0);
  const coreCapped = coreUncapped > 250;
  const coreSubsidy = Math.min(coreUncapped, 250);
  const totalUncapped = coreSubsidy + (c.multiplier_bonus || 0);
  const megaEligible = c.mega_bonus > 0;
  const buildingCapped = c.building_included < c.building;
  const refurbCapped = c.is_goi_evaluated && c.refurb_included < c.refurb_machinery;

  const getTierLabel = (years) => {
    if (years === 1) return 'Tier 1 — Lump Sum (FCI ≤ ₹200 Cr)';
    if (years === 3) return 'Tier 2 — 3 Years (₹200 Cr < FCI < ₹1,000 Cr)';
    return 'Tier 3 — 5 Years (FCI ≥ ₹1,000 Cr)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-company">{lead.company}</h2>
            <p className="modal-lead-info">
              {lead.name} · {lead.email}
              {lead.contact_number && ` · ${lead.contact_number}`}
            </p>
            <p className="modal-date">Submitted {formatDate(lead.created_at)}</p>
          </div>
          <div className="modal-header-actions">
            <button className="btn-modal-print" onClick={() => handlePrint()} title="Download PDF Report">
              <Printer size={16} />
              <span>Export PDF</span>
            </button>
            <button className="modal-close" onClick={onClose} id="modal-close">
              <X size={20} />
            </button>
          </div>
        </div>

        {!lead.calculation ? (
          <div className="modal-empty">No calculation data available.</div>
        ) : (
          <div className="modal-body">

            {/* Hero */}
            <div className="modal-hero">
              <div className="modal-hero-label">Total Capital Subsidy</div>
              <div className="modal-hero-amount">₹{fmt(c.total_subsidy)} <span>Cr</span></div>
              <div className="modal-hero-meta">
                <div>
                  <strong>{c.disbursement_years}</strong>
                  <span>Years</span>
                </div>
                <div>
                  <strong>₹{fmt(c.annual_payout)} Cr</strong>
                  <span>Per Year</span>
                </div>
                <div>
                  <strong>{c.fci > 0 ? ((c.total_subsidy / c.fci) * 100).toFixed(1) : 0}%</strong>
                  <span>of FCI</span>
                </div>
              </div>
            </div>

            {/* Step 1: Inputs → FCI */}
            <div className="modal-section">
              <div className="modal-section-header">
                <span className="modal-step-num">1</span>
                <span>Investment Inputs → FCI</span>
                <span className="modal-step-result">₹{fmt(c.fci)} Cr</span>
              </div>
              <div className="modal-section-body">
                <table className="modal-detail-table">
                  <tbody>
                    <tr>
                      <td>🏗️ Land Cost</td>
                      <td>₹{fmt(c.land)} Cr</td>
                      <td className="td-status excluded">Excluded from FCI</td>
                    </tr>
                    <tr>
                      <td>🏢 Building Cost</td>
                      <td>₹{fmt(c.building)} Cr</td>
                      <td className={`td-status ${buildingCapped ? 'capped' : 'included'}`}>
                        {buildingCapped
                          ? `Capped → ₹${fmt(c.building_included)} Cr (10%)`
                          : `Fully included`}
                      </td>
                    </tr>
                    <tr>
                      <td>⚙️ New Plant & Machinery</td>
                      <td>₹{fmt(c.new_machinery)} Cr</td>
                      <td className="td-status included">Fully included (100%)</td>
                    </tr>
                    <tr>
                      <td>🔧 Refurbished Machinery</td>
                      <td>₹{fmt(c.refurb_machinery)} Cr</td>
                      <td className={`td-status ${!c.is_goi_evaluated ? 'excluded' : refurbCapped ? 'capped' : 'included'}`}>
                        {!c.is_goi_evaluated
                          ? 'Excluded (No GOI eval)'
                          : refurbCapped
                            ? `Capped → ₹${fmt(c.refurb_included)} Cr (40%)`
                            : `Included: ₹${fmt(c.refurb_included)} Cr`}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="modal-tags">
                  <span className={`modal-tag ${c.is_goi_evaluated ? 'active' : ''}`}>
                    {c.is_goi_evaluated ? '✅' : '❌'} GOI Evaluated
                  </span>
                  <span className={`modal-tag ${c.is_rented_building ? 'active' : ''}`}>
                    {c.is_rented_building ? '✅' : '❌'} Rented / Plug & Play
                  </span>
                  <span className="modal-tag">
                    👥 Employment: {(c.employment || 0).toLocaleString()}
                  </span>
                </div>
                <div className="modal-result-line">
                  Fixed Capital Investment (FCI) = <strong>₹{fmt(c.fci)} Cr</strong>
                </div>
              </div>
            </div>

            {/* Step 2: Base Subsidy */}
            <div className="modal-section">
              <div className="modal-section-header">
                <span className="modal-step-num">2</span>
                <span>Base Capital Subsidy (15%)</span>
                <span className="modal-step-result">₹{fmt(c.base_subsidy)} Cr</span>
              </div>
              <div className="modal-section-body">
                <div className="modal-calc-line">
                  ₹{fmt(c.fci)} Cr × 15% = <strong>₹{fmt(c.base_subsidy)} Cr</strong>
                </div>
              </div>
            </div>

            {/* Step 3: Mega Bonus */}
            <div className="modal-section">
              <div className="modal-section-header">
                <span className="modal-step-num">3</span>
                <span>Mega Project Bonus</span>
                <span className={`modal-step-result ${!megaEligible ? 'not-eligible' : ''}`}>
                  {megaEligible ? `₹${fmt(c.mega_bonus)} Cr` : 'Not Eligible'}
                </span>
              </div>
              <div className="modal-section-body">
                <div className="modal-check-row">
                  <span className={c.fci >= 1000 ? 'check-pass' : 'check-fail'}>
                    {c.fci >= 1000 ? '✅' : '❌'} FCI ≥ ₹1,000 Cr
                  </span>
                  <span>Your FCI: ₹{fmt(c.fci)} Cr</span>
                </div>
                <div className="modal-check-row">
                  <span className={c.employment >= 3000 ? 'check-pass' : 'check-fail'}>
                    {c.employment >= 3000 ? '✅' : '❌'} Employment ≥ 3,000
                  </span>
                  <span>Your count: {(c.employment || 0).toLocaleString()}</span>
                </div>
                {megaEligible && (
                  <div className="modal-calc-line">
                    10% of (₹{fmt(c.fci)} − ₹1,000) = <strong>₹{fmt(c.mega_bonus)} Cr</strong>
                    {c.mega_bonus >= 100 && <span className="cap-note"> (capped at ₹100 Cr)</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Core Subsidy Cap */}
            <div className="modal-section">
              <div className="modal-section-header">
                <span className="modal-step-num">4</span>
                <span>Core Subsidy Cap (₹250 Cr Max)</span>
                <span className={`modal-step-result ${coreCapped ? 'capped' : ''}`}>
                  ₹{fmt(c.core_subsidy)} Cr
                </span>
              </div>
              <div className="modal-section-body">
                <div className="modal-calc-line">
                  Base (₹{fmt(c.base_subsidy)}) + Mega (₹{fmt(c.mega_bonus)}) = ₹{fmt(coreUncapped)} Cr
                  {coreCapped && <span className="cap-note"> → Capped to ₹250 Cr</span>}
                </div>
              </div>
            </div>

            {/* Step 5: Additional Incentive */}
            <div className="modal-section">
              <div className="modal-section-header">
                <span className="modal-step-num">5</span>
                <span>Additional Incentive</span>
                <span className={`modal-step-result ${c.multiplier_bonus <= 0 ? 'not-eligible' : ''}`}>
                  {c.multiplier_bonus > 0 ? `₹${fmt(c.multiplier_bonus)} Cr` : 'None'}
                </span>
              </div>
              <div className="modal-section-body">
                {c.focus_area ? (
                  <div className="modal-calc-line">
                    🎯 Focus Area: <strong>{c.focus_area}</strong> — 5% of FCI = <strong>₹{fmt(c.multiplier_bonus)} Cr</strong>
                  </div>
                ) : c.anchor_units ? (
                  <div className="modal-calc-line">
                    🏭 Anchor Units: <strong>{c.anchor_units}</strong> — <strong>₹{fmt(c.multiplier_bonus)} Cr</strong>
                  </div>
                ) : (
                  <div className="modal-calc-line muted">No additional incentive category was selected.</div>
                )}
              </div>
            </div>

            {/* Step 6: Total */}
            <div className="modal-section highlight">
              <div className="modal-section-header">
                <span className="modal-step-num">6</span>
                <span>Final Total</span>
                <span className="modal-step-result total">₹{fmt(c.total_subsidy)} Cr</span>
              </div>
              <div className="modal-section-body">
                <div className="modal-calc-line">
                  Core (₹{fmt(c.core_subsidy)}) + Incentive (₹{fmt(c.multiplier_bonus)}) = <strong>₹{fmt(c.total_subsidy)} Cr</strong>
                </div>
                <div className="modal-disbursement-line">
                  📅 {getTierLabel(c.disbursement_years)} — <strong>₹{fmt(c.annual_payout)} Cr/year</strong>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Hidden component specifically for printing */}
      <div style={{ display: 'none' }}>
        <ReportTemplate ref={reportRef} calculationData={c} dataType="api" leadInfo={lead} />
      </div>
    </div>
  );
}
