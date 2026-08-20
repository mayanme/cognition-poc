export type Role = 'viewer' | 'reviewer';

export type User = {
  id: number;
  name: string;
  role: Role;
};

export type ApplicantStatus = 'pending' | 'approved' | 'rejected';

export type Applicant = {
  id: number;
  name: string;
  risk_score: number;
  status: ApplicantStatus;
  submitted_at: string;
  decided_by: number | null;
  decided_at: string | null;
  decision_reason: string | null;
};

export type ApplicantWithDecider = Applicant & { decided_by_name: string | null };

export type RefundRequest = {
  id: number;
  customer_name: string;
  amount: number;
  status: string;
  requested_at: string;
  decided_by: number | null;
  decided_at: string | null;
  decision_reason: string | null;
};

export type RefundRequestWithDecider = RefundRequest & { decided_by_name: string | null };

export type AuditEntry = {
  id: number;
  actor_user_id: number;
  actor_name: string | null;
  action: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  created_at: string;
};
