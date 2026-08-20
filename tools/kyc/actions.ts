'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/scaffold/db';
import { logAction } from '@/scaffold/audit';
import { ForbiddenError, requireRole } from '@/scaffold/roles';
import type { ApplicantStatus } from '@/scaffold/types';

export type DecisionResult = { ok: boolean; message: string };

const DECISIONS: Record<string, ApplicantStatus> = {
  approve: 'approved',
  reject: 'rejected',
};

/**
 * Records a KYC decision. Authorization happens here, on the server: hiding the
 * buttons for viewers is cosmetic, this check is the real enforcement.
 */
export async function decideApplicant(_prev: DecisionResult | null, formData: FormData): Promise<DecisionResult> {
  const applicantId = Number.parseInt(String(formData.get('applicantId') ?? ''), 10);
  const decisionKey = String(formData.get('decision') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  const status = DECISIONS[decisionKey];

  let reviewer;
  try {
    reviewer = requireRole('reviewer');
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }

  if (!Number.isInteger(applicantId) || !status) {
    return { ok: false, message: 'Invalid request: unknown applicant or decision.' };
  }
  if (!reason) {
    return { ok: false, message: 'A free-text reason is required for every decision.' };
  }

  const db = getDb();
  const applicant = db.prepare('SELECT id, status FROM applicants WHERE id = ?').get(applicantId) as
    | { id: number; status: ApplicantStatus }
    | undefined;

  if (!applicant) {
    return { ok: false, message: `Applicant ${applicantId} not found.` };
  }
  if (applicant.status !== 'pending') {
    return { ok: false, message: `Applicant ${applicantId} was already ${applicant.status}.` };
  }

  const decidedAt = new Date().toISOString();
  db.prepare(
    `UPDATE applicants
     SET status = ?, decided_by = ?, decided_at = ?, decision_reason = ?
     WHERE id = ?`,
  ).run(status, reviewer.id, decidedAt, reason, applicantId);

  logAction({
    actorUserId: reviewer.id,
    action: `kyc.${decisionKey}`,
    targetType: 'applicant',
    targetId: applicantId,
    reason,
  });

  revalidatePath('/tools/kyc');
  revalidatePath(`/tools/kyc/${applicantId}`);
  revalidatePath('/audit');

  return { ok: true, message: `Applicant ${status}. Decision recorded in the audit trail.` };
}
