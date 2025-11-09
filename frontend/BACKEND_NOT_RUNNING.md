# Backend Server Not Running

## Error: `ERR_CONNECTION_REFUSED`

This error means your **MCP backend server is not running** or not accessible at `http://localhost:3001`.

## Quick Fix

### 1. Start Your Backend Server

Navigate to your backend directory and start the server:

```bash
# Example commands (adjust based on your backend setup):
cd /path/to/your/backend
npm start
# or
yarn start
# or
python app.py
# etc.
```

### 2. Verify Backend is Running

Check if the server started successfully:

- Look for a message like "Server running on port 3001" or similar
- Check backend logs for any errors

### 3. Test Backend Directly

Open a new terminal and test if the backend is accessible:

```bash
# Test if server is responding
curl http://localhost:3001/health
# or
curl http://localhost:3001/mcp/query -X POST -H "Content-Type: application/json" -d '{"query":"test"}'
```

If you get a connection refused error here too, the backend is definitely not running.

## If Backend is on a Different Port

If your backend runs on a different port (not 3001), update the frontend configuration:

### Option 1: Environment Variable (Recommended)

Create or edit `Jigsaw/frontend/.env`:

```env
VITE_MCP_SERVER_URL=http://localhost:YOUR_PORT
```

For example, if your backend runs on port 5000:

```env
VITE_MCP_SERVER_URL=http://localhost:5000
```

**Important:** After changing `.env`, restart your frontend dev server:

```bash
# Stop the server (Ctrl+C) and restart
yarn dev
```

### Option 2: Check Backend Configuration

Check your backend code to see what port it's configured to use:

- Look for `app.listen(3001, ...)` or similar
- Check environment variables in your backend
- Check backend README or documentation

## Common Backend Start Commands

Depending on your backend framework:

**Node.js/Express:**

```bash
npm start
# or
node server.js
# or
yarn dev
```

**Python/Flask:**

```bash
python app.py
# or
flask run
```

**Python/FastAPI:**

```bash
uvicorn main:app --reload
```

**Go:**

```bash
go run main.go
```

## Still Having Issues?

1. **Check backend logs** - Look for startup errors
2. **Check if port is already in use** - Another process might be using port 3001
3. **Check firewall** - Make sure localhost connections are allowed
4. **Verify backend code** - Make sure the backend server code is correct

## Next Steps After Backend Starts

Once your backend is running:

1. The frontend should automatically connect
2. Try sending a query again
3. Check browser console for `[MCP API]` success messages

If you still get errors after the backend is running, it might be a CORS issue - see `MCP_CONNECTION_TROUBLESHOOTING.md` for CORS configuration.
