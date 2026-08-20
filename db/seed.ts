/**
 * Seeds the local SQLite file with entirely fake data.
 * Run with `npm run seed`. Safe to re-run: it wipes and repopulates the demo tables.
 */
import { getDb, DB_PATH } from '../scaffold/db';

const USERS: Array<{ name: string; role: 'viewer' | 'reviewer' }> = [
  { name: 'Ada Viewer (viewer)', role: 'viewer' },
  { name: 'Grace Reviewer (reviewer)', role: 'reviewer' },
  { name: 'Linus Viewer (viewer)', role: 'viewer' },
  { name: 'Radia Reviewer (reviewer)', role: 'reviewer' },
];

const APPLICANTS: Array<{ name: string; risk_score: number; status: 'pending' | 'approved' | 'rejected'; days_ago: number }> = [
  { name: 'Nadia Okafor', risk_score: 12, status: 'pending', days_ago: 1 },
  { name: 'Tomas Beltran', risk_score: 34, status: 'pending', days_ago: 1 },
  { name: 'Priya Raman', risk_score: 58, status: 'pending', days_ago: 2 },
  { name: 'Jonas Vogel', risk_score: 71, status: 'pending', days_ago: 2 },
  { name: 'Amara Diallo', risk_score: 25, status: 'pending', days_ago: 3 },
  { name: 'Wei Zhang', risk_score: 83, status: 'pending', days_ago: 3 },
  { name: 'Sofia Marchetti', risk_score: 44, status: 'pending', days_ago: 4 },
  { name: 'Hakim Farouk', risk_score: 66, status: 'pending', days_ago: 4 },
  { name: 'Elena Petrova', risk_score: 19, status: 'pending', days_ago: 5 },
  { name: 'Marcus Hale', risk_score: 91, status: 'pending', days_ago: 5 },
  { name: 'Yuki Tanaka', risk_score: 37, status: 'pending', days_ago: 6 },
  { name: 'Ines Costa', risk_score: 52, status: 'pending', days_ago: 7 },
  { name: 'Dmitri Volkov', risk_score: 77, status: 'approved', days_ago: 9 },
  { name: 'Fatima Nasser', risk_score: 29, status: 'rejected', days_ago: 10 },
];

const REFUNDS: Array<{ customer_name: string; amount: number; status: 'pending' | 'approved' | 'rejected'; days_ago: number }> = [
  { customer_name: 'Nadia Okafor', amount: 42.5, status: 'pending', days_ago: 1 },
  { customer_name: 'Tomas Beltran', amount: 128.0, status: 'pending', days_ago: 1 },
  { customer_name: 'Priya Raman', amount: 19.99, status: 'approved', days_ago: 2 },
  { customer_name: 'Jonas Vogel', amount: 310.75, status: 'pending', days_ago: 3 },
  { customer_name: 'Amara Diallo', amount: 75.0, status: 'rejected', days_ago: 3 },
  { customer_name: 'Wei Zhang', amount: 220.4, status: 'pending', days_ago: 4 },
  { customer_name: 'Sofia Marchetti', amount: 64.2, status: 'approved', days_ago: 5 },
  { customer_name: 'Hakim Farouk', amount: 15.0, status: 'pending', days_ago: 6 },
  { customer_name: 'Elena Petrova', amount: 499.99, status: 'pending', days_ago: 7 },
  { customer_name: 'Marcus Hale', amount: 88.8, status: 'approved', days_ago: 8 },
];

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function seed(): void {
  const db = getDb();

  db.exec('DELETE FROM audit_log; DELETE FROM applicants; DELETE FROM refund_requests; DELETE FROM users;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('audit_log', 'applicants', 'refund_requests', 'users');");

  const insertUser = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
  for (const user of USERS) insertUser.run(user.name, user.role);

  const reviewerId = (db.prepare("SELECT id FROM users WHERE role = 'reviewer' ORDER BY id LIMIT 1").get() as { id: number }).id;

  const insertApplicant = db.prepare(
    `INSERT INTO applicants (name, risk_score, status, submitted_at, decided_by, decided_at, decision_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const applicant of APPLICANTS) {
    const decided = applicant.status !== 'pending';
    insertApplicant.run(
      applicant.name,
      applicant.risk_score,
      applicant.status,
      daysAgoIso(applicant.days_ago),
      decided ? reviewerId : null,
      decided ? daysAgoIso(applicant.days_ago - 1) : null,
      decided ? 'Seeded historical decision (demo data).' : null,
    );
  }

  const insertRefund = db.prepare(
    `INSERT INTO refund_requests (customer_name, amount, status, requested_at, decided_by, decided_at, decision_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const refund of REFUNDS) {
    const decided = refund.status !== 'pending';
    insertRefund.run(
      refund.customer_name,
      refund.amount,
      refund.status,
      daysAgoIso(refund.days_ago),
      decided ? reviewerId : null,
      decided ? daysAgoIso(refund.days_ago - 1) : null,
      decided ? 'Seeded historical decision (demo data).' : null,
    );
  }

  console.log(`Seeded ${USERS.length} users, ${APPLICANTS.length} applicants, ${REFUNDS.length} refund requests.`);
  console.log(`Database file: ${DB_PATH}`);
}

seed();
