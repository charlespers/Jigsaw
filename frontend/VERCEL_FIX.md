# Fixing Vercel 404 Errors

## The Problem

If you're seeing "Build Completed in /vercel/output [82ms]" and 404 errors, Vercel isn't finding your build output.

## Solution: Set Root Directory in Vercel

**The easiest fix is to configure Vercel to use the frontend directory as the root:**

1. Go to your Vercel project settings
2. Navigate to **Settings → General**
3. Find **Root Directory**
4. Set it to: `Jigsaw/frontend`
5. Click **Save**
6. The `vercel.json` in this directory (or no vercel.json at all) will work - the Vercel preset handles everything
7. Redeploy

## Why This Works

React Router v7 with the `@vercel/react-router` preset automatically:

- Detects the build output
- Creates serverless functions for each route
- Handles routing correctly

When you set the Root Directory to `Jigsaw/frontend`, Vercel will:

- Run `npm install` in that directory
- Run `npm run build` in that directory
- Auto-detect the output from the Vercel preset

## Alternative: Keep Root Directory as `.`

If you want to keep the root directory as `.` (root of repo), you need to ensure the `vercel.json` correctly points to the build output. However, the Vercel preset might not work correctly with this setup.

**Recommended: Use Root Directory = `Jigsaw/frontend`**
