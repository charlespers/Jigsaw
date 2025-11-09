# MCP Client Backend

Flask backend that uses Dedalus SDK to interact with LLM and MCP server for electronic component search and circuit board design assistance.

## Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set environment variables**:
Create a `.env` file in the `backend/` directory:
```bash
DEDALUS_API_KEY=your_dedalus_api_key
MCP_SERVER_REGISTRY_ID=username/nexar-mcp
PORT=3001
MODEL=openai/gpt-5
```

3. **Run server**:
```bash
python app.py
```

The server will start on `http://localhost:3001` (or the port specified in `PORT`).

## API Endpoints

### 1. `POST /mcp/query`

Send initial chat query.

**Request**:
```json
{
  "query": "I need to design a WiFi-enabled temperature sensor board"
}
```

**Response**:
```json
{
  "type": "response",
  "message": "Based on your requirements, I recommend..."
}
```

Or if context is needed:
```json
{
  "type": "context_request",
  "queryId": "query_abc123",
  "message": "I need more information about your power requirements..."
}
```

### 2. `POST /mcp/continue`

Provide context to continue conversation.

**Request**:
```json
{
  "context": "I need 5V input with 3.3V output",
  "queryId": "query_abc123"
}
```

**Response**: Same format as `/mcp/query`

### 3. `POST /mcp/component-analysis`

Streaming component analysis with Server-Sent Events (SSE).

**Request**:
```json
{
  "query": "Design a WiFi temperature sensor board",
  "contextQueryId": "optional_query_id",
  "context": "optional_context_string"
}
```

**Response**: SSE stream with events:
- `reasoning`: Agent reasoning about components
- `selection`: Component selected with PartObject data
- `complete`: Analysis finished
- `error`: Error occurred
- `context_request`: Needs more context

**SSE Format**: `data: <JSON>\n\n`

### 4. `GET /health`

Health check endpoint.

## State Management

- **Query State**: In-memory dictionary storing conversation history per query ID
- **BOM File**: `bom.json` automatically created and updated when components are selected

## BOM Format

The `bom.json` file stores an array of PartObject entries:

```json
[
  {
    "mpn": "ESP32-S3-WROOM-1",
    "manufacturer": "Espressif Systems",
    "description": "WiFi-enabled microcontroller",
    "price": 2.89,
    "currency": "USD",
    "voltage": "3.0V ~ 3.6V",
    "package": "48-QFN",
    "interfaces": ["I2C", "SPI", "UART", "WiFi"],
    "datasheet": "https://...",
    "quantity": 1
  }
]
```

## Environment Variables

- `DEDALUS_API_KEY` (required): Your Dedalus Labs API key
- `MCP_SERVER_REGISTRY_ID` (required): Registry ID of your MCP server on Dedalus cloud (e.g., "username/nexar-mcp")
- `PORT` (optional): Server port (default: 3001)
- `MODEL` (optional): LLM model to use (default: "openai/gpt-5")

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid request format
- `404 Not Found`: Query ID not found (for continue endpoint)
- `500 Internal Server Error`: Server error

Error responses include JSON body with `error` and optional `code` fields.

## Frontend Integration

This backend is designed to work with the frontend located in `/frontend/app/design/`. The frontend expects:

- Base URL: `http://localhost:3001` (configurable via `VITE_MCP_SERVER_URL`)
- CORS enabled for frontend origin
- SSE streaming for component analysis
- Exact response formats per frontend API contracts

## Notes

- The MCP server must be deployed to Dedalus cloud first to get a registry ID
- The Dedalus SDK handles all LLM interactions and MCP tool calls automatically
- Component analysis uses streaming to provide real-time updates to the frontend
- BOM file is automatically created and updated when components are selected

