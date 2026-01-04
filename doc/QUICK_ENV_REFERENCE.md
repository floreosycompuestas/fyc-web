# Quick Command Reference

## Development

```bash
npm run dev
```
- Runs Next.js dev server on http://localhost:3000
- Automatically uses `.env.local`
- Hot reload enabled
- Best for local development

## Production

```bash
# Build for production
npm run build:prod

# Run the production build
npm run start:prod
```
- Uses `.env.prod`
- Optimized production build
- Listens on http://localhost:3000

## Environment Files

| File | Usage | Commit? |
|------|-------|---------|
| `.env.local` | Local development | ❌ No |
| `.env.prod` | Production | ❌ No |
| `.env.example` | Template reference | ✅ Yes |

## API URL Configuration

**Local:** Edit `.env.local`
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Production:** Edit `.env.prod`
```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## Check Active Configuration

```bash
# During dev
npm run dev

# Check console - shows which API URL is being used
```

The app will use whichever environment file corresponds to the command you ran.

