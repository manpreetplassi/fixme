# FixMe TODO

Use this file as the task runner.

- Work from top to bottom.
- Keep every item in `- [ ]` or `- [x]` format.
- Mark a task as `- [x]` only after it is actually complete.
- After completing one task, move to the next unchecked task.

## Phase 1 - TODO Cleanup

- [x] Read the existing TODO file.
- [x] Convert TODO into a clean checklist format.
- [x] Audit whether the referenced `/outputs/` prompt/spec files exist in this repo.
- [x] Add the actual new feature requirements to this TODO file.

## Phase 2 - Feature Implementation Queue

- [x] Break each new feature into backend, frontend, data, and verification chunks.

### Feature 1 - Reels Vault CRUD Polish

- [x] Verify backend Reels Vault create/read/update/delete endpoints.
- [x] Add missing backend Reels Vault CRUD support if needed.
- [x] Skip Reels Vault frontend work for now per user instruction.

### Feature 2 - Learning Logs CRUD Polish

- [x] Verify backend Learning Logs create/read/update/delete endpoints.
- [x] Add missing backend Learning Logs CRUD support if needed.
- [x] Add frontend Learning Logs create/edit/delete flows.
- [x] Add Learning Logs loading, empty, and error states.
- [x] Run backend and frontend verification for Learning Logs.

### Feature 3 - Remaining Module CRUD Polish

- [x] Add full CRUD polish to reflections.
- [x] Add full CRUD polish to money tracker.
- [x] Add full CRUD polish to hobbies.
- [x] Add full CRUD polish to settings/profile.

### Feature 4 - Analytics and Quality

- [x] Improve empty, loading, and error states across dashboard pages.
- [x] Add richer analytics charts and interactions.
- [x] Add service/controller tests for auth, daily logs, streaks, and CRUD modules.

- [x] Implement the first feature backend changes.
- [x] Mark the first feature backend task complete.
- [x] Implement the first feature frontend changes.
- [x] Mark the first feature frontend task complete.
- [x] Run backend verification for the first feature.
- [x] Run frontend verification for the first feature.
- [x] Mark the first feature complete.
- [x] Move to the next feature and repeat the same checklist flow.

## Phase 3 - Current Known Project Backlog

- [x] Add project `.gitignore`.
- [x] Simplify local startup to `docker compose up -d` then `npm run dev`.
- [x] Replace schema sync workflow with TypeORM migrations.
- [x] Add initial database migration.
- [x] Add tracker create/read/update/delete UI for daily logs.
- [x] Add Vercel frontend deployment guide.
- [x] Keep future AWS deployment path documented.
- [x] Add full CRUD polish to learning logs, reflections, money tracker, hobbies, and settings.
- [x] Keep Reels Vault frontend work deferred per user instruction.
- [x] Improve empty, loading, and error states across dashboard pages.
- [x] Add richer analytics charts and interactions.
- [x] Add service/controller tests for auth, daily logs, streaks, and CRUD modules.
- [x] Verify frontend production build after stopping any running local Next dev server.
- [x] Verify backend production build before deployment.
- [x] Add CI pipeline.

## Phase 4 - Release Checklist

- [ ] Confirm Vercel project root is `frontend`.
- [ ] Confirm Vercel env var `NEXT_PUBLIC_API_URL` points to a public backend URL ending in `/api`.
- [ ] Confirm backend env vars are set on the backend host.
- [ ] Confirm backend `FRONTEND_URLS` includes the Vercel domain.
- [ ] Confirm login works on deployed frontend.
- [ ] Confirm tracker CRUD works on deployed frontend.

## Notes

- The previous TODO content referenced `/outputs/` files such as `QUICK_START_GUIDE.md`, `FIXME_COMPLETE_PROJECT_SPECIFICATION.md`, and phase prompt files.
- Those referenced files are not present in this repository right now.
- Paste the actual new feature requirements under Phase 2 before implementation starts.
