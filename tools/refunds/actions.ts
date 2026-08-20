'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/scaffold/db';
import { logAction } from '@/scaffold/audit';
import { ForbiddenError, requireRole } from '@/scaffold/roles';

export type DecisionResult = { ok: boolean; message: string };

const DECISIONS: Record<string, 'approved' | 'rejected'> = {
  approve: 'approved',
  reject: 'rejected',
};

/**
 * Records a refund decision. Authorization happens here, on the server, through the
 * same scaffold role check the KYC tool uses.
 */
export async function decideRefund(_prev: DecisionResult | null, formData: FormData): Promise<DecisionResult> {
  const refundId = Number.parseInt(String(formData.get('refundId') ?? ''), 10);
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

  if (!Number.isInteger(refundId) || !status) {
    return { ok: false, message: 'Invalid request: unknown refund request or decision.' };
  }
  if (!reason) {
    return { ok: false, message: 'A free-text reason is required for every decision.' };
  }

  const db = getDb();
  const refund = db.prepare('SELECT id, status FROM refund_requests WHERE id = ?').get(refundId) as
    | { id: number; status: string }
    | undefined;

  if (!refund) {
    return { ok: false, message: `Refund request ${refundId} not found.` };
  }
  if (refund.status !== 'pending') {
    return { ok: false, message: `Refund request ${refundId} was already ${refund.status}.` };
  }

  const decidedAt = new Date().toISOString();
  db.prepare(
    `UPDATE refund_requests
     SET status = ?, decided_by = ?, decided_at = ?, decision_reason = ?
     WHERE id = ?`,
  ).run(status, reviewer.id, decidedAt, reason, refundId);

  logAction({
    actorUserId: reviewer.id,
    action: `refunds.${decisionKey}`,
    targetType: 'refund_request',
    targetId: refundId,
    reason,
  });

  revalidatePath('/tools/refunds');
  revalidatePath(`/tools/refunds/${refundId}`);
  revalidatePath('/audit');

  return { ok: true, message: `Refund request ${status}. Decision recorded in the audit trail.` };
}
