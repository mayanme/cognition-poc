import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/scaffold/auth';
import { hasRole } from '@/scaffold/roles';
import { getRefundRequest } from '@/tools/refunds/data';
import { RefundDecisionForm } from '@/tools/refunds/RefundDecisionForm';

export const dynamic = 'force-dynamic';

export default function RefundDetailPage({ params }: { params: { id: string } }) {
  const refundId = Number.parseInt(params.id, 10);
  if (!Number.isInteger(refundId)) notFound();

  const refund = getRefundRequest(refundId);
  if (!refund) notFound();

  const user = getCurrentUser();
  const isReviewer = hasRole(user, 'reviewer');

  return (
    <>
      <p>
        <Link href="/tools/refunds">← Back to refund requests</Link>
      </p>
      <h1>{refund.customer_name}</h1>

      <div className="panel">
        <dl className="detail">
          <dt>Refund request id</dt>
          <dd>{refund.id}</dd>
          <dt>Amount</dt>
          <dd>${refund.amount.toFixed(2)}</dd>
          <dt>Status</dt>
          <dd>
            <span className={`badge ${refund.status}`}>{refund.status}</span>
          </dd>
          <dt>Requested</dt>
          <dd>{refund.requested_at.slice(0, 10)}</dd>
          <dt>Decided by</dt>
          <dd>{refund.decided_by_name ?? <span className="muted">—</span>}</dd>
          <dt>Decided at</dt>
          <dd>{refund.decided_at?.replace('T', ' ').slice(0, 19) ?? <span className="muted">—</span>}</dd>
          <dt>Decision reason</dt>
          <dd>{refund.decision_reason ?? <span className="muted">—</span>}</dd>
        </dl>
      </div>

      {!user && (
        <div className="error">
          No demo user selected. <Link href={`/login?next=/tools/refunds/${refund.id}`}>Pick a user</Link> to continue.
        </div>
      )}

      {refund.status === 'pending' && user && <RefundDecisionForm refundId={refund.id} isReviewer={isReviewer} />}

      {refund.status !== 'pending' && (
        <div className="stub-note">
          This refund request is already {refund.status}; decisions are final in this prototype.
        </div>
      )}

      <div className="stub-note" style={{ marginTop: 16 }}>
        <strong>Demo stub:</strong> nothing is refunded — there is no payment provider, no ledger and no refund
        eligibility logic behind this record, only a seeded customer name and amount.
      </div>
    </>
  );
}
