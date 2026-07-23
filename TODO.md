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

## Phase 5 - Finish the already-started Today/Tracker unification

- [x] Re-run the existing idempotent daily task/log and hobby backfill logic to catch drift before cutover.
- [x] Update money-tracker DTOs and service to read/write existing unified MoneyEntry columns.
- [x] Update today service/controller/DTOs to use routine completion status, points, and linked money fields.
- [x] Cut frontend `/tracker` over to routine_items/routine_completions via today endpoints.
- [x] Repurpose `/tracker` nav tab into a read-only History view for past routine completions.
- [ ] Retire daily-tasks/daily-logs backend modules and remove them from app.module.ts after cutover verification.

## Phase 6 - Fix known bugs and UI inconsistencies

- [ ] Make Today row reminder bell a real `reminder_enabled` toggle.
- [ ] Remove tap-target styling from the decorative Today time-block badge.
- [ ] Normalize input/button padding across pages to match Today (`px-4 py-3`).
- [ ] Remove raw admin/catalog fields from the everyday add-item form if still present after Phase 5.

## Phase 7 - Wire budgeting and smart entry on top of the existing schema

- [ ] Wire MoneyBudget into money-tracker service/controller as optional monthly category limits.
- [ ] Support optional itemized sub-entries with `parent_entry_id`.
- [ ] Use `is_recurring` and `recurrence_rule` for automatic bills/subscriptions.
- [ ] Add history-based fuzzy autofill before optional Gemini categorization.
- [ ] Wire meal-to-money sync through `needs_price` and `meal_entries.linked_money_entry_id`.
- [ ] Build generic pending linked entry support using `source_type` and `source_id`.
- [ ] Surface a persistent glanceable needs-price queue.

## Phase 8 - Finish the Hobbies to Lifestyle Activities cutover

- [ ] Re-run the idempotent hobby backfill to catch drift.
- [ ] Cut frontend `/hobbies` over to lifestyle_activities filtered to `activity_type: 'hobby'`.
- [ ] Surface Hobbies and Learning-log entries directly inside Today's list.
- [ ] Retire hobbies module and remove it from app.module.ts after verification.

## Phase 9 - Status, automation, and flexible/measurable targets

- [ ] Use `routine_completions.status` as done / failed / skipped.
- [ ] Add day-rollover background job for missing recurring completions.
- [ ] Display missed past completions as failed when no row exists.
- [ ] Add measurable item type with target, actual, and tolerance.
- [ ] Score measurable items on a 0-10 scale.
- [ ] Map simple item results onto the same scoring scale.
- [ ] Add per-date planning overrides using existing `plan_id` columns.

## Phase 10 - Reflections integration

- [ ] Add optional reflection note prompts for completion outcomes.
- [ ] Route completion notes into the day's Reflection entry without overwriting.
- [ ] Remove `routine_completions.note` usage in favor of Reflection routing.
- [ ] Extend reflection routing to unusually large Money entries.
- [ ] Surface matching solutions_bank suggestions for `primary_blocker`.

## Phase 11 - Selective data deletion

- [ ] Build checklist-based delete-my-data tool with live row counts.
- [ ] Exclude reels-vault from deletion categories.
- [ ] Show dependency warnings for partial deletion selections.
- [ ] Show final plain-language confirmation before destructive deletion.
- [ ] Add editable Reset to zero preset.

## Phase 12 - Streaks unification and Analytics correlations

- [ ] Feed routine items, screen check-ins, and lifestyle activities into unified streaks.
- [ ] Add Analytics views for measurable-score trends versus mood/energy.
- [ ] Add Analytics views for failed-task frequency versus spend patterns.

## Phase 13 - AI Plan Builder

- [ ] Add Plan and PlanItem entities.
- [ ] Add Gemini-backed plan chat interface for goal brainstorming.
- [ ] Generate structured dated line-item JSON into an editable draft table.
- [ ] Confirm draft before writing plan items.
- [ ] Write confirmed items through existing routine_items/money_tracker `plan_id` columns.
- [ ] Support reopening plan chat and updating linked items without duplication.
- [ ] Provide manual plan entry when Gemini is not configured.

## Phase 14 - Mobile-first UI pass

- [ ] Use bottom sheets for quick-add/edit forms.
- [ ] Keep primary actions within thumb reach.
- [ ] Keep ~44px tap-target minimum consistent.
- [ ] Avoid hover-dependent interactions and dense small-screen multi-column forms.
- [ ] Add natural swipe gestures where useful.
- [ ] Render history-autocomplete suggestions as tappable chips.

## Notes

- The previous TODO content referenced `/outputs/` files such as `QUICK_START_GUIDE.md`, `FIXME_COMPLETE_PROJECT_SPECIFICATION.md`, and phase prompt files.
- Those referenced files are not present in this repository right now.
- Paste the actual new feature requirements under Phase 2 before implementation starts.
