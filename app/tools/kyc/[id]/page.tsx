import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/scaffold/auth';
import { hasRole } from '@/scaffold/roles';
import { getApplicant } from '@/tools/kyc/data';
import { DecisionForm } from '@/tools/kyc/DecisionForm';

export const dynamic = 'force-dynamic';

export default function ApplicantDetailPage({ params }: { params: { id: string } }) {
  const applicantId = Number.parseInt(params.id, 10);
  if (!Number.isInteger(applicantId)) notFound();

  const applicant = getApplicant(applicantId);
  if (!applicant) notFound();

  const user = getCurrentUser();
  const isReviewer = hasRole(user, 'reviewer');

  return (
    <>
      <p>
        <Link href="/tools/kyc">← Back to queue</Link>
      </p>
      <h1>{applicant.name}</h1>

      <div className="panel">
        <dl className="detail">
          <dt>Applicant id</dt>
          <dd>{applicant.id}</dd>
          <dt>Risk score</dt>
          <dd>{applicant.risk_score}</dd>
          <dt>Status</dt>
          <dd>
            <span className={`badge ${applicant.status}`}>{applicant.status}</span>
          </dd>
          <dt>Submitted</dt>
          <dd>{applicant.submitted_at.slice(0, 10)}</dd>
          <dt>Decided by</dt>
          <dd>{applicant.decided_by_name ?? <span className="muted">—</span>}</dd>
          <dt>Decided at</dt>
          <dd>{applicant.decided_at?.replace('T', ' ').slice(0, 19) ?? <span className="muted">—</span>}</dd>
          <dt>Decision reason</dt>
          <dd>{applicant.decision_reason ?? <span className="muted">—</span>}</dd>
        </dl>
      </div>

      {!user && (
        <div className="error">
          No demo user selected. <Link href={`/login?next=/tools/kyc/${applicant.id}`}>Pick a user</Link> to continue.
        </div>
      )}

      {applicant.status === 'pending' && user && <DecisionForm applicantId={applicant.id} isReviewer={isReviewer} />}

      {applicant.status !== 'pending' && (
        <div className="stub-note">
          This applicant is already {applicant.status}; decisions are final in this prototype.
        </div>
      )}

      <div className="stub-note" style={{ marginTop: 16 }}>
        <strong>Demo stub:</strong> there are no documents, no sanctions/PEP screening and no real KYC data behind this
        record — just a seeded name and a random-looking risk score.
      </div>
    </>
  );
}
