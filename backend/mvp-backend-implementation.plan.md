# MVP Backend - Bare Minimum Implementation

## Architecture

Two Python services:

1. **MCP Client** (Flask, port 3001)

   - `/mcp/query` and `/mcp/continue` endpoints (contract requirement)
   - Uses Dedalus Lab SDK to prompt LLM with MCP Server tools/resources
   - In-memory query state (queryId tracking)
   - Writes BOM to `bom.json`

2. **MCP Server** (Flask, port 3002)

   - Single tool: `search_components`
   - Calls Nexar API
   - Returns components in BOM format

## File Structure

```
backend/
├── mcp_client/
│   ├── app.py           # Flask: /mcp/query, /mcp/continue
│   ├── dedalus_service.py # DedalusRunner integration
│   └── state.py         # Query dict + BOM file write
├── mcp_server/
│   ├── server.py        # MCP protocol server (stdio or HTTP)
│   ├── nexar.py         # Nexar API client
│   └── tools.py         # search_components tool definition
├── requirements.txt
├── .env.example
└── README.md
```

## Components

**MCP Client (`app.py`)**

- `POST /mcp/query`: Get query → DedalusRunner.run(input, model, mcp_servers) → parse response → return response/context_request
- `POST /mcp/continue`: Get context + queryId → append to conversation → DedalusRunner.run() → return response/context_request
- HTTP status codes: 200, 400, 404, 500 per contract

**MCP Client (`dedalus_service.py`)**

- Initialize `AsyncDedalus` client with `DEDALUS_API_KEY`
- `DedalusRunner` wrapper
- `process_query(input, conversation_history, mcp_server_url)` → `runner.run(input, model, mcp_servers=[...])` → return `response.final_output`
- Parse response to determine if context needed (check for questions/requests)

**MCP Client (`state.py`)**

- `active_queries = {}` dict: `{queryId: {query, messages, bom_updates}}`
- `write_bom(components)` → write array to `bom.json`
- Extract components from Dedalus response and update BOM

**MCP Server (`server.py`)**

- MCP protocol server using `mcp` Python SDK or custom implementation
- Exposes `search_components` tool via MCP protocol
- Supports stdio or HTTP transport (check Dedalus SDK requirements)

**MCP Server (`tools.py`)**

- `search_components(query: str)` → Nexar API → return BOM format array
- Tool schema: name, description, inputSchema (query parameter)

**MCP Server (`nexar.py`)**

- OAuth2 authentication with Nexar API
- GraphQL query for component search
- Transform Nexar response to: `{mpn, manufacturer, description, price, currency, voltage, package, interfaces, datasheet}`

## Dependencies

- Flask
- dedalus-labs
- requests
- python-dotenv
- mcp (Python MCP SDK for server implementation)

## Environment Variables

- `DEDALUS_API_KEY`
- `NEXAR_CLIENT_ID`
- `NEXAR_CLIENT_SECRET`
- `MCP_SERVER_URL` (MCP server connection string for Dedalus SDK)
- `PORT` (default: 3001)
- `MODEL` (default: "openai/gpt-5" or similar)

## BOM Format

`backend/bom.json`:

```json
[
  {
    "mpn": "ESP32-C3-MINI-1",
    "manufacturer": "Espressif Systems",
    "description": "WiFi-enabled 32-bit microcontroller",
    "price": 2.45,
    "currency": "USD",
    "voltage": "3.0V ~ 3.6V",
    "package": "32-QFN",
    "interfaces": ["I2C", "SPI", "UART", "WiFi"],
    "datasheet": "https://..."
  }
]
```

## Component Analysis Streaming API

**Endpoint**: `POST /mcp/analysis/start`

**Request Body**:

```json
{
  "query": "string",
  "contextQueryId": "string (optional)", // For resuming after context
  "context": "string (optional)" // Context provided if resuming
}
```

**Response**: Server-Sent Events (SSE) stream with update types:

```json
{"type": "reasoning", "content": "Analyzing power requirements..."}
{"type": "selection", "component": {...BOM format...}}
{"type": "context_request", "queryId": "query_123", "message": "What voltage range?"}
{"type": "complete", "message": "Analysis complete"}
{"type": "error", "error": "Error message"}
```

**Endpoint**: `POST /mcp/analysis/continue`

**Request Body**:

```json
{
  "context": "string",
  "queryId": "string"
}
```

**Response**: Same SSE stream format as `/mcp/analysis/start`

## Notes

- Dedalus Labs SDK handles LLM prompting and MCP Server tool/resource integration
- MCP Server exposes tools/resources via MCP protocol (stdio or HTTP transport compatible with Dedalus SDK)
- In-memory state only (queryId tracking)
- MCP Client writes BOM directly when `selection` updates are received
- Basic error handling per contract (200, 400, 404, 500)
- Streaming support: ComponentGraph uses Server-Sent Events (SSE) with `text/event-stream` content type
- SSE format: Each event must be `data: <JSON>\n\n`
- Update types for streaming: `reasoning`, `selection`, `complete`, `error`, `context_request`
- Both MCPChat and ComponentGraph can request context and resume with queryId
- Component Analysis endpoint (`/mcp/component-analysis`) handles both initial queries and context resume via optional parameters
- When `selection` update received, `partData` must match `PartObject` interface exactly
- Component hierarchy: `hierarchyLevel` indicates component order (0 = core, 1 = supporting, 2 = secondary, 3 = passive)
- Request cancellation: Support `AbortSignal` for all endpoints
- Timeout: 30 seconds for chat endpoints, 60 seconds for component analysis