import { useState } from 'react';

export default function StepInvestment({ data, onChange, onNext }) {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!data.newMachinery || data.newMachinery <= 0) {
      setError('New Plant & Machinery must be greater than 0');
      return;
    }
    setError('');
    onNext();
  };

  const update = (field, value) => {
    if (field === 'newMachinery') setError('');
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="card animate-in">
      <div className="card-title">Investment Details</div>
      <div className="card-subtitle">Enter your planned investment breakdown in ₹ Crores</div>

      <div className="form-grid">
        {/* Land Cost */}
        <div className="form-group">
          <label className="form-label">Land Cost</label>
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              className="has-prefix has-suffix"
              value={data.landCost || ''}
              onChange={e => update('landCost', parseFloat(e.target.value) || 0)}
            />
            <span className="input-suffix">Cr</span>
          </div>
          <span className="form-hint">Excluded from FCI (for reference only)</span>
        </div>

        {/* Building Cost */}
        <div className="form-group">
          <label className="form-label">Building Cost</label>
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              className="has-prefix has-suffix"
              value={data.buildingCost || ''}
              onChange={e => update('buildingCost', parseFloat(e.target.value) || 0)}
            />
            <span className="input-suffix">Cr</span>
          </div>
          <span className="form-hint">Subject to 10% FCI cap</span>
        </div>

        {/* New Plant & Machinery */}
        <div className="form-group">
          <label className="form-label">New Plant & Machinery</label>
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              className={`has-prefix has-suffix ${error ? 'input-error' : ''}`}
              value={data.newMachinery || ''}
              onChange={e => update('newMachinery', parseFloat(e.target.value) || 0)}
            />
            <span className="input-suffix">Cr</span>
          </div>
          <span className="form-hint">Fully included in FCI (100%)</span>
          {error && <span className="error-text visible">{error}</span>}
        </div>

        {/* Refurbished Machinery */}
        <div className="form-group">
          <label className="form-label">Refurbished Plant & Machinery</label>
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              className="has-prefix has-suffix"
              value={data.refurbMachinery || ''}
              onChange={e => update('refurbMachinery', parseFloat(e.target.value) || 0)}
            />
            <span className="input-suffix">Cr</span>
          </div>
          <span className="form-hint">Up to 40% of FCI (GOI evaluation required)</span>
        </div>

        {/* GOI Toggle */}
        <div className="form-group full-width">
          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">GOI Evaluated for Refurbished Machinery?</span>
              <span className="toggle-desc">Required for refurbished machinery to count towards FCI. Limited to first 20 investors.</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={data.isGoiEval}
                onChange={e => update('isGoiEval', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Rented Toggle */}
        <div className="form-group full-width">
          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Operating from Plug & Play / Rented Building?</span>
              <span className="toggle-desc">If yes, capital subsidy will be disbursed in 5 yearly installments regardless of FCI tier.</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={data.isRented}
                onChange={e => update('isRented', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-buttons">
        <div className="btn-spacer"></div>
        <button className="btn btn-primary" onClick={handleNext}>
          Next: Workforce <span className="btn-icon">→</span>
        </button>
      </div>
    </div>
  );
}
