/**
 * DEMO STUB AUTH.
 *
 * There are no passwords, no SSO and no identity verification of any kind: the
 * "login" is a pick-a-user list over the seeded users, and the chosen user id is
 * stored in a plain cookie that anyone could edit. In production this whole file
 * would be replaced by the company SSO/OIDC integration.
 */
import { cookies } from 'next/headers';
import { getDb } from './db';
import type { User } from './types';

export const SESSION_COOKIE = 'demo_user_id';

export function listUsers(): User[] {
  return getDb().prepare('SELECT id, name, role FROM users ORDER BY role, id').all() as User[];
}

export function getUserById(id: number): User | null {
  const user = getDb().prepare('SELECT id, name, role FROM users WHERE id = ?').get(id) as User | undefined;
  return user ?? null;
}

export function getCurrentUser(): User | null {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id)) return null;
  return getUserById(id);
}

export function setSessionCookie(userId: number): void {
  cookies().set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE);
}
