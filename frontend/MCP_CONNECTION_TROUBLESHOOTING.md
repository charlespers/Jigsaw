# MCP Connection Troubleshooting

## "Failed to fetch" Error

If you're getting a "Failed to fetch" error when trying to run a query, check the following:

### 1. Check Browser Console

Open your browser's developer console (F12) and look for:

- `[MCP API] Using server URL: ...` - This shows what URL is being used
- `[MCP API] Sending query to: ...` - This shows the full endpoint URL
- Any error messages with detailed information

### 2. Verify Backend Server is Running

Make sure your MCP backend server is running:

```bash
# Check if the server is running on port 3001
curl http://localhost:3001/health
# or whatever health check endpoint you have
```

### 3. Check CORS Configuration

The most common cause of "Failed to fetch" is CORS (Cross-Origin Resource Sharing) not being configured on the backend.

**Your backend needs to allow requests from your frontend origin.**

For example, if your frontend runs on `http://localhost:5173` (Vite default), your backend needs:

```javascript
// Express.js example
app.use(
  cors({
    origin: "http://localhost:5173", // or '*' for development
    credentials: true,
  })
);
```

**Or for production:**

```javascript
app.use(
  cors({
    origin: [
      "https://your-frontend-domain.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
```

### 4. Verify Environment Variable

Check if `VITE_MCP_SERVER_URL` is set correctly:

**Create/Edit `.env` file in `Jigsaw/frontend/`:**

```env
VITE_MCP_SERVER_URL=http://localhost:3001
```

**For production (Vercel):**

- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `VITE_MCP_SERVER_URL` = `https://your-backend-url.com`

**Important:** After changing `.env`, restart your dev server:

```bash
# Stop the server (Ctrl+C) and restart
yarn dev
```

### 5. Check Network Tab

In browser DevTools → Network tab:

- Look for the failed request
- Check the Request URL - is it correct?
- Check the Response - what error code/message?
- Check if the request is being blocked (CORS error will show in console)

### 6. Test Backend Directly

Test if your backend is accessible:

```bash
# Test the query endpoint
curl -X POST http://localhost:3001/mcp/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'

# Test the component analysis endpoint
curl -X POST http://localhost:3001/mcp/component-analysis \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}' \
  --no-buffer
```

### 7. Common Issues

**Issue: "Network request failed"**

- Backend server is not running
- Wrong port number
- Firewall blocking the connection

**Issue: CORS error in console**

- Backend CORS not configured
- Frontend origin not whitelisted

**Issue: 404 Not Found**

- Wrong endpoint URL
- Backend routes not set up correctly

**Issue: 500 Internal Server Error**

- Backend has a bug
- Check backend logs

### 8. Quick Debug Steps

1. **Check console logs** - Look for `[MCP API]` messages
2. **Verify URL** - Make sure it matches your backend
3. **Test backend** - Use curl or Postman to test directly
4. **Check CORS** - Most common issue
5. **Restart dev server** - After changing `.env`

### 9. Still Not Working?

If you've checked all of the above:

1. Share the exact error message from browser console
2. Share the `[MCP API]` log messages
3. Share your backend CORS configuration
4. Share the Network tab details for the failed request
