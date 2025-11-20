# Jigsaw Backend - Demo Boilerplate

This is a boilerplate backend that returns mock data to validate frontend-backend communication.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:3001`

## Endpoints

- `POST /mcp/query` - MCP query endpoint
- `POST /mcp/continue` - MCP continue endpoint (for context)
- `POST /mcp/component-analysis` - Component analysis with SSE streaming
- `GET /health` - Health check

## Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Test Query Endpoint
```bash
curl -X POST http://localhost:3001/mcp/query \
  -H "Content-Type: application/json" \
  -d '{"query": "I need a WiFi enabled microcontroller"}'
```

### Test Component Analysis (SSE)
```bash
curl -X POST http://localhost:3001/mcp/component-analysis \
  -H "Content-Type: application/json" \
  -d '{"query": "Design a PCB with WiFi and sensors"}' \
  --no-buffer
```

## Next Steps

Once frontend-backend communication is validated, replace the mock data with actual:
- Component sourcing logic
- MCP server integration
- Real component analysis
- Database integration for storing queries/results

