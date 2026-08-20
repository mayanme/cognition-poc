import Link from 'next/link';
import { getCurrentUser } from '@/scaffold/auth';

export default function HomePage() {
  const user = getCurrentUser();

  return (
    <>
      <h1>Internal tools platform (demo)</h1>
      <p className="muted">
        A prototype built for a build-vs-buy evaluation (Power Apps vs. Devin). Shared scaffold — fake login, roles,
        audit log, layout — reused by every tool.
      </p>

      <div className="panel">
        <h2>Tools</h2>
        <ul>
          <li>
            <Link href="/tools/kyc">KYC Review</Link> — applicant queue with reviewer-only approve/reject decisions.
          </li>
          <li>
            <Link href="/tools/refunds">Refunds</Link> — deliberately minimal read-only stub on the same scaffold.
          </li>
          <li>
            <Link href="/audit">Audit Trail</Link> — every logged action, most recent first.
          </li>
        </ul>
      </div>

      <div className="stub-note">
        {user ? (
          <>
            You are acting as <strong>{user.name}</strong> (role <strong>{user.role}</strong>) via the demo stub login.{' '}
            <Link href="/login">Switch user</Link>.
          </>
        ) : (
          <>
            No demo user selected yet. <Link href="/login">Pick a user</Link> to start — that page is the fake login
            stub.
          </>
        )}
      </div>
    </>
  );
}
