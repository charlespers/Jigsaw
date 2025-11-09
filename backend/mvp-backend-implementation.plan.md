<!-- d438be45-5259-40a9-b94f-3a223858344a ad6601d9-516e-4cab-9f5e-635e65760fa5 -->
# Minimal MVP Backend Implementation

## Architecture

Two separate components:

1. **MCP Server** (separate project/repo)

   - Follows Dedalus Labs guidelines
   - Single file: `src/main.py` with MCP server + tools
   - Upload to Dedalus cloud → get registry ID

2. **MCP Client** (backend folder)

   - Single Flask file: `app.py` with all endpoints
   - Uses Dedalus SDK (~5 lines) to call LLM
   - Manages state and BOM

## File Structure

```
backend/
├── app.py              # Single Flask file: all 3 endpoints + Dedalus SDK
├── bom.json            # BOM storage (auto-created)
├── requirements.txt
└── README.md

mcp_server/           # Separate project (upload to Dedalus)
├── src/
│   └── main.py        # MCP server with search_components tool
├── requirements.txt
└── README.md
```

## MCP Server (`mcp_server/src/main.py`)

**Purpose**: Define MCP server with tools for Dedalus cloud upload

**Structure** (following Dedalus guidelines):

- Use `openmcp` package
- Define `search_components` tool
- Tool calls Nexar API internally
- Returns PartObject format array
- Uses streamable HTTP transport

**Tool Definition**:

```python
# search_components tool
# Input: {query: string}
# Output: Array of PartObject
# Calls Nexar API → transforms to PartObject format
```

**PartObject Format**:

- Required: `mpn`, `manufacturer`, `description`, `price`
- Optional: `currency`, `voltage`, `package`, `interfaces[]`, `datasheet`, `quantity`

## MCP Client (`backend/app.py`)

**Purpose**: Single Flask file providing all frontend endpoints

**Endpoints**:

1. **`POST /mcp/query`**

   - Request: `{query: string}`
   - Response: `{type: "response"|"context_request", queryId?: string, message: string}`
   - Implementation: Dedalus SDK (~5 lines) → parse response → return

2. **`POST /mcp/continue`**

   - Request: `{context: string, queryId: string}`
   - Response: Same format as query
   - Implementation: Dedalus SDK with conversation history → parse → return

3. **`POST /mcp/component-analysis`**

   - Request: `{query: string, contextQueryId?: string, context?: string}`
   - Response: SSE stream (`text/event-stream`, format: `data: <JSON>\n\n`)
   - Update types: `reasoning`, `selection`, `complete`, `error`, `context_request`
   - Implementation: Dedalus SDK streaming → parse → stream updates

**Dedalus SDK Usage** (~5 lines):

```python
client = AsyncDedalus()
runner = DedalusRunner(client)
result = await runner.run(
    input=query,
    model="openai/gpt-5",
    mcp_servers=[MCP_SERVER_REGISTRY_ID]  # e.g., "username/nexar-mcp"
)
```

**State Management**:

- In-memory dict: `{queryId: {query, messages}}`
- BOM file: Write PartObject[] to `bom.json` when components found

**Error Handling**:

- HTTP status codes: 200, 400, 404, 500
- Support AbortSignal cancellation
- Timeouts: 30s (chat), 60s (analysis)

## Dependencies

**MCP Server**:

- openmcp (Dedalus MCP framework)
- requests (Nexar API)

**MCP Client**:

- Flask
- flask-cors
- dedalus-labs
- python-dotenv

## Environment Variables

**MCP Client**:

- `DEDALUS_API_KEY` (required)
- `MCP_SERVER_REGISTRY_ID` (e.g., "username/nexar-mcp" - after upload)
- `PORT` (default: 3001)
- `MODEL` (default: "openai/gpt-5")

**MCP Server**:

- `NEXAR_CLIENT_ID` (required)
- `NEXAR_CLIENT_SECRET` (required)
- `PORT` (default: 8080)

## Frontend Contract Compliance

✅ `/mcp/query` - Exact request/response format

✅ `/mcp/continue` - Exact request/response format

✅ `/mcp/component-analysis` - SSE streaming with all update types

✅ PartObject format matches `types.ts`

✅ Context request/resume support

✅ Error handling per contract

✅ AbortSignal support

## Notes

- MCP Server is separate project (upload to Dedalus separately)
- MCP Client is minimal - single file using Dedalus SDK
- Dedalus SDK handles LLM + MCP tool calls automatically
- No complex architecture - just what's needed

### To-dos

- [ ] Create MCP Server: src/main.py with search_components tool using openmcp, Nexar API integration, streamable HTTP transport
- [ ] Create MCP Client: Single app.py Flask file with /mcp/query, /mcp/continue, /mcp/component-analysis endpoints using Dedalus SDK
- [ ] Implement in-memory query state and BOM JSON file write in app.py
- [ ] Create requirements.txt, README.md for both projects