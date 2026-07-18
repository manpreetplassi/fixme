# FixMe Deployment Guide

This project is a monorepo with two deployable parts:

- `frontend`: Next.js app. Deploy this to Vercel now.
- `backend`: NestJS API plus PostgreSQL. It must be reachable from the Vercel site through a public HTTPS API URL.

Vercel should only deploy the frontend for now. Keep the backend on a public API host such as AWS, Render, Railway, Fly.io, a VPS, or any service that can run the NestJS app and connect to PostgreSQL.

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
| `NEXT_PUBLIC_API_URL` | `https://api.your-domain.com/api` | Yes | Public backend API URL. Must include `/api`. |

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

## Backend Variables Required For Vercel Frontend

Wherever the backend is deployed, configure these environment variables:

| Name | Example Value | Required | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | `postgresql://USER:PASSWORD@HOST:5432/DB_NAME` | Yes | Public or private DB URL available to backend host. |
| `DB_SYNCHRONIZE` | `false` | Yes | Keep false in deployed environments. |
| `DB_MIGRATIONS_RUN` | `true` | Recommended | Runs pending migrations on backend startup. |
| `JWT_SECRET` | `replace_with_long_random_secret` | Yes | Use a strong random value. Never commit it. |
| `JWT_EXPIRES_IN` | `7d` | Yes | Token expiry. |
| `GEMINI_API_KEY` | empty or real key | No | Leave empty to use fallback behavior. |
| `FRONTEND_URL` | `https://your-project.vercel.app` | Yes | Single frontend URL fallback. |
| `FRONTEND_URLS` | `https://your-project.vercel.app,https://your-domain.com` | Recommended | Comma-separated allowed frontend origins for CORS. |
| `PORT` | `3001` | Depends | Many hosts inject this automatically. |

After adding a custom Vercel domain, also add it to backend `FRONTEND_URLS`.

## Production Checklist

- Vercel frontend has `NEXT_PUBLIC_API_URL` set to the public backend URL with `/api`.
- Backend CORS allows the Vercel URL through `FRONTEND_URLS`.
- Backend has `DB_SYNCHRONIZE=false`.
- Backend has migrations available and `DB_MIGRATIONS_RUN=true` or migrations are run manually before release.
- PostgreSQL is reachable from the backend host.
- `JWT_SECRET` is strong and not shared with local/dev values.
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
