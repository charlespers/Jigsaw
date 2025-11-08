# MCP Server API Contract

This document defines the API contract between the frontend chat component and the MCP (Model Context Protocol) server.

## Overview

The MCP chat component communicates with the MCP server through two main endpoints:

1. **Query Endpoint** - For sending initial queries
2. **Continue Endpoint** - For sending context responses when the server requests additional information

## Base Configuration

- **Base URL**: Configurable via `VITE_MCP_SERVER_URL` environment variable (default: `http://localhost:3001`)
- **Query Endpoint**: `/mcp/query`
- **Continue Endpoint**: `/mcp/continue`
- **Request Timeout**: 30 seconds (configurable)

## API Endpoints

### 1. Query Endpoint

**Endpoint**: `POST /mcp/query`

**Request Body**:

```json
{
  "query": "string" // The user's query/question
}
```

**Response**:

```json
{
  "type": "response" | "context_request",
  "queryId": "string", // Required when type is "context_request"
  "requestId": "string", // Alternative field name for queryId (optional)
  "message": "string", // The response message or context request message
  "response": "string" // Alternative field name for message (optional)
}
```

**Response Types**:

- `"response"`: The server has a complete answer and returns it immediately
- `"context_request"`: The server needs additional context before it can respond. The `queryId` field must be included.

**Example Response (Direct Answer)**:

```json
{
  "type": "response",
  "message": "Based on your requirements, I recommend using an ESP32-S3 microcontroller..."
}
```

**Example Response (Context Request)**:

```json
{
  "type": "context_request",
  "queryId": "query_1234567890",
  "message": "I need more information about your power requirements. What is your target voltage range?"
}
```

### 2. Continue Endpoint

**Endpoint**: `POST /mcp/continue`

**Request Body**:

```json
{
  "context": "string", // The context information provided by the user
  "queryId": "string" // The query ID from the previous context_request response
}
```

**Response**:

```json
{
  "type": "response" | "context_request",
  "queryId": "string", // Required when type is "context_request"
  "requestId": "string", // Alternative field name for queryId (optional)
  "message": "string", // The response message or next context request
  "response": "string" // Alternative field name for message (optional)
}
```

**Response Types**:

- `"response"`: The server has processed the context and returns a final answer
- `"context_request"`: The server needs even more context. The same `queryId` or a new one may be provided.

**Example Request**:

```json
{
  "context": "I need 5V input with 3.3V output for the microcontroller",
  "queryId": "query_1234567890"
}
```

**Example Response (Final Answer)**:

```json
{
  "type": "response",
  "message": "Based on your 5V to 3.3V requirement, I recommend the AP2112K-3.3 LDO regulator..."
}
```

**Example Response (More Context Needed)**:

```json
{
  "type": "context_request",
  "queryId": "query_1234567890",
  "message": "What is your maximum current draw requirement?"
}
```

## Error Handling

The server should return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request format
- `404 Not Found`: Query ID not found (for continue endpoint)
- `500 Internal Server Error`: Server error

Error responses should include a JSON body with error details:

```json
{
  "error": "string", // Error message
  "code": "string" // Optional error code
}
```

## Request Cancellation

The frontend supports request cancellation via `AbortSignal`. The server should handle aborted requests gracefully and not process them if they are cancelled.

## Implementation Notes

1. **Query IDs**: When a server requests context, it must provide a `queryId` that can be used to continue the conversation. This ID should be unique and persistent for the duration of the query session.

2. **Multiple Context Requests**: The server may request context multiple times in a single query flow. Each context request should include a `queryId` that can be used to continue.

3. **Field Name Flexibility**: The API accepts both `queryId`/`requestId` and `message`/`response` as alternative field names for compatibility.

4. **Timeout**: Requests should complete within 30 seconds. Longer operations should be handled asynchronously with a different pattern.

## Frontend Integration

The frontend implementation is located in:

- `app/design/MCPChat.tsx` - Chat UI component
- `app/services/mcp/mcpApi.ts` - API service layer

To switch from mock to real API:

1. Open `app/services/mcp/mcpApi.ts`
2. Set `useMock: false` in the `MCPApiService` constructor
3. Uncomment the `realQuery` and `realContinue` functions
4. Update the base URL if needed via environment variable `VITE_MCP_SERVER_URL`

## Testing

The frontend includes a mock implementation that simulates both direct responses and context requests. This allows for UI development and testing without requiring the MCP server to be running.

To test the mock implementation:

- Send any query - it will randomly return either a direct response or a context request
- When a context request is received, provide context and it will randomly return either a final response or another context request
