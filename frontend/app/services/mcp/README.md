# MCP Services - Implementation Guide

This folder contains **ALL** MCP (Model Context Protocol) API functionality for the Jigsaw frontend.

## Folder Structure

```
app/services/mcp/
├── index.ts                          # Central exports - use this for imports
├── mcpApi.ts                         # Chat API service
├── componentAnalysisApi.ts            # Component analysis API service
├── types.ts                          # Shared type definitions (PartObject, etc.)
├── MCP_API_CONTRACT.md               # Chat API documentation
├── COMPONENT_ANALYSIS_API_CONTRACT.md # Analysis API documentation
├── IMPLEMENTATION_CHECKLIST.md       # Step-by-step implementation guide
└── README.md                         # This file
```

**✅ This folder is completely self-contained** - All MCP functionality, types, and contracts are here.

**✅ Ready for Implementation** - All code is modular, documented, and ready to swap mock for real API.

## Quick Start - Adding Your MCP Implementation

### Step 1: Update Configuration

Both API services use environment variables for configuration:

**Environment Variable**: `VITE_MCP_SERVER_URL`

- Default: `http://localhost:3001`
- Set in `.env` file: `VITE_MCP_SERVER_URL=http://your-server:port`

### Step 2: Switch from Mock to Real API

#### For Chat API (`mcpApi.ts`):

1. Open `app/services/mcp/mcpApi.ts`
2. Find line ~298 (singleton instance):
   ```typescript
   export const mcpApi = new MCPApiService(
     { baseUrl: getMCPServerUrl() },
     true // ← Change to false
   );
   ```
3. Uncomment the `realQuery` and `realContinue` functions (lines ~132-210)
4. The service will automatically use real functions when `useMock: false`

#### For Component Analysis API (`componentAnalysisApi.ts`):

1. Open `app/services/mcp/componentAnalysisApi.ts`
2. Find line ~602 (singleton instance):
   ```typescript
   export const componentAnalysisApi = new ComponentAnalysisService(
     { baseUrl: ... },
     true // ← Change to false
   );
   ```
3. Uncomment the `realStartAnalysis` function (lines ~441-508)
4. The service will automatically use real functions when `useMock: false`

### Step 3: Verify Your Server Endpoints

Your MCP server must implement:

1. **POST `/mcp/query`** - Chat query endpoint

   - Request: `{ query: string }`
   - Response: `{ type: "response" | "context_request", queryId?: string, message: string }`

2. **POST `/mcp/continue`** - Context response endpoint

   - Request: `{ context: string, queryId: string }`
   - Response: Same format as query endpoint

3. **POST `/mcp/component-analysis`** - Component analysis endpoint (SSE stream)
   - Request: `{ query: string }`
   - Response: Server-Sent Events stream with `ComponentAnalysisResponse` objects

See the contract documentation files for detailed specifications.

## Importing MCP Services

**Always import from the index file**:

```typescript
// ✅ Correct - use centralized exports
import { mcpApi, componentAnalysisApi } from "../services/mcp";
import type { ComponentAnalysisResponse } from "../services/mcp";

// ❌ Wrong - don't import directly
import { mcpApi } from "../services/mcp/mcpApi";
```

## API Services

### 1. MCP Chat API (`mcpApi`)

**Location**: `app/services/mcp/mcpApi.ts`

**Usage**:

```typescript
import { mcpApi } from "../services/mcp";

// Send query
const response = await mcpApi.sendQuery("Your query here", abortSignal);

// Send context
const response = await mcpApi.sendContext("Context here", queryId, abortSignal);
```

**Methods**:

- `sendQuery(query: string, signal?: AbortSignal)` - Send initial query
- `sendContext(context: string, queryId: string, signal?: AbortSignal)` - Send context response
- `updateConfig(config: Partial<MCPApiConfig>)` - Update API configuration
- `setUseMock(useMock: boolean)` - Switch between mock and real API

### 2. Component Analysis API (`componentAnalysisApi`)

**Location**: `app/services/mcp/componentAnalysisApi.ts`

**Usage**:

```typescript
import { componentAnalysisApi } from "../services/mcp";

// Start analysis with streaming updates
await componentAnalysisApi.startAnalysis(
  "Your design query",
  (update) => {
    // Handle streaming updates
    console.log(update);
  },
  abortSignal,
  contextQueryId, // Optional - if resuming
  context // Optional - if resuming
);

// Cancel analysis
componentAnalysisApi.cancelAnalysis();
```

**Methods**:

- `startAnalysis(query, onUpdate, signal?, contextQueryId?, context?)` - Start analysis
- `cancelAnalysis()` - Cancel current analysis
- `updateConfig(config: Partial<ComponentAnalysisConfig>)` - Update API configuration
- `setUseMock(useMock: boolean)` - Switch between mock and real API

## Where MCP Services Are Used

1. **MCPChat.tsx** - Chat Interface

   - Uses: `mcpApi.sendQuery()`, `mcpApi.sendContext()`
   - Location: `app/design/MCPChat.tsx`

2. **ComponentGraph.tsx - Component Analysis Display**
   - Uses: `componentAnalysisApi.startAnalysis()`, `componentAnalysisApi.cancelAnalysis()`
   - Location: `app/design/ComponentGraph.tsx`

## Testing

### Mock Mode (Current)

The mock implementations are active by default. They simulate:

- Random context requests
- Realistic component analysis with reasoning
- Proper timing and delays

### Real API Testing

1. Set `useMock: false` in both services
2. Start your MCP server
3. Set `VITE_MCP_SERVER_URL` environment variable
4. Test in the UI

### Console Testing Helper

For component analysis, you can test in browser console:

```javascript
window.testComponentAnalysis("Your test query");
```

## Dependencies

**External Dependencies**: None - this folder is completely self-contained

**Internal Dependencies**: None - All types are defined in `types.ts`

## Implementation Checklist

When adding your MCP server implementation:

- [ ] Set `VITE_MCP_SERVER_URL` environment variable
- [ ] Change `useMock: false` in `mcpApi.ts` (line ~302)
- [ ] Change `useMock: false` in `componentAnalysisApi.ts` (line ~608)
- [ ] Uncomment `realQuery` and `realContinue` functions in `mcpApi.ts`
- [ ] Uncomment `realStartAnalysis` function in `componentAnalysisApi.ts`
- [ ] Verify server implements all three endpoints
- [ ] Test CORS configuration on server
- [ ] Test SSE streaming for component analysis
- [ ] Verify context request/resume flow works

## Support

For detailed API contracts, see:

- `MCP_API_CONTRACT.md` - Chat API specification
- `COMPONENT_ANALYSIS_API_CONTRACT.md` - Analysis API specification
