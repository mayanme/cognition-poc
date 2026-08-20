/**
 * Server-side role enforcement. This is the real guarantee behind every mutation:
 * hiding buttons in the UI is only a convenience.
 */
import { getCurrentUser } from './auth';
import type { Role, User } from './types';

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function requireUser(): User {
  const user = getCurrentUser();
  if (!user) {
    throw new ForbiddenError('403 Forbidden: no user selected. Pick a demo user first.');
  }
  return user;
}

export function requireRole(role: Role): User {
  const user = requireUser();
  if (user.role !== role) {
    throw new ForbiddenError(
      `403 Forbidden: ${user.name} has role "${user.role}" but this action requires role "${role}".`,
    );
  }
  return user;
}

export function hasRole(user: User | null, role: Role): boolean {
  return user?.role === role;
}
