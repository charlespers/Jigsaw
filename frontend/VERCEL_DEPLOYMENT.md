# Vercel Deployment Guide

This project is configured for deployment on Vercel using React Router v7 with the Vercel preset.

## Quick Deploy

1. **Push your code to GitHub**

2. **Import project on Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect React Router v7

3. **Configure build settings**

   - **Root Directory**: Leave as root (`.`)
   - The `vercel.json` at the root will handle the build configuration
   - **Build Command**: Will use `vercel.json` configuration
   - **Output Directory**: `Jigsaw/frontend/.react-router` (configured in vercel.json)
   - **Install Command**: Will use `vercel.json` configuration

   **OR** alternatively:

   - **Root Directory**: `Jigsaw/frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: Auto-detected by React Router v7
   - **Install Command**: `npm install` (auto-detected)
   - In this case, you can delete the root `vercel.json`

4. **Set environment variables**

   - Go to Project Settings → Environment Variables
   - Add: `VITE_MCP_SERVER_URL` with your backend URL
   - Example: `https://your-backend.vercel.app` or `http://your-backend:port`

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

## Environment Variables

Required environment variable:

- `VITE_MCP_SERVER_URL` - Your MCP server backend URL

Optional (if using other services):

- Add any other environment variables your app needs

## Manual Deployment via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd Jigsaw/frontend

# Deploy
vercel

# For production
vercel --prod
```

## Troubleshooting

**404 NOT_FOUND errors:**

If you're getting 404 errors, try these steps:

1. **Remove vercel.json** - The Vercel preset handles everything automatically. Having a vercel.json can interfere.

2. **Check Root Directory** - Ensure `Root Directory` is set to `Jigsaw/frontend` in Vercel project settings

3. **Verify Build Output** - The preset should create serverless functions automatically. Check the build logs to ensure routes are being generated.

4. **Clear Build Cache** - In Vercel project settings, try clearing the build cache and redeploying

**Build fails:**

- Ensure `Root Directory` is set to `Jigsaw/frontend` in Vercel project settings
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 20 by default)
- Make sure `@vercel/react-router` is installed (it should be in package.json)

**Routing issues:**

- React Router v7 with Vercel preset handles routing automatically
- All routes should work out of the box
- If you have a vercel.json, remove it and let the preset handle routing

**Environment variables not working:**

- Ensure variables are prefixed with `VITE_` for Vite to expose them
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

## Notes

- The `@vercel/react-router` preset in `react-router.config.ts` handles serverless function configuration automatically
- SSR is enabled by default (see `react-router.config.ts`)
- The build output is automatically detected by Vercel
