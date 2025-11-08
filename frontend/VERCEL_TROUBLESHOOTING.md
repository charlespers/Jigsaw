# Vercel Deployment Troubleshooting

## Issue: Build completes in 84ms (not actually building)

If you see "Build Completed in /vercel/output [84ms]", Vercel isn't running your build command.

## Solution Steps

### 1. Verify Root Directory in Vercel

**Critical:** In Vercel project settings:

- Go to **Settings → General**
- **Root Directory** MUST be set to: `Jigsaw/frontend`
- Click **Save**

### 2. Verify Build Settings

In Vercel project settings → **Settings → General**:

- **Build Command**: Should be `npm run build` (or leave empty to use vercel.json)
- **Output Directory**: Leave empty (Vercel preset auto-detects)
- **Install Command**: Should be `npm install` (or leave empty to use vercel.json)

### 3. Check Build Logs

After setting Root Directory, check the build logs. You should see:

```
Running "npm install"
...
Running "npm run build"
> react-router build
...
```

If you don't see these commands running, the Root Directory is wrong.

### 4. Clear Build Cache

In Vercel:

- Go to **Settings → General**
- Scroll to **Build Cache**
- Click **Clear Build Cache**
- Redeploy

### 5. Verify vercel.json Location

The `vercel.json` file MUST be in `Jigsaw/frontend/` (same directory as package.json).

### 6. Check Package Manager

If you're using `yarn` or `pnpm`, update vercel.json:

```json
{
  "buildCommand": "yarn build",
  "installCommand": "yarn install",
  "framework": null
}
```

Or for pnpm:

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": null
}
```

## Expected Build Output

With React Router v7 and Vercel preset, the build should create:

- `.react-router/` directory with serverless functions
- Or `build/` directory (depending on preset version)

The build should take at least 30-60 seconds, not 84ms.

## Still Not Working?

1. **Check Vercel build logs** - Look for error messages
2. **Verify Node.js version** - Should be 18+ (Vercel defaults to 20)
3. **Check package.json** - Ensure `react-router build` script exists
4. **Verify dependencies** - Make sure `@vercel/react-router` is installed

## Quick Test

To test locally (simulating Vercel):

```bash
cd Jigsaw/frontend
npm install
npm run build
```

If this works locally but not on Vercel, it's a configuration issue (likely Root Directory).
