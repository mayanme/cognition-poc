import { getDb } from '@/scaffold/db';
import type { Applicant, ApplicantWithDecider } from '@/scaffold/types';

export type QueueFilter = 'pending' | 'all';

export function listApplicants(filter: QueueFilter): Applicant[] {
  const db = getDb();
  if (filter === 'pending') {
    return db
      .prepare("SELECT * FROM applicants WHERE status = 'pending' ORDER BY risk_score DESC, id")
      .all() as Applicant[];
  }
  return db.prepare('SELECT * FROM applicants ORDER BY status, risk_score DESC, id').all() as Applicant[];
}

export function getApplicant(id: number): ApplicantWithDecider | null {
  const applicant = getDb()
    .prepare(
      `SELECT a.*, u.name AS decided_by_name
       FROM applicants a
       LEFT JOIN users u ON u.id = a.decided_by
       WHERE a.id = ?`,
    )
    .get(id) as ApplicantWithDecider | undefined;
  return applicant ?? null;
}
