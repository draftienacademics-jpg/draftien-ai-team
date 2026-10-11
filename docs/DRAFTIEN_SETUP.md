# Draftien AI Headquarters — Phase 1

## Scope
This branch is an internal evaluation workspace, not a production AI workforce.

- Draftien-branded headquarters with four recommended AI roles.
- Manual, authenticated, **per-user** task queue and review flow.
- State transitions: `planned -> in_review -> approved | rejected`.
- Append-only activity records for task creation, submission, and review.
- Internal approvals **do not** publish, spend, send messages, or run an agent.

## License hold
Upstream `code-with-antonio/ai-teammates` is publicly visible but has no declared LICENSE. Do not assume commercial distribution rights. Get written licensing permission or replace the upstream-derived implementation before commercial release.

## Local configuration
Use Node.js >=20.12, npm, Clerk, a separate **development** Neon Postgres instance + AI Gateway, Trigger.dev, and Daytona. Sentry is optional. See the upstream README for exact environment variable names.

- Make `.env.local` with secrets locally. Never commit credentials.
- Clerk Billing needs feature slugs `bots` and `sandboxes` for bot creation.
- Trigger.dev has a separate task environment for credentials.
- **Never run `db:push` against Draftien production data.**

Run:

```bash
npm ci
npm run db:push            # DEVELOPMENT database only
npm run dev                # terminal 1
npx trigger.dev@4.7.3 dev  # terminal 2
```

Open `http://localhost:3000`, sign in, and use **Work & approvals**.

## Manual verification
1. Create a work item and ensure only its author can view it.
2. Submit a draft and approve or reject it; verify the audit activity.
3. Confirm repeated submission/decision is rejected.
4. Log in as another Clerk user and confirm tasks cannot be read or modified.
5. Confirm approval does not send email, publish courses, spend money, or trigger agents.

## Known constraints
- Work queue is per Clerk user, not organization-wide RBAC.
- Submission is manual; no AI agent is attached automatically.
- A role's instructions do **not** grant API access or security restrictions.
- Daytona cloud sandboxes allow shell/desktop operations. Never store production secrets there.
- Set provider-side budgets and sandbox limits before testing.
- Do not connect identifiable student data until privacy, retention, and authorization controls are in place.
- The application build and end-to-end operation must be verified after secrets and development services are configured.

## Next milestone
Create a read-only, scoped Draftien reporting connector using server-side credentials and aggregate test data. Let one AI teammate attach a proposed draft to a task for human review.
