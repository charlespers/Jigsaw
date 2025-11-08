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

   - **Root Directory**: `Jigsaw/frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: Auto-detected by React Router v7
   - **Install Command**: `npm install` (auto-detected)

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

**Build fails:**

- Ensure `Root Directory` is set to `Jigsaw/frontend` in Vercel project settings
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 20 by default)

**Routing issues:**

- React Router v7 with Vercel preset handles routing automatically
- All routes should work out of the box

**Environment variables not working:**

- Ensure variables are prefixed with `VITE_` for Vite to expose them
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

## Notes

- The `@vercel/react-router` preset in `react-router.config.ts` handles serverless function configuration automatically
- SSR is enabled by default (see `react-router.config.ts`)
- The build output is automatically detected by Vercel
