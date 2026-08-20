import { getDb } from '@/scaffold/db';
import type { RefundRequest, RefundRequestWithDecider } from '@/scaffold/types';

export function listRefundRequests(): RefundRequest[] {
  return getDb()
    .prepare('SELECT * FROM refund_requests ORDER BY requested_at DESC, id DESC')
    .all() as RefundRequest[];
}

export function getRefundRequest(id: number): RefundRequestWithDecider | null {
  const refund = getDb()
    .prepare(
      `SELECT r.*, u.name AS decided_by_name
       FROM refund_requests r
       LEFT JOIN users u ON u.id = r.decided_by
       WHERE r.id = ?`,
    )
    .get(id) as RefundRequestWithDecider | undefined;
  return refund ?? null;
}
