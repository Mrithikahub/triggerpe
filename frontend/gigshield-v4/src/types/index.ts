export type Platform = 'Zomato' | 'Swiggy';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ClaimStatus = 'approved' | 'review' | 'rejected';
export type TriggerType = 'HEAVY_RAIN' | 'EXTREME_HEAT' | 'HIGH_AQI';

export interface Worker {
  worker_id: string;
  name: string;
  city: string;
  platform: Platform;
  avg_daily_earning: number;
  risk_score: number;
  risk_level: RiskLevel;
  risk_zone: RiskLevel;
  registered_at: string;
}

export interface Policy {
  policy_id: string;
  worker_id: string;
  weeks: number;
  weekly_premium: number;
  total_premium: number;
  coverage_per_event: number;
  risk_level: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired';
}

export interface Claim {
  claim_id: string;
  worker_id: string;
  policy_id: string;
  trigger_type: TriggerType;
  amount: number;
  status: ClaimStatus;
  fraud_score: number;
  fraud_flags: string[];
  location: string;
  is_auto: boolean;
  created_at: string;
}

export interface Analytics {
  total_workers: number;
  total_claims: number;
  fraud_alerts: number;
  active_disruptions: string[];
  policies: { total: number; active: number; premium_collected: number };
  claims: { approved: number; review: number; rejected: number; auto_triggered: number; total_payout: number };
  fraud: { flagged: number; rejected: number; fraud_rate: number };
  financials: { premium_in: number; payouts_out: number; net_position: number };
}

export interface WorkerRegistration {
  name: string;
  city: string;
  platform: Platform;
  avg_daily_earning: number;
}

export interface PolicyCreate { worker_id: string; weeks: number }

export interface ClaimCreate {
  worker_id: string;
  trigger_type: TriggerType;
  amount: number;
  location: string;
  gps_lat?: number;
  gps_lng?: number;
}

export interface TriggerInput {
  city: string;
  temperature: number;
  rainfall: number;
  aqi: number;
}
