/*
 * API service — communicates with the FastAPI backend.
 * Falls back to client-side calculation if backend is unavailable.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Full server-side calculation (source of truth).
 */
export async function calculateSubsidy(inputs) {
  const payload = {
    land_cost: inputs.landCost,
    building_cost: inputs.buildingCost,
    new_machinery: inputs.newMachinery,
    refurb_machinery: inputs.refurbMachinery,
    is_goi_evaluated: inputs.isGoiEval,
    is_rented_building: inputs.isRented,
    employment_count: inputs.employmentCount,
    incentive_type: inputs.incentiveType,
    focus_sector: inputs.focusSector || null,
    anchor_count: inputs.anchorCount || null,
  };

  const { data } = await api.post('/api/calculate', payload);
  return data;
}

/**
 * Save lead + calculation to the database.
 */
export async function saveLead(leadInfo, calculationInputs) {
  const payload = {
    name: leadInfo.name,
    company: leadInfo.company,
    email: leadInfo.email,
    contact_number: leadInfo.contactNumber || null,
    calculation: {
      land_cost: calculationInputs.landCost,
      building_cost: calculationInputs.buildingCost,
      new_machinery: calculationInputs.newMachinery,
      refurb_machinery: calculationInputs.refurbMachinery,
      is_goi_evaluated: calculationInputs.isGoiEval,
      is_rented_building: calculationInputs.isRented,
      employment_count: calculationInputs.employmentCount,
      incentive_type: calculationInputs.incentiveType,
      focus_sector: calculationInputs.focusSector || null,
      anchor_count: calculationInputs.anchorCount || null,
    },
  };

  const { data } = await api.post('/api/save-lead', payload);
  return data;
}


// ─── Dashboard API ───────────────────────────────

/**
 * Fetch all leads with optional search filtering.
 */
export async function fetchLeads(search = '') {
  const params = search.trim() ? { search: search.trim() } : {};
  const { data } = await api.get('/api/leads', { params });
  return data;
}

/**
 * Fetch aggregate analytics for the dashboard summary cards.
 */
export async function fetchDashboardStats() {
  const { data } = await api.get('/api/dashboard-stats');
  return data;
}

/**
 * Get the full URL for the CSV export endpoint (for direct download).
 */
export function getExportCsvUrl() {
  return `${API_BASE}/api/export-csv`;
}
