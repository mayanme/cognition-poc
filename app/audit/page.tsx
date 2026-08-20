import { listAuditEntries } from '@/scaffold/audit';

export const dynamic = 'force-dynamic';

export default function AuditPage() {
  const entries = listAuditEntries();

  return (
    <>
      <h1>Audit trail</h1>
      <p className="muted">
        Every logged action across all tools, most recent first. Rows are append-only — nothing in the app edits or
        deletes them.
      </p>

      <table>
        <thead>
          <tr>
            <th>When (UTC)</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="muted">{entry.created_at.replace('T', ' ').slice(0, 19)}</td>
              <td>{entry.actor_name ?? `user ${entry.actor_user_id}`}</td>
              <td>
                <code>{entry.action}</code>
              </td>
              <td>
                {entry.target_type} #{entry.target_id}
              </td>
              <td>{entry.reason ?? <span className="muted">—</span>}</td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                No audit entries yet. Sign in and approve or reject a KYC applicant to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
