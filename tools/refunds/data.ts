import { getDb } from '@/scaffold/db';
import type { RefundRequest } from '@/scaffold/types';

export function listRefundRequests(): RefundRequest[] {
  return getDb()
    .prepare('SELECT * FROM refund_requests ORDER BY requested_at DESC, id DESC')
    .all() as RefundRequest[];
}
