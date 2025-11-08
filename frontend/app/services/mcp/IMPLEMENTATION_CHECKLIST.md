# MCP Implementation Checklist

This checklist ensures your MCP server implementation will work correctly with the frontend.

## ✅ Pre-Implementation Verification

- [x] All MCP code is in `app/services/mcp/` folder
- [x] All types are self-contained (no external dependencies)
- [x] All API contracts are documented
- [x] Mock implementations are working

## 🔧 Implementation Steps

### 1. Environment Setup

- [ ] Create `.env` file in `frontend/` directory
- [ ] Add: `VITE_MCP_SERVER_URL=http://your-mcp-server:port`
- [ ] Verify environment variable is loaded (check browser console)

### 2. Chat API Integration

**File**: `app/services/mcp/mcpApi.ts`

- [ ] Change line ~302: `true` → `false` in `MCPApiService` constructor
- [ ] Uncomment `realQuery` function (lines ~132-170)
- [ ] Uncomment `realContinue` function (lines ~172-210)
- [ ] Test endpoint: `POST /mcp/query` returns correct format
- [ ] Test endpoint: `POST /mcp/continue` returns correct format

### 3. Component Analysis API Integration

**File**: `app/services/mcp/componentAnalysisApi.ts`

- [ ] Change line ~608: `true` → `false` in `ComponentAnalysisService` constructor
- [ ] Uncomment `realStartAnalysis` function (lines ~441-508)
- [ ] Test endpoint: `POST /mcp/component-analysis` returns SSE stream
- [ ] Verify SSE format: `data: <JSON>\n\n`

### 4. Server Requirements

Your MCP server must implement:

#### Endpoint 1: Chat Query

- **Path**: `POST /mcp/query`
- **Request**: `{ query: string }`
- **Response**: `{ type: "response" | "context_request", queryId?: string, message: string }`
- **Timeout**: 30 seconds

#### Endpoint 2: Context Continue

- **Path**: `POST /mcp/continue`
- **Request**: `{ context: string, queryId: string }`
- **Response**: Same as query endpoint
- **Timeout**: 30 seconds

#### Endpoint 3: Component Analysis (SSE)

- **Path**: `POST /mcp/component-analysis`
- **Request**: `{ query: string }`
- **Response**: Server-Sent Events stream
- **Content-Type**: `text/event-stream`
- **Format**: `data: <JSON>\n\n` for each event
- **Timeout**: 60 seconds

### 5. Response Format Verification

#### Chat Responses

**Direct Response**:

```json
{
  "type": "response",
  "message": "Your response text here"
}
```

**Context Request**:

```json
{
  "type": "context_request",
  "queryId": "unique_query_id_here",
  "message": "What additional information do you need?"
}
```

#### Component Analysis SSE Events

**Reasoning Event**:

```
data: {"type":"reasoning","componentId":"mcu","componentName":"Microcontroller","reasoning":"Analyzing requirements...","hierarchyLevel":0}

```

**Selection Event**:

```
data: {"type":"selection","componentId":"mcu","componentName":"Microcontroller","partData":{"mpn":"ESP32-S3","manufacturer":"Espressif","description":"...","price":2.89,"currency":"USD","voltage":"3.0V ~ 3.6V","package":"48-QFN","interfaces":["I2C","SPI"],"quantity":1},"hierarchyLevel":0}

```

**Complete Event**:

```
data: {"type":"complete","message":"Analysis complete"}

```

**Context Request Event**:

```
data: {"type":"context_request","queryId":"query_123","message":"Need more info about power requirements"}

```

### 6. Testing Checklist

- [ ] Start MCP server
- [ ] Set `VITE_MCP_SERVER_URL` environment variable
- [ ] Restart frontend dev server
- [ ] Test chat query in UI
- [ ] Test context request flow
- [ ] Test component analysis
- [ ] Verify components appear on PCB
- [ ] Verify parts appear in list
- [ ] Test reset/kill functionality
- [ ] Test multiple queries (appending)
- [ ] Test context resume flow

### 7. Error Handling

Your server should handle:

- [ ] CORS headers (allow frontend origin)
- [ ] AbortSignal cancellation (check `signal.aborted`)
- [ ] Timeout errors (return appropriate HTTP status)
- [ ] Invalid request format (400 Bad Request)
- [ ] Query ID not found (404 Not Found for continue endpoint)

### 8. Common Issues & Solutions

**Issue**: CORS errors

- **Solution**: Add CORS headers to server responses
- **Headers**: `Access-Control-Allow-Origin: *` (or specific origin)

**Issue**: SSE not streaming

- **Solution**: Ensure `Content-Type: text/event-stream` header
- **Solution**: Ensure each event is prefixed with `data: ` and ends with `\n\n`

**Issue**: Components not appearing

- **Solution**: Verify `partData` matches `PartObject` interface exactly
- **Solution**: Check field names (mpn, manufacturer, price, etc.)

**Issue**: Context requests not resuming

- **Solution**: Ensure `queryId` is passed correctly
- **Solution**: Server must maintain query state

## 📝 Notes

- All MCP functionality is in `app/services/mcp/` - no need to modify other folders
- Types are self-contained in `types.ts`
- Mock implementations can be kept for testing alongside real API
- Use `setUseMock(false)` to switch at runtime if needed

## 🎯 Success Criteria

Your implementation is complete when:

- ✅ Chat queries work end-to-end
- ✅ Context requests/responses work
- ✅ Component analysis streams correctly
- ✅ Components appear on PCB
- ✅ Parts appear in list
- ✅ Reset functionality works
- ✅ No console errors
