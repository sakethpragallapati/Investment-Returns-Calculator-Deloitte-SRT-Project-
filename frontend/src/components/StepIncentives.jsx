export default function StepIncentives({ data, onChange, onBack, onCalculate }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  const selectType = (type) => {
    const updated = { ...data, incentiveType: type };
    if (type !== 'focus') updated.focusSector = '';
    if (type !== 'anchor') updated.anchorCount = '';
    onChange(updated);
  };

  const canCalculate = () => {
    if (data.incentiveType === 'focus' && !data.focusSector) return false;
    if (data.incentiveType === 'anchor' && !data.anchorCount) return false;
    return true;
  };

  return (
    <div className="card animate-in">
      <div className="card-title">Additional Incentive Category</div>
      <div className="card-subtitle">Select one additional incentive — Focus Area and Anchor Unit are mutually exclusive</div>

      <div className="radio-group">
        {/* None */}
        <div
          className={`radio-option ${data.incentiveType === 'none' ? 'selected' : ''}`}
          onClick={() => selectType('none')}
        >
          <div className="radio-dot"></div>
          <div className="radio-content">
            <div className="radio-title">No Additional Incentive</div>
            <div className="radio-desc">Proceed with base capital subsidy only (15% of FCI).</div>
          </div>
        </div>

        {/* Focus Area */}
        <div
          className={`radio-option ${data.incentiveType === 'focus' ? 'selected' : ''}`}
          onClick={() => selectType('focus')}
        >
          <div className="radio-dot"></div>
          <div className="radio-content">
            <div className="radio-title">Focus Area — Additional 5%</div>
            <div className="radio-desc">Available for units in eligible focus sectors under UPEMP 2020.</div>

            {data.incentiveType === 'focus' && (
              <div className="radio-sub-options" style={{ display: 'block' }}>
                <div className="form-group">
                  <label className="form-label">Select Focus Sector</label>
                  <select
                    value={data.focusSector || ''}
                    onChange={e => update('focusSector', e.target.value)}
                    onClick={e => e.stopPropagation()}
                  >
                    <option value="">— Choose a sector —</option>
                    <option value="DRONES">Drones & Components</option>
                    <option value="IOT">Internet of Things (IoT)</option>
                    <option value="DEFENSE">Defense Electronics</option>
                    <option value="STRATEGIC">Strategic Electronics</option>
                    <option value="ROBOTICS">Robotics</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Anchor Unit */}
        <div
          className={`radio-option ${data.incentiveType === 'anchor' ? 'selected' : ''}`}
          onClick={() => selectType('anchor')}
        >
          <div className="radio-dot"></div>
          <div className="radio-content">
            <div className="radio-title">Anchor Unit — Additional 1.5% to 5%</div>
            <div className="radio-desc">For investors acting as anchor units guaranteeing ancillary units. Must procure min. 40% raw material from proposed ancillary units.</div>

            {data.incentiveType === 'anchor' && (
              <div className="radio-sub-options" style={{ display: 'block' }}>
                <div className="form-group">
                  <label className="form-label">Number of Ancillary Units Proposed</label>
                  <select
                    value={data.anchorCount || ''}
                    onChange={e => update('anchorCount', e.target.value)}
                    onClick={e => e.stopPropagation()}
                  >
                    <option value="">— Select range —</option>
                    <option value="1_TO_5">1 to 5 units (Additional 1.5%)</option>
                    <option value="6_TO_10">6 to 10 units (Additional 2.5%)</option>
                    <option value="MORE_THAN_10">More than 10 units (Additional 5%)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="nav-buttons">
        <button className="btn btn-secondary" onClick={onBack}>
          <span className="btn-icon">←</span> Back
        </button>
        <button
          className="btn btn-calculate"
          onClick={onCalculate}
          disabled={!canCalculate()}
        >
          ⚡ Calculate Subsidy
        </button>
      </div>
    </div>
  );
}
