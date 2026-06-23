import React, { forwardRef } from 'react';
import './DashboardReportTemplate.css';

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

const DashboardReportTemplate = forwardRef(({ leads, stats }, ref) => {
  const now = new Date();

  return (
    <div className="dash-report-container" ref={ref}>
      {/* HEADER */}
      <div className="dash-report-header">
        <div className="dash-report-logo">
          <div className="dash-logo-box">Advisory</div>
          <div className="dash-logo-text">Policy Estimator</div>
        </div>
        <div className="dash-report-title-area">
          <h1 className="dash-report-title">Dashboard Aggregate Report</h1>
          <p className="dash-report-subtitle">UP Electronics Manufacturing Policy 2020</p>
        </div>
      </div>

      <div className="dash-report-meta">
        <strong>Report Generated On:</strong> {formatDate(now.toISOString())}
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="dash-report-section dash-highlight-section">
        <h2>Portfolio Summary</h2>
        <div className="dash-exec-grid">
          <div className="dash-exec-item">
            <span className="dash-exec-label">Total Leads</span>
            <span className="dash-exec-value primary">{stats?.total_leads || 0}</span>
          </div>
          <div className="dash-exec-item">
            <span className="dash-exec-label">Total Subsidy Est.</span>
            <span className="dash-exec-value">₹{fmt(stats?.total_subsidy_processed)} <small>Cr</small></span>
          </div>
          <div className="dash-exec-item">
            <span className="dash-exec-label">Average FCI</span>
            <span className="dash-exec-value">₹{fmt(stats?.average_fci)} <small>Cr</small></span>
          </div>
          <div className="dash-exec-item">
            <span className="dash-exec-label">Total Employment Est.</span>
            <span className="dash-exec-value">{(stats?.total_employment || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="dash-report-section">
        <h2>Lead Breakdown</h2>
        <table className="dash-report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Company</th>
              <th>FCI (₹ Cr)</th>
              <th>Subsidy (₹ Cr)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No leads recorded</td>
              </tr>
            ) : (
              leads.map(lead => (
                <tr key={lead.id}>
                  <td>{formatDate(lead.created_at)}</td>
                  <td>
                    <strong>{lead.company}</strong><br />
                    <span className="muted">{lead.name}</span>
                  </td>
                  <td className="amount">{fmt(lead.calculation?.fci)}</td>
                  <td className="amount primary-amount">{fmt(lead.calculation?.total_subsidy)}</td>
                  <td>{lead.calculation?.total_subsidy > 0 ? 'Eligible' : 'Incomplete/Ineligible'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="dash-report-footer">
        <div className="dash-footer-brand">Generated via Deloitte Policy Advisory Tool</div>
      </div>
    </div>
  );
});

DashboardReportTemplate.displayName = 'DashboardReportTemplate';

export default DashboardReportTemplate;
