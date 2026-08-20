import Link from 'next/link';
import type { ReactNode } from 'react';
import { getCurrentUser } from '../auth';
import { logout } from '../session-actions';
import { DemoBanner } from './DemoBanner';

const TOOLS = [
  { href: '/tools/kyc', label: 'KYC Review' },
  { href: '/tools/refunds', label: 'Refunds (stub)' },
  { href: '/audit', label: 'Audit Trail' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const user = getCurrentUser();

  return (
    <>
      <DemoBanner />
      <header className="topnav">
        <nav>
          <span className="brand">Internal Tools</span>
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              {tool.label}
            </Link>
          ))}
        </nav>
        <div className="who">
          {user ? (
            <>
              <span>
                Signed in as <strong>{user.name.replace(/\s*\(\w+\)$/, '')}</strong>
              </span>
              <span className="badge role">{user.role}</span>
              <Link href="/login">Switch user</Link>
              <form action={logout}>
                <button type="submit">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login">Pick a demo user</Link>
          )}
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
