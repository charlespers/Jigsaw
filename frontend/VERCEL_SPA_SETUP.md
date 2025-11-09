# Vercel SPA Mode Setup

## Changes Made

1. **Disabled SSR** - Set `ssr: false` in `react-router.config.ts`
2. **Updated build output** - Set `outDir: "dist"` in `vite.config.ts`
3. **Added rewrites** - Added SPA routing rewrites in `vercel.json`

## Vercel Project Settings

**In Vercel Dashboard → Project Settings → General:**

1. **Root Directory**: `Jigsaw/frontend` (or just `frontend` if that's what you have)
2. **Build Command**: Leave empty (uses `yarn build` from package.json)
3. **Output Directory**: `dist` (this is where React Router v7 SPA mode outputs)
4. **Install Command**: Leave empty (uses `yarn install`)

## How It Works

- React Router v7 in SPA mode (`ssr: false`) builds a static site
- Output goes to `dist/` directory
- `vercel.json` rewrites all routes to `/index.html` for client-side routing
- No serverless functions needed - it's a static deployment

## After Deployment

- All routes (`/`, `/design`, etc.) will work
- No 404 errors
- Simpler deployment than SSR mode
