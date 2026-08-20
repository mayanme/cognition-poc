'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { decideRefund, type DecisionResult } from './actions';

function SubmitButton({ decision, label, className }: { decision: string; label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name="decision" value={decision} className={className} disabled={pending}>
      {pending ? 'Saving…' : label}
    </button>
  );
}

/**
 * Rendered for reviewers, and — clearly labeled — for viewers so the demo can show
 * that the server rejects unauthorized decisions rather than relying on hidden buttons.
 */
export function RefundDecisionForm({ refundId, isReviewer }: { refundId: number; isReviewer: boolean }) {
  const [state, formAction] = useFormState<DecisionResult | null, FormData>(decideRefund, null);

  return (
    <form action={formAction} className="panel">
      <h2>{isReviewer ? 'Record a decision' : 'Decision controls (reviewer only)'}</h2>

      {state && <div className={state.ok ? 'stub-note' : 'error'}>{state.message}</div>}

      <input type="hidden" name="refundId" value={refundId} />

      <label className="field-label" htmlFor="reason">
        Reason (required, free text)
      </label>
      <textarea id="reason" name="reason" placeholder="Why are you approving or rejecting this refund request?" />

      <div className="row" style={{ marginTop: 12 }}>
        {isReviewer ? (
          <>
            <SubmitButton decision="approve" label="Approve" className="primary" />
            <SubmitButton decision="reject" label="Reject" className="danger" />
          </>
        ) : (
          <>
            <SubmitButton decision="approve" label="Force approve (expect 403)" />
            <span className="muted">
              You are a viewer, so the real approve/reject buttons are hidden. This deliberately exposed button submits
              the same Server Action to prove the 403 is enforced server-side.
            </span>
          </>
        )}
      </div>
    </form>
  );
}
