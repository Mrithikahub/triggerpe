import axios from 'axios';
import type { Worker, WorkerRegistration, Policy, PolicyCreate, Claim, ClaimCreate, Analytics, TriggerInput } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add response interceptor for better error logging
apiClient.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const api = {
  // ── Workers ──────────────────────────────────────────────────────────────
  registerWorker: async (data: WorkerRegistration) => {
    const res = await apiClient.post<Worker>('/workers/register', data);
    return res.data;
  },
  getWorker: async (workerId: string) => {
    const res = await apiClient.get<Worker>(`/workers/${workerId}`);
    return res.data;
  },
  getAllWorkers: async () => {
    const res = await apiClient.get<{ total: number; workers: Worker[] }>('/workers/');
    return res.data;
  },

  // ── Premium ───────────────────────────────────────────────────────────────
  getPremiumQuote: async (workerId: string) => {
    const res = await apiClient.get(`/premium/${workerId}`);
    return res.data;
  },

  // ── Policies ──────────────────────────────────────────────────────────────
  createPolicy: async (data: PolicyCreate) => {
    const res = await apiClient.post<Policy>('/policies/create', data);
    return res.data;
  },
  getWorkerPolicies: async (workerId: string) => {
    const res = await apiClient.get<{ worker_id: string; active_policy: Policy | null; all_policies: Policy[] }>(`/policies/${workerId}`);
    return res.data;
  },

  // ── Claims ────────────────────────────────────────────────────────────────
  createClaim: async (data: ClaimCreate) => {
    const res = await apiClient.post('/claims/create', data);
    return res.data;
  },
  getAllClaims: async () => {
    const res = await apiClient.get<{ total: number; approved: number; review: number; rejected: number; claims: Claim[] }>('/claims/all');
    return res.data;
  },
  getWorkerClaims: async (workerId: string) => {
    const res = await apiClient.get(`/claims/${workerId}`);
    return res.data;
  },
  approveClaim: async (claimId: string) => {
    const res = await apiClient.patch(`/claims/${claimId}/approve`);
    return res.data;
  },
  rejectClaim: async (claimId: string) => {
    const res = await apiClient.patch(`/claims/${claimId}/reject`);
    return res.data;
  },

  // ── Triggers ──────────────────────────────────────────────────────────────
  fireTrigger: async (data: TriggerInput) => {
    const res = await apiClient.post('/trigger', data);
    return res.data;
  },
  autoTrigger: async (city: string) => {
    const res = await apiClient.post(`/trigger/auto/${city}`);
    return res.data;
  },
  // This calls GET /trigger/weather/{city} — uses your WeatherAPI key on backend
  getLiveWeather: async (city: string) => {
    const res = await apiClient.get(`/trigger/weather/${city}`);
    return res.data;
  },
  getThresholds: async () => {
    const res = await apiClient.get('/trigger/thresholds');
    return res.data;
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalytics: async () => {
    const res = await apiClient.get<Analytics>('/analytics');
    return res.data;
  },
};
