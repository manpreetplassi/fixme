# FixMe - Personal Habit & Self-Improvement Tracker

## Quick Start (Local)

### Prerequisites
- Docker + Docker Compose installed
- Node.js 18+ (for running outside Docker)

### Run locally
```bash
git clone <repo>
cd fixme
docker compose up -d
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- Default login: `demo@fixme.app` / `Demo@123`

## Notes

- `docker compose up -d` starts only the required local service: PostgreSQL.
- `npm run dev` installs missing dependencies, creates missing env files, runs backend migrations, seeds demo data, and starts both the backend and frontend dev servers.
- Gemini integration is optional; leave `GEMINI_API_KEY` empty to use the fallback analysis path.
- The frontend expects the API base URL to include `/api`.

## Deployment

- Vercel frontend guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Future AWS backend path is also documented there and should stay in the project.
