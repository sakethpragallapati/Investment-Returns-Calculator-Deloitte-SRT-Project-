import {
  Shield, Building2, Cpu, Wrench, Users, TrendingUp,
  Award, AlertTriangle, CalendarDays, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home animate-in">

      {/* Hero CTA */}
      <div className="home-hero">
        <div className="home-hero-badge">📜 UPEMP 2020 Policy Reference</div>
        <h2>Subsidy Calculation Rules</h2>
        <p>
          A step-by-step breakdown of how the UP Electronics Manufacturing Policy 2020
          calculates your capital subsidy — from investment inputs to final disbursement.
        </p>
        <button className="btn btn-primary home-cta" onClick={() => navigate('/calculator')}>
          <Cpu size={16} />
          Open Calculator
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ═══ RULES ═══ */}

      {/* Step 1: FCI */}
      <RuleSection
        step={1}
        icon={<Building2 size={20} />}
        color="blue"
        title="Fixed Capital Investment (FCI)"
        subtitle="The foundation of your subsidy calculation"
      >
        <p>
          FCI is the total eligible capital investment in your manufacturing unit. It determines
          your base subsidy amount, mega project eligibility, and disbursement tier.
        </p>

        <RuleCard title="What's Included" variant="included">
          <ul>
            <li><strong>New Plant & Machinery (P&M)</strong> — Always included at 100% of value.</li>
            <li><strong>Building Cost</strong> — Included up to <strong>10% of total FCI</strong>. If it exceeds 10%, only the capped amount is counted.</li>
            <li><strong>Refurbished Machinery</strong> — Only if GOI (Government of India) evaluated. Capped at <strong>40% of total FCI</strong>.</li>
          </ul>
        </RuleCard>

        <RuleCard title="What's Excluded" variant="excluded">
          <ul>
            <li><strong>Land Cost</strong> — Always excluded from FCI, regardless of amount.</li>
            <li><strong>Refurbished Machinery without GOI evaluation</strong> — The entire amount is excluded.</li>
          </ul>
        </RuleCard>

        <RuleCard title="How the Caps Work (Circular Dependency)" variant="info">
          <p>
            The building and refurbished machinery caps are percentages of the FCI itself, which
            creates a circular dependency. The calculator resolves this by evaluating <strong>4 algebraic cases</strong>:
          </p>
          <div className="case-grid">
            <div className="case-item">
              <span className="case-num">Case 1</span>
              <span>Neither capped — all amounts fit within their limits.</span>
            </div>
            <div className="case-item">
              <span className="case-num">Case 2</span>
              <span>Only Building is capped at 10%. Formula: FCI = (P + R) / 0.90</span>
            </div>
            <div className="case-item">
              <span className="case-num">Case 3</span>
              <span>Only Refurbished is capped at 40%. Formula: FCI = (P + B) / 0.60</span>
            </div>
            <div className="case-item">
              <span className="case-num">Case 4</span>
              <span>Both capped. Formula: FCI = P / 0.50</span>
            </div>
          </div>
        </RuleCard>
      </RuleSection>

      {/* Step 2: Base Subsidy */}
      <RuleSection
        step={2}
        icon={<TrendingUp size={20} />}
        color="emerald"
        title="Base Capital Subsidy — 15% of FCI"
        subtitle="Every eligible unit receives this"
      >
        <p>
          All manufacturing units setting up operations under UPEMP 2020 are entitled
          to a base capital subsidy of <strong>15% of their calculated FCI</strong>.
        </p>
        <div className="formula-box">
          <span className="formula-label">Formula</span>
          <span className="formula-text">Base Subsidy = FCI × 15%</span>
        </div>
        <p className="rule-note">
          This is the starting point. Additional bonuses from Steps 3 and 5 may increase this amount.
        </p>
      </RuleSection>

      {/* Step 3: Mega Project */}
      <RuleSection
        step={3}
        icon={<Award size={20} />}
        color="purple"
        title="Mega Project Bonus — 10% (Max ₹100 Cr)"
        subtitle="For large-scale investments with significant employment"
      >
        <p>
          Projects that meet <strong>both</strong> of the following criteria qualify for
          an additional bonus on investment exceeding ₹1,000 Cr:
        </p>
        <RuleCard title="Eligibility Criteria" variant="info">
          <div className="criteria-list">
            <div className="criteria-item">
              <span className="criteria-check">✅</span>
              <div>
                <strong>FCI ≥ ₹1,000 Crores</strong>
                <span>Total Fixed Capital Investment must be at least ₹1,000 Cr</span>
              </div>
            </div>
            <div className="criteria-item">
              <span className="criteria-check">✅</span>
              <div>
                <strong>Employment ≥ 3,000 people</strong>
                <span>Expected employment generation must be at least 3,000</span>
              </div>
            </div>
          </div>
        </RuleCard>
        <div className="formula-box">
          <span className="formula-label">Formula</span>
          <span className="formula-text">Mega Bonus = min( (FCI − ₹1,000 Cr) × 10%, ₹100 Cr )</span>
        </div>
        <p className="rule-note">
          ⚠ Both conditions must be met. If either one fails, the bonus is ₹0.
        </p>
      </RuleSection>

      {/* Step 4: Core Subsidy Cap */}
      <RuleSection
        step={4}
        icon={<AlertTriangle size={20} />}
        color="amber"
        title="Core Subsidy Cap — ₹250 Crores Maximum"
        subtitle="Policy limit on Base + Mega combined"
      >
        <p>
          The sum of the Base Subsidy and Mega Project Bonus is capped at
          a maximum of <strong>₹250 Crores</strong>, regardless of how large the investment is.
        </p>
        <div className="formula-box">
          <span className="formula-label">Formula</span>
          <span className="formula-text">Core Subsidy = min( Base + Mega, ₹250 Cr )</span>
        </div>
        <RuleCard title="Example" variant="info">
          <p>
            If your Base Subsidy is ₹300 Cr and Mega Bonus is ₹100 Cr, the combined ₹400 Cr
            exceeds the ₹250 Cr cap. Your core subsidy would be reduced to <strong>₹250 Cr</strong>.
          </p>
        </RuleCard>
      </RuleSection>

      {/* Step 5: Additional Incentives */}
      <RuleSection
        step={5}
        icon={<Shield size={20} />}
        color="blue"
        title="Additional Incentive Multiplier"
        subtitle="Focus Area or Anchor Unit — pick one (mutually exclusive)"
      >
        <p>
          You may qualify for <strong>one</strong> additional incentive. These are mutually exclusive
          — you cannot claim both.
        </p>

        <RuleCard title="Option A: Focus Area Bonus (5%)" variant="included">
          <p>
            If your unit falls under a designated <strong>Focus Sector</strong>, you receive an additional
            <strong> 5% of FCI</strong> as bonus. Eligible sectors include:
          </p>
          <div className="sector-tags">
            <span className="sector-tag">🛸 Drones & Components</span>
            <span className="sector-tag">📡 Internet of Things (IoT)</span>
            <span className="sector-tag">🛡️ Defense Electronics</span>
            <span className="sector-tag">🔬 Strategic Electronics</span>
            <span className="sector-tag">🤖 Robotics</span>
          </div>
        </RuleCard>

        <RuleCard title="Option B: Anchor Unit Bonus (1.5% – 5%)" variant="included">
          <p>
            If your unit establishes ancillary (supplier) units in UP, you qualify for a
            bonus based on the number of ancillary units:
          </p>
          <table className="anchor-table">
            <thead>
              <tr><th>Ancillary Units</th><th>Bonus Rate</th></tr>
            </thead>
            <tbody>
              <tr><td>1 to 5 units</td><td>1.5% of FCI</td></tr>
              <tr><td>6 to 10 units</td><td>2.5% of FCI</td></tr>
              <tr><td>More than 10 units</td><td>5.0% of FCI</td></tr>
            </tbody>
          </table>
          <p className="rule-note">
            ⚠ Anchor unit incentive is payable only after successful establishment of all proposed
            ancillary units. The anchor unit must procure ≥40% of raw materials from its ancillary units.
          </p>
        </RuleCard>
      </RuleSection>

      {/* Step 6: Total & Cap */}
      <RuleSection
        step={6}
        icon={<TrendingUp size={20} />}
        color="emerald"
        title="Final Total & 100% FCI Cap"
        subtitle="Your total subsidy cannot exceed your investment"
      >
        <p>
          The final total subsidy is the sum of Core Subsidy + Additional Incentive. However,
          total incentives from all sources (excluding PLI scheme) <strong>cannot exceed 100% of FCI</strong>.
        </p>
        <div className="formula-box">
          <span className="formula-label">Formula</span>
          <span className="formula-text">Total Subsidy = min( Core + Multiplier, FCI )</span>
        </div>
      </RuleSection>

      {/* Step 7: Disbursement */}
      <RuleSection
        step={7}
        icon={<CalendarDays size={20} />}
        color="purple"
        title="Disbursement Schedule"
        subtitle="When and how your subsidy is paid out"
      >
        <p>
          The payout timeline depends on your investment size and building type:
        </p>
        <table className="disbursement-rules-table">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Years</th>
              <th>Payout</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Tier 1:</strong> FCI ≤ ₹200 Cr</td>
              <td>1 year</td>
              <td>Lump sum after commercial production</td>
            </tr>
            <tr>
              <td><strong>Tier 2:</strong> ₹200 Cr &lt; FCI &lt; ₹1,000 Cr</td>
              <td>3 years</td>
              <td>Equal yearly installments</td>
            </tr>
            <tr>
              <td><strong>Tier 3:</strong> FCI ≥ ₹1,000 Cr</td>
              <td>5 years</td>
              <td>Equal yearly installments (at 80% capacity)</td>
            </tr>
            <tr className="special-row">
              <td><strong>Rented / Plug & Play</strong> building</td>
              <td>5 years</td>
              <td>Overrides tier — always 5 yearly installments</td>
            </tr>
          </tbody>
        </table>
        <p className="rule-note">
          For Tier 3 (Mega projects), the first installment is released only after the unit
          achieves commercial production at minimum 80% of its total capacity.
        </p>
      </RuleSection>

      {/* Bottom CTA */}
      <div className="home-bottom-cta">
        <p>Ready to estimate your subsidy?</p>
        <button className="btn btn-calculate" onClick={() => navigate('/calculator')}>
          <Cpu size={16} />
          Launch Calculator
        </button>
      </div>

    </div>
  );
}


/* ── Sub-components ── */

function RuleSection({ step, icon, color, title, subtitle, children }) {
  return (
    <div className={`rule-section rule-${color}`}>
      <div className="rule-section-header">
        <div className={`rule-step-badge ${color}`}>
          <span className="rule-step-num">Step {step}</span>
          {icon}
        </div>
        <div>
          <h3 className="rule-section-title">{title}</h3>
          <p className="rule-section-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="rule-section-body">
        {children}
      </div>
    </div>
  );
}

function RuleCard({ title, variant = 'info', children }) {
  return (
    <div className={`rule-card rule-card-${variant}`}>
      <div className="rule-card-title">{title}</div>
      <div className="rule-card-body">{children}</div>
    </div>
  );
}
