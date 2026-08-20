'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clearSessionCookie, getUserById, setSessionCookie } from './auth';
import { logAction } from './audit';

/** DEMO STUB: "logging in" is just picking a seeded user. No credentials are checked. */
export async function loginAsUser(formData: FormData): Promise<void> {
  const userId = Number.parseInt(String(formData.get('userId') ?? ''), 10);
  const user = Number.isInteger(userId) ? getUserById(userId) : null;
  if (!user) {
    redirect('/login?error=unknown-user');
  }

  setSessionCookie(user.id);
  logAction({
    actorUserId: user.id,
    action: 'login',
    targetType: 'user',
    targetId: user.id,
    reason: 'Demo stub login (pick a user, no credentials).',
  });

  const next = String(formData.get('next') ?? '/tools/kyc');
  revalidatePath('/', 'layout');
  redirect(next.startsWith('/') ? next : '/tools/kyc');
}

export async function logout(): Promise<void> {
  clearSessionCookie();
  revalidatePath('/', 'layout');
  redirect('/login');
}
