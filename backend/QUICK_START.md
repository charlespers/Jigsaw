# 🚀 Quick Start - Backend Server

## Current Status

The backend server needs to be configured and started. Here's what to do:

## Step 1: Install Dependencies

```bash
cd Jigsaw/backend
python3 -m pip install -r requirements.txt
```

## Step 2: Create `.env` File

The backend requires API credentials. Create a `.env` file:

```bash
cd Jigsaw/backend
cp .env.template .env
# Then edit .env with your actual credentials
```

**Required values:**

- `DEDALUS_API_KEY` - Your Dedalus Labs API key
- `MCP_SERVER_REGISTRY_ID` - Your MCP server registry ID

## Step 3: Start the Server

```bash
python3 app.py
```

You should see:

```
 * Running on http://0.0.0.0:3001
```

## Step 4: Test It

In another terminal:

```bash
curl http://localhost:3001/health
```

Should return: `{"status":"healthy"}`

## ✅ Once Running

The frontend will automatically connect to `http://localhost:3001` and the "Failed to fetch" error will be resolved!

## Need Help?

See `START_BACKEND.md` for detailed troubleshooting.
