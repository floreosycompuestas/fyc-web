# Environment Configuration Guide

This guide explains how to run your Next.js application with different environment configurations for local development and production.

## Environment Files

### `.env.local` (Local Development)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
Used for development with local backend.

### `.env.prod` (Production)
```
NEXT_PUBLIC_API_BASE_URL=https://api.yourproductionsite.com
```
Used for production deployments.

### `.env.example`
Template file showing all required environment variables. Commit this to git, NOT the actual env files.

## How Next.js Loads Environment Variables

By default, Next.js automatically loads environment variables from:
1. `.env.local` (local development) ← **Used by default**
2. `.env.production` (production build)
3. `.env.development` (development mode)
4. `.env` (all environments)

## Running the Application

### Local Development (Default)

**The simplest way - automatically uses `.env.local`:**
```bash
npm run dev
```

This starts the development server on `http://localhost:3000` using variables from `.env.local`.

### Production Build & Run

**Build for production:**
```bash
npm run build:prod
```

This builds the application using `.env.prod` configuration.

**Run the production build:**
```bash
npm run start:prod
```

This runs the production build using `.env.prod` configuration.

### Local Build (Optional)

If you want to build locally with `.env.local`:
```bash
npm run build:local
```

Then start with:
```bash
npm start
```

## Environment Variables Available

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` or `https://api.example.com` |

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Variables without this prefix are server-side only.

## File Structure

```
fyc-web/
├── .env.example          # Template (commit to git)
├── .env.local            # Local dev (don't commit)
├── .env.prod             # Production (don't commit)
├── next.config.mjs       # Reads NEXT_PUBLIC_API_BASE_URL
├── package.json          # npm scripts
└── app/
    └── api/
        └── auth/
            └── login/
                └── route.ts  # Uses NEXT_PUBLIC_API_BASE_URL
```

## .gitignore

Make sure your `.gitignore` includes:
```
.env.local
.env.prod
.env.*.local
```

This prevents accidentally committing sensitive environment variables.

## Changing the API URL

### For Local Development:
Edit `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
```

### For Production:
Edit `.env.prod`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

Then rebuild and restart.

## Docker Deployment

For Docker, you can pass environment variables at runtime:

```bash
docker run -e NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com fyc-web:latest
```

Or use a `.env.production.local` file in the container.

## Troubleshooting

**Variables not updating?**
- Restart the dev server (`Ctrl+C`, then `npm run dev`)
- Delete `.next/` folder and restart

**Still seeing hardcoded URL?**
- Make sure you're using the correct environment file
- Check that `process.env.NEXT_PUBLIC_API_BASE_URL` is being read in your code

## Summary

| Task | Command |
|------|---------|
| Local dev (auto uses .env.local) | `npm run dev` |
| Build for prod | `npm run build:prod` |
| Run production build | `npm run start:prod` |
| Build for local testing | `npm run build:local` |
| See env example | `cat .env.example` |

