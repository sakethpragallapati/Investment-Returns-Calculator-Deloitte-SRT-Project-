import { useState, useEffect, useCallback } from 'react';
import {
  Search, Download, RefreshCw, Users, TrendingUp,
  BarChart3, Briefcase, AlertCircle, Database,
} from 'lucide-react';
import { fetchLeads, fetchDashboardStats, getExportCsvUrl } from '../services/api';
import LeadDetailModal from './LeadDetailModal';
import './Dashboard.css';

/**
 * Format a number as ₹ Crores with 2 decimal places.
 */
function formatCr(value) {
  if (value == null || isNaN(value)) return '—';
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
}

/**
 * Get the disbursement tier badge class from the number of years.
 */
function getTierClass(years) {
  if (years === 1) return 'tier-1';
  if (years === 3) return 'tier-2';
  return 'tier-3';
}

function getTierLabel(years) {
  if (years === 1) return 'Tier 1 · Lump Sum';
  if (years === 3) return 'Tier 2 · 3 Years';
  return 'Tier 3 · 5 Years';
}

/**
 * Format a date string into a human-readable format.
 */
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Skeleton Loader ─────────────────────────────
function TableSkeleton() {
  return Array.from({ length: 5 }).map((_, i) => (
    <div className="skeleton-row" key={i}>
      <div className="skeleton-block" style={{ width: '22%' }} />
      <div className="skeleton-block" style={{ width: '14%' }} />
      <div className="skeleton-block" style={{ width: '14%' }} />
      <div className="skeleton-block" style={{ width: '16%' }} />
      <div className="skeleton-block" style={{ width: '10%' }} />
      <div className="skeleton-block" style={{ width: '12%' }} />
    </div>
  ));
}


// ═══ Dashboard Component ═══════════════════════════
export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async (searchTerm = '') => {
    try {
      setError(null);
      const [leadsData, statsData] = await Promise.all([
        fetchLeads(searchTerm),
        fetchDashboardStats(),
      ]);
      setLeads(leadsData.leads);
      setStats(statsData);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(
        err.response?.status === 0 || err.code === 'ERR_NETWORK'
          ? 'Cannot reach the backend server. Make sure uvicorn is running.'
          : 'Failed to load dashboard data. Please try again.'
      );
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [loadData]);

  // Search effect
  useEffect(() => {
    if (!loading) {
      loadData(debouncedSearch);
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(debouncedSearch);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="dashboard animate-in">

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h2>
          <BarChart3 size={22} />
          Admin Dashboard
          <span>— All saved calculations</span>
        </h2>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-label">Total Leads</div>
          <div className="stat-value">
            {loading ? '—' : (stats?.total_leads ?? 0)}
          </div>
        </div>

        <div className="stat-card emerald">
          <div className="stat-icon"><TrendingUp size={20} /></div>
          <div className="stat-label">Total Subsidy Processed</div>
          <div className="stat-value">
            {loading ? '—' : (
              <>
                ₹{(stats?.total_subsidy_processed ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="unit">Cr</span>
              </>
            )}
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><BarChart3 size={20} /></div>
          <div className="stat-label">Average FCI</div>
          <div className="stat-value">
            {loading ? '—' : (
              <>
                ₹{(stats?.average_fci ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="unit">Cr</span>
              </>
            )}
          </div>
        </div>

        <div className="stat-card amber">
          <div className="stat-icon"><Briefcase size={20} /></div>
          <div className="stat-label">Total Employment</div>
          <div className="stat-value">
            {loading ? '—' : (stats?.total_employment ?? 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by company, name, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="dashboard-search"
          />
        </div>

        <button
          className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
          onClick={handleRefresh}
          title="Refresh data"
          id="btn-refresh"
        >
          <RefreshCw size={15} />
          Refresh
        </button>

        <a
          href={getExportCsvUrl()}
          className="btn-export"
          download
          target="_blank"
          rel="noopener noreferrer"
          id="btn-export-csv"
        >
          <Download size={15} />
          Export CSV
        </a>
      </div>

      {/* Data Table */}
      <div className="table-wrapper">
        {loading ? (
          <TableSkeleton />
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <Database size={40} />
            <h3>{search ? 'No results found' : 'No calculations yet'}</h3>
            <p>
              {search
                ? `No leads match "${search}". Try a different search term.`
                : 'Saved calculations from the calculator will appear here.'}
            </p>
          </div>
        ) : (
          <table className="leads-table" id="leads-table">
            <thead>
              <tr>
                <th>Company / Lead</th>
                <th>FCI</th>
                <th>Total Subsidy</th>
                <th>Payout</th>
                <th>Tier</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const calc = lead.calculation;
                return (
                  <tr key={lead.id} className="clickable-row" onClick={() => setSelectedLead(lead)}>
                    <td>
                      <div className="td-company">
                        <span className="company-name">{lead.company}</span>
                        <span className="company-email">{lead.name} · {lead.email}</span>
                      </div>
                    </td>
                    <td className="td-money">
                      {calc ? formatCr(calc.fci) : '—'}
                    </td>
                    <td className="td-subsidy">
                      {calc ? formatCr(calc.total_subsidy) : '—'}
                    </td>
                    <td className="td-money">
                      {calc ? `${formatCr(calc.annual_payout)}/yr` : '—'}
                    </td>
                    <td>
                      {calc ? (
                        <span className={`tier-badge ${getTierClass(calc.disbursement_years)}`}>
                          {getTierLabel(calc.disbursement_years)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="td-date">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
