# Fixing 404 Errors on Vercel

## Critical: Root Directory Must Be Correct

**In Vercel Project Settings → General:**

- **Root Directory** MUST be: `Jigsaw/frontend` (NOT just `frontend`)
- This is case-sensitive and must match exactly

## Step-by-Step Fix

### 1. Verify Root Directory

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Check "Root Directory" field
3. It should say: `Jigsaw/frontend`
4. If it says `frontend` or anything else, change it to `Jigsaw/frontend`
5. Click **Save**

### 2. Verify Build Settings

In the same Settings → General page:

- **Build Command**: Leave empty (will use `yarn build` from package.json)
- **Output Directory**: Leave empty (Vercel preset auto-detects)
- **Install Command**: Leave empty (will use `yarn install`)

### 3. Clear Build Cache

1. In Settings → General
2. Scroll to "Build Cache"
3. Click "Clear Build Cache"
4. This forces a fresh build

### 4. Redeploy

1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger redeploy

### 5. Check Functions Tab

After deployment completes:

1. Go to your deployment
2. Click "Functions" tab
3. You should see serverless functions listed:
   - `/` (index route)
   - `/design` (design route)
4. If functions are missing, the preset isn't working

## If Still Getting 404s

### Check Build Logs

Look for these messages in build logs:

- ✅ "Creating serverless functions..."
- ✅ "Generated functions for routes..."
- ❌ If you don't see these, the preset isn't running

### Verify Preset is Installed

```bash
cd Jigsaw/frontend
yarn list @vercel/react-router
```

Should show version installed

### Verify Config File

Check `react-router.config.ts`:

```typescript
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  ssr: true,
  presets: [vercelPreset()], // Must have this
} satisfies Config;
```

## Alternative: Manual vercel.json (if preset fails)

If the preset isn't working, try this `vercel.json`:

```json
{
  "buildCommand": "yarn build",
  "installCommand": "yarn install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

But this should NOT be needed if the preset is working correctly.

## Common Mistakes

❌ Root Directory = `frontend` (wrong - missing `Jigsaw/`)
✅ Root Directory = `Jigsaw/frontend` (correct)

❌ Root Directory = `.` (wrong - will look in repo root)
✅ Root Directory = `Jigsaw/frontend` (correct)

❌ Having rewrites in vercel.json when using preset (can interfere)
✅ Let preset handle everything (no rewrites needed)
