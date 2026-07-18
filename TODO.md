# FixMe Implementation TODO

## Current Status

- [x] Monorepo structure and Docker Compose scaffold
- [x] Backend bootstrap with NestJS, Swagger, config, and PostgreSQL wiring
- [x] Core backend modules: auth, users, daily tasks, daily logs, streaks
- [x] Secondary backend modules: hobbies, learning logs, reflections, reels vault, money tracker, analytics, solutions bank, Gemini wrapper
- [x] Seed script and local environment examples
- [x] Frontend auth screens and protected dashboard shell
- [x] Frontend pages for dashboard, tracker, analytics, reels, learning, and settings
- [x] Database migrations
- [ ] Full CRUD polish and deeper frontend interactions for every module
- [ ] Automated tests
- [ ] End-to-end Docker verification
- [ ] AWS deployment / CI pipeline

## Next High-Value Work

1. Deepen the frontend pages with edit/delete flows, better empty/loading states, and charts.
2. Expand automated tests beyond the initial analytics service coverage.
3. Run the full stack through Docker and fix any runtime integration gaps.
4. Add AWS deployment and CI pipeline automation.

## Phase Plan

### Phase 1 - Backend schema foundation

- [x] Add TypeORM migration scripts.
- [x] Add initial schema migration for the currently wired backend entities.
- [x] Default local schema sync to off in the app and env example.

### Phase 2 - Automated safety net

- [x] Add lightweight backend test command.
- [x] Cover weekly analytics and blocker aggregation.
- [ ] Add service/controller tests for auth, daily logs, streaks, and CRUD modules.

### Phase 3 - Runtime verification

- [x] Verify backend production build.
- [x] Verify frontend production build.
- [x] Verify Docker Compose config renders with migration env vars.
- [ ] Run full Docker Compose stack end to end.

### Phase 4 - Product polish

- [ ] Add edit/delete flows across frontend modules.
- [ ] Improve empty and loading states.
- [ ] Add richer analytics charts and frontend interactions.

### Phase 5 - Delivery

- [ ] Add CI pipeline.
- [ ] Add AWS deployment path and environment documentation.
