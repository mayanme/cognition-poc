import { listUsers, getCurrentUser } from '@/scaffold/auth';
import { loginAsUser } from '@/scaffold/session-actions';

export const dynamic = 'force-dynamic';

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const users = listUsers();
  const current = getCurrentUser();

  return (
    <>
      <h1>Pick a user (demo stub login)</h1>
      <div className="stub-note">
        <strong>This is a fake login.</strong> No password, no SSO, no identity verification — clicking a name simply
        stores that user id in a cookie. It exists so the demo can show role enforcement. Production would use the
        company SSO/OIDC provider.
      </div>

      {users.length === 0 && (
        <div className="error" style={{ marginTop: 16 }}>
          No users found. Run <code>npm run seed</code> to create and populate the SQLite database.
        </div>
      )}

      {searchParams.error && (
        <div className="error" style={{ marginTop: 16 }}>
          Unknown user. Pick one from the list below.
        </div>
      )}

      <div className="panel" style={{ marginTop: 20 }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Can decide?</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name.replace(/\s*\(\w+\)$/, '')}</td>
                <td>
                  <span className="badge role">{user.role}</span>
                </td>
                <td className="muted">{user.role === 'reviewer' ? 'Yes — approve/reject' : 'No — read-only'}</td>
                <td>
                  <form action={loginAsUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="next" value={searchParams.next ?? '/tools/kyc'} />
                    <button className="primary" type="submit">
                      {current?.id === user.id ? 'Stay as this user' : 'Sign in as this user'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
