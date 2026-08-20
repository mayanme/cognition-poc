---
name: testing-internal-tools-demo
description: How to run and end-to-end test the local-only internal-tools demo app (Next.js App Router + better-sqlite3) in this repo — seeding, fake login, role enforcement, audit trail, and DB verification.
---

# Testing the internal-tools demo app

## Bring it up (all local, no secrets required)

```bash
npm install            # already done in Devin sessions via blueprint maintenance
npm run seed           # (re)creates db/demo.sqlite with fake data — safest way to reset between runs
npm run dev            # http://localhost:3000
```

Start the dev server in the background and confirm readiness with
`curl -s -o /dev/null -w "%{http_code}" localhost:3000/tools/kyc` (expect 200); the dev server is often
not running at session start even though `npm install` is.

**Devin Secrets Needed:** none. The app has no real auth, no external services, no network calls.

## Fake login / roles

`/login` is a pick-a-user list; clicking "Sign in as this user" sets the plain `demo_user_id` cookie
(`scaffold/auth.ts`). Seeded users are listed reviewers-first: Grace Reviewer (id 2), Radia Reviewer (4),
Ada Viewer (1), Linus Viewer (3). "Switch user" in the top-right nav returns to `/login`.
Role enforcement lives server-side in `requireRole()` (`scaffold/roles.ts`) and is called inside the
`decideApplicant` Server Action, so 403s surface as an inline red message in the decision form panel —
not as an HTTP error page. Don't expect a 500/error overlay when probing authorization.

## Useful adversarial techniques

- **Forge/blank the session:** the cookie is `httpOnly`, so JS can't touch it. Use DevTools →
  Application → Storage → Cookies → `http://localhost:3000`, double-click the `demo_user_id` value and
  set it to something bogus (e.g. `999`). Load the applicant detail page *before* editing the cookie, then
  submit the already-rendered form — otherwise the form isn't rendered at all for an unknown user and the
  server action can't be reached from the UI.
- **Race / already-decided path:** open the same pending applicant in a second tab *before* deciding it,
  decide in tab 1, then submit the stale form in tab 2. Expect `Applicant <id> was already <status>.`
- **Empty reason:** submitting Approve/Reject with an empty textarea must return
  "A free-text reason is required for every decision." (there is no client-side `required`, so this
  genuinely exercises the server check).

## Verifying persistence

There is no `sqlite3` CLI on the box; use node with the repo's dependency:

```bash
node -e "const db=require('better-sqlite3')('db/demo.sqlite');
console.log(db.prepare('select id,name,status,decided_by,decided_at,decision_reason from applicants where id=?').get(10));
console.log(db.prepare(\"select * from audit_log where action like 'kyc.%'\").all());"
```

Key invariants worth asserting: refused decisions must leave `applicants.status='pending'` AND write
**no** `audit_log` row (only `login` rows are logged for auth events); successful decisions write exactly
one `kyc.approve`/`kyc.reject` row with the free-text reason.

## Gotchas

- Pages use `export const dynamic = 'force-dynamic'`, so the queue/audit reflect DB state on reload; the
  pending count on `/tools/kyc` drops as you decide applicants (12 → 10 after one approve + one reject on
  a freshly seeded DB) — a cheap end-to-end signal.
- Displayed user names include the role suffix, e.g. `Grace Reviewer (reviewer)`, in the audit/detail
  views while the nav strips it.
