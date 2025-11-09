# Starting the Backend Server

## Quick Start

The backend requires environment variables to run. Follow these steps:

### 1. Create `.env` file

Copy the example file:

```bash
cd Jigsaw/backend
cp .env.example .env
```

### 2. Edit `.env` with your credentials

Open `.env` and fill in:

- `DEDALUS_API_KEY` - Your Dedalus Labs API key
- `MCP_SERVER_REGISTRY_ID` - Your MCP server registry ID (e.g., "username/nexar-mcp")

### 3. Install dependencies (if not already installed)

```bash
pip install -r requirements.txt
```

### 4. Start the server

```bash
python3 app.py
```

Or if you want to run it in the background:

```bash
python3 app.py > backend.log 2>&1 &
```

### 5. Verify it's running

```bash
curl http://localhost:3001/health
```

Should return: `{"status":"healthy"}`

## Troubleshooting

### Error: "DEDALUS_API_KEY environment variable is required"

- Make sure `.env` file exists in `Jigsaw/backend/`
- Make sure it contains `DEDALUS_API_KEY=your_key`

### Error: "MCP_SERVER_REGISTRY_ID environment variable is required"

- Make sure `.env` file contains `MCP_SERVER_REGISTRY_ID=your_registry_id`

### Error: "Module not found"

- Run: `pip install -r requirements.txt`

### Port already in use

- Change `PORT` in `.env` to a different port (e.g., `3002`)
- Update frontend `.env` to match: `VITE_MCP_SERVER_URL=http://localhost:3002`

## Running in Background

To run the backend in the background and keep it running:

**Using nohup:**

```bash
nohup python3 app.py > backend.log 2>&1 &
```

**Using screen:**

```bash
screen -S backend
python3 app.py
# Press Ctrl+A then D to detach
```

**Using tmux:**

```bash
tmux new -s backend
python3 app.py
# Press Ctrl+B then D to detach
```

## Stopping the Server

**If running in foreground:**

- Press `Ctrl+C`

**If running in background:**

```bash
# Find the process
ps aux | grep "python.*app.py"

# Kill it
kill <PID>
```

Or if you know the port:

```bash
lsof -ti:3001 | xargs kill
```
