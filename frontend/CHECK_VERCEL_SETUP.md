# Vercel Setup Checklist

## ✅ Critical Settings in Vercel Dashboard

### 1. Root Directory (MOST IMPORTANT)

**Location:** Project Settings → General → Root Directory

**Must be exactly:** `Jigsaw/frontend`

❌ Wrong: `frontend`
❌ Wrong: `.` (root)
❌ Wrong: `Jigsaw`
✅ Correct: `Jigsaw/frontend`

### 2. Build Settings

**Location:** Project Settings → General

- **Framework Preset:** Leave as "Other" or "Vite" (auto-detected)
- **Build Command:** Leave empty (uses `yarn build` from package.json)
- **Output Directory:** Leave empty (Vercel preset auto-detects `.react-router` or `build`)
- **Install Command:** Leave empty (uses `yarn install` from package.json)
- **Node.js Version:** 20.x (default)

### 3. Environment Variables

**Location:** Project Settings → Environment Variables

Add if needed:

- `VITE_MCP_SERVER_URL` = your backend URL

## 🔍 What to Check After Deployment

### 1. Build Logs

Should see:

```
Running "yarn install"
...
Running "yarn run build"
$ react-router build
...
✓ built in X.XXs
Build Completed in /vercel/output [XXs]
```

### 2. Functions Tab

After deployment:

1. Go to your deployment
2. Click "Functions" tab
3. Should see:
   - `index` (for `/` route)
   - `design` (for `/design` route)

If functions are missing → preset isn't working

### 3. Test URLs

- `https://your-app.vercel.app/` → Should show landing page
- `https://your-app.vercel.app/design` → Should show design interface

## 🚨 If Still Getting 404s

### Option 1: Verify Root Directory

Double-check it's exactly `Jigsaw/frontend` (case-sensitive)

### Option 2: Clear Cache and Redeploy

1. Settings → General → Clear Build Cache
2. Redeploy

### Option 3: Check Build Output

In build logs, look for:

- `.react-router/` directory created
- Serverless functions generated

If you don't see these, the preset might not be running.

### Option 4: Manual vercel.json (Last Resort)

If preset still doesn't work, try this in `Jigsaw/frontend/vercel.json`:

```json
{
  "buildCommand": "yarn build",
  "installCommand": "yarn install",
  "framework": null
}
```

But the preset should handle this automatically.
