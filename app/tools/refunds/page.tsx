import Link from 'next/link';
import { getCurrentUser } from '@/scaffold/auth';
import { listRefundRequests } from '@/tools/refunds/data';

export const dynamic = 'force-dynamic';

export default function RefundsPage() {
  const user = getCurrentUser();
  const refunds = listRefundRequests();

  return (
    <>
      <h1>Refund requests</h1>
      <div className="stub-note">
        <strong>DEMO STUB TOOL.</strong> This tool is deliberately minimal: it is a read-only list of seeded refund
        requests with no actions. Its point is to show that a second tool inherits the same login, roles, layout and
        audit-log scaffold for free — both roles can view it, nobody can act on it.
      </div>

      {!user && (
        <div className="error" style={{ marginTop: 16 }}>
          No demo user selected. <Link href="/login?next=/tools/refunds">Pick a user</Link> to continue.
        </div>
      )}

      <table style={{ marginTop: 18 }}>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Requested</th>
          </tr>
        </thead>
        <tbody>
          {refunds.map((refund) => (
            <tr key={refund.id}>
              <td>{refund.customer_name}</td>
              <td>${refund.amount.toFixed(2)}</td>
              <td>
                <span className={`badge ${refund.status}`}>{refund.status}</span>
              </td>
              <td className="muted">{refund.requested_at.slice(0, 10)}</td>
            </tr>
          ))}
          {refunds.length === 0 && (
            <tr>
              <td colSpan={4} className="muted">
                Nothing here. Run <code>npm run seed</code> if the database is empty.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
