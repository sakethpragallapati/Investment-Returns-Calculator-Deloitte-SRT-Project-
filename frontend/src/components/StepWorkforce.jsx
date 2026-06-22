export default function StepWorkforce({ data, onChange, onNext, onBack }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="card animate-in">
      <div className="card-title">Workforce Information</div>
      <div className="card-subtitle">Provide expected employment generation details</div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Expected Employment Generation</label>
          <div className="input-wrapper">
            <input
              type="number" min="0" step="1" placeholder="e.g. 500"
              value={data.employmentCount || ''}
              onChange={e => update('employmentCount', parseInt(e.target.value) || 0)}
            />
          </div>
          <span className="form-hint">
            Minimum 3,000 employees required for Mega Project Bonus (FCI ≥ ₹1,000 Cr)
          </span>
        </div>
      </div>

      <div className="nav-buttons">
        <button className="btn btn-secondary" onClick={onBack}>
          <span className="btn-icon">←</span> Back
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Next: Incentives <span className="btn-icon">→</span>
        </button>
      </div>
    </div>
  );
}
