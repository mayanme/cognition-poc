import Link from 'next/link';
import { getCurrentUser } from '@/scaffold/auth';
import { listApplicants, type QueueFilter } from '@/tools/kyc/data';

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

export default function KycQueuePage({ searchParams }: { searchParams: { status?: string } }) {
  const filter: QueueFilter = searchParams.status === 'all' ? 'all' : 'pending';
  const user = getCurrentUser();
  const applicants = listApplicants(filter);

  return (
    <>
      <h1>KYC review queue</h1>
      <p className="muted">
        Fake applicants, fake risk scores. Only users with the <strong>reviewer</strong> role can approve or reject.
      </p>

      {!user && (
        <div className="error">
          No demo user selected. <Link href="/login?next=/tools/kyc">Pick a user</Link> to continue.
        </div>
      )}

      <div className="row" style={{ marginBottom: 14 }}>
        <span className="muted">Filter:</span>
        <Link href="/tools/kyc?status=pending" className="button">
          <strong style={{ fontWeight: filter === 'pending' ? 700 : 400 }}>Pending only</strong>
        </Link>
        <Link href="/tools/kyc?status=all" className="button">
          <strong style={{ fontWeight: filter === 'all' ? 700 : 400 }}>All applicants</strong>
        </Link>
        <span className="muted">
          {applicants.length} {filter === 'pending' ? 'pending' : 'total'}
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Risk score</th>
            <th>Status</th>
            <th>Submitted</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant.id}>
              <td>{applicant.name}</td>
              <td>{applicant.risk_score}</td>
              <td>
                <span className={`badge ${applicant.status}`}>{applicant.status}</span>
              </td>
              <td className="muted">{formatDate(applicant.submitted_at)}</td>
              <td>
                <Link href={`/tools/kyc/${applicant.id}`}>Open</Link>
              </td>
            </tr>
          ))}
          {applicants.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                Nothing here. Run <code>npm run seed</code> if the database is empty.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
