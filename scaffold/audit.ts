import { getDb } from './db';
import type { AuditEntry } from './types';

export type LogActionInput = {
  actorUserId: number;
  action: string;
  targetType: string;
  targetId: string | number;
  reason?: string | null;
};

/** Writes a permanent audit row. Audit rows are append-only: nothing in the app updates or deletes them. */
export function logAction({ actorUserId, action, targetType, targetId, reason }: LogActionInput): void {
  getDb()
    .prepare(
      `INSERT INTO audit_log (actor_user_id, action, target_type, target_id, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(actorUserId, action, targetType, String(targetId), reason ?? null, new Date().toISOString());
}

export function listAuditEntries(): AuditEntry[] {
  return getDb()
    .prepare(
      `SELECT a.id, a.actor_user_id, u.name AS actor_name, a.action, a.target_type, a.target_id, a.reason, a.created_at
       FROM audit_log a
       LEFT JOIN users u ON u.id = a.actor_user_id
       ORDER BY a.created_at DESC, a.id DESC`,
    )
    .all() as AuditEntry[];
}
