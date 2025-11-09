# Dedalus API Key Debugging Guide

## Current Setup

- **SDK Language**: Python
- **SDK Version**: dedalus-labs v0.0.1
- **Client Type**: `Dedalus` (synchronous, for Flask)
- **Initialization**: `Dedalus(api_key=DEDALUS_API_KEY)`

## API Key Configuration

The API key is loaded from `.env` file in `Jigsaw/backend/.env`:
```
DEDALUS_API_KEY=dsk_live_c625866184d6_e585afad322f6e5b83a02decd6030835
```

## Error Analysis

The error message shows:
```
Invalid API key: Key inactive: cd1eca8fb5d5
```

This partial key (`cd1eca8fb5d5`) does NOT match the key in the `.env` file. This suggests:

1. **Old cached key**: A previous backend process might be using an old key
2. **Environment variable conflict**: System environment variable might override .env file
3. **SDK reading wrong source**: SDK might be reading from a different location

## Verification Steps

1. **Check API key in .env file**:
   ```bash
   cd Jigsaw/backend
   cat .env | grep DEDALUS_API_KEY
   ```

2. **Verify key is loaded correctly**:
   ```bash
   python3 -c "from dotenv import load_dotenv; import os; load_dotenv('.env', override=True); key = os.getenv('DEDALUS_API_KEY', '').strip(); print(f'Key: {key[:20]}...{key[-10:]} (length: {len(key)})')"
   ```

3. **Check for system environment variables**:
   ```bash
   env | grep DEDALUS
   ```

4. **Verify backend is using correct key**:
   - Check backend startup logs for: `✓ Using API key: dsk_live_c62586...`
   - Should show the correct key, not `cd1eca8fb5d5`

## Solutions

### Solution 1: Ensure API Key is Active in Dedalus Dashboard
1. Log into Dedalus Labs dashboard
2. Navigate to API Keys section
3. Verify the key `dsk_live_c625866184d6_...` is:
   - ✅ Active (not disabled/inactive)
   - ✅ Not expired
   - ✅ Has correct permissions

### Solution 2: Regenerate API Key (if needed)
1. In Dedalus dashboard, generate a new API key
2. Update `.env` file with new key
3. Restart backend server

### Solution 3: Clear Cached Processes
```bash
# Kill all backend processes
ps aux | grep "python.*app.py" | grep -v grep | awk '{print $2}' | xargs kill

# Restart backend
cd Jigsaw/backend
python3 app.py
```

### Solution 4: Verify SDK Usage Pattern
The code uses:
```python
from dedalus_labs import Dedalus, DedalusRunner

# Set environment variable
os.environ['DEDALUS_API_KEY'] = DEDALUS_API_KEY

# Initialize client
dedalus_client = Dedalus(api_key=DEDALUS_API_KEY)
dedalus_runner = DedalusRunner(dedalus_client)

# Use runner
result = dedalus_runner.run(
    input=prompt,
    model="openai/gpt-5",
    mcp_servers=[MCP_SERVER_REGISTRY_ID],
    stream=True  # or stream=False
)
```

## Next Steps

1. **Check Dedalus Dashboard**: Verify API key status
2. **Check Backend Logs**: Look for the actual key being used
3. **Restart Backend**: Ensure fresh process with correct key
4. **Contact Dedalus Support**: If key is active but still rejected, share:
   - SDK version: `dedalus-labs v0.0.1`
   - Client type: `Dedalus` (synchronous)
   - Error message: `Invalid API key: Key inactive: cd1eca8fb5d5`
   - Expected key prefix: `dsk_live_c625866184d6_...`

