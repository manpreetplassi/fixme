# FixMe Deployment Guide

This project is a monorepo with two deployable parts:

- `frontend`: Next.js app. Deploy this to Vercel now.
- `backend`: NestJS API plus PostgreSQL. You can deploy it as a separate Vercel project now, then move it to AWS later without changing the app contract.

Deploy the frontend and backend as separate Vercel projects. The frontend calls the backend through `NEXT_PUBLIC_API_URL`.

## Vercel Frontend Deployment

### 1. Import Project

In Vercel, import the Git repository and use these project settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | leave empty |
| Development Command | `npm run dev` |

If your Git repository root contains the outer `fixme` folder, set Root Directory to:

```text
fixme/frontend
```

If your Git repository root is already the `fixme` folder, set Root Directory to:

```text
frontend
```

### 2. Add Vercel Environment Variables

Add these in Vercel Project Settings -> Environment Variables.

| Name | Example Value | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://fixme-backend.vercel.app/api` | Yes | Public backend API URL. `/api` is preferred, and the app also normalizes a URL without it. |

Use the same value for Production, Preview, and Development unless you have separate backend environments.

Important: do not use `http://localhost:3001/api` on Vercel. Browser users cannot reach your local machine from the deployed site.

### 3. Deploy

After env vars are saved:

```bash
git push
```

Vercel will build the frontend and publish a URL like:

```text
https://your-project.vercel.app
```

## Vercel Backend Deployment

### 1. Import Backend Project

Create a second Vercel project for the API and use these settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Root Directory | `backend` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | leave empty |

If your Git repository root contains the outer `fixme` folder, set Root Directory to:

```text
fixme/backend
```

If your Git repository root is already the `fixme` folder, set Root Directory to:

```text
backend
```

The backend includes `backend/vercel.json`, which routes all requests through the NestJS serverless handler at `backend/api/index.ts`.

### 2. Add Backend Environment Variables

Configure these in the backend Vercel project:

| Name | Example Value | Required | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | `postgresql://USER:PASSWORD@HOST:5432/DB_NAME` | Yes | Public or private DB URL available to backend host. |
| `DB_SYNCHRONIZE` | `false` | Yes | Keep false in deployed environments. |
| `DB_MIGRATIONS_RUN` | `true` | Recommended | Runs pending migrations on backend startup. |
| `DB_SEED_DEMO` | `true` | Recommended for demo login | Creates the demo user and starter data if missing. Keep `false` when you do not want demo data. |
| `JWT_SECRET` | `replace_with_long_random_secret` | Yes | Use a strong random value. Never commit it. |
| `JWT_EXPIRES_IN` | `7d` | Yes | Token expiry. |
| `GEMINI_API_KEY` | empty or real key | No | Leave empty to use fallback behavior. |
| `FRONTEND_URL` | `https://your-project.vercel.app` | Yes | Single frontend URL fallback. |
| `FRONTEND_URLS` | `https://your-project.vercel.app,https://your-domain.com` | Recommended | Comma-separated allowed frontend origins for CORS. |
| `PORT` | `3001` | Depends | Many hosts inject this automatically. |

After adding a custom Vercel domain, also add it to backend `FRONTEND_URLS`.

### 3. Check Backend Health

After deploy, open:

```text
https://your-backend.vercel.app/api/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "ok",
  "hasDatabaseUrl": true
}
```

If `/api/auth/login` returns `500`, check `/api/health` first. A degraded database status normally means `DATABASE_URL` is wrong, the database is not reachable from Vercel, or migrations were not run.

## Production Checklist

- Vercel frontend has `NEXT_PUBLIC_API_URL` set to the public backend URL with `/api`.
- Backend CORS allows the Vercel URL through `FRONTEND_URLS`.
- Backend has `DB_SYNCHRONIZE=false`.
- Backend has migrations available and `DB_MIGRATIONS_RUN=true` or migrations are run manually before release.
- Backend has `DB_SEED_DEMO=true` if you want `demo@fixme.app` / `Demo@123` to work after deployment.
- PostgreSQL is reachable from the backend host.
- `JWT_SECRET` is strong and not shared with local/dev values.
- Backend health is reachable at:

```text
https://api.your-domain.com/api/health
```

- Swagger is reachable at:

```text
https://api.your-domain.com/api/docs
```

## Future AWS Deployment Path

Keep this section for the later AWS deployment.

Suggested AWS target architecture:

- Frontend: Vercel can remain the frontend host, or move to AWS Amplify/S3 + CloudFront later.
- Backend: ECS Fargate or Elastic Beanstalk running the NestJS Docker image.
- Database: Amazon RDS PostgreSQL.
- Secrets: AWS Secrets Manager or SSM Parameter Store.
- Networking: Application Load Balancer with HTTPS.
- CI/CD: GitHub Actions building and pushing Docker images to ECR, then deploying to ECS.

AWS backend environment variables will be the same as above, with:

```text
DATABASE_URL=postgresql://USER:PASSWORD@RDS_HOST:5432/fixme_db
FRONTEND_URLS=https://your-vercel-domain.vercel.app,https://your-custom-domain.com
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true
```
