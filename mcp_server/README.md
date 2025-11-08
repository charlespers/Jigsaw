# Nexar MCP Server

MCP server that provides `search_components` tool for querying Nexar Supply API. Follows [Dedalus Labs MCP Server Guidelines](https://docs.dedaluslabs.ai/server-guidelines).

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set environment variables**:
```bash
export NEXAR_CLIENT_ID=your_client_id
export NEXAR_CLIENT_SECRET=your_client_secret
export PORT=8080  # Optional, default: 8080
```

3. **Build**:
```bash
npm run build
```

4. **Run server**:
```bash
# HTTP transport (production/cloud)
npm start

# STDIO transport (local development)
npm run start:stdio
```

## Development

```bash
# Watch mode with HTTP transport
npm run dev

# Watch mode with STDIO transport
npm run dev:stdio
```

## Upload to Dedalus

After testing locally, upload this repository to Dedalus cloud to get a registry ID (e.g., "username/nexar-mcp").

## Tool: search_components

- **Input**: `{query: string, limit?: number}`
- **Output**: Array of PartObject (components from Nexar API)
- **Description**: Searches Nexar Supply API for electronic components matching the query

## PartObject Format

Matches frontend `types.ts`:
- Required: `mpn`, `manufacturer`, `description`, `price`
- Optional: `currency`, `voltage`, `package`, `interfaces[]`, `datasheet`, `quantity`

## Architecture

Follows Dedalus Labs guidelines:
- `src/index.ts` - Main entry point
- `src/server.ts` - Server instance creation
- `src/client.ts` - Nexar API client
- `src/tools/nexar.ts` - Tool definitions
- `src/transport/http.ts` - Streamable HTTP transport
- `src/transport/stdio.ts` - STDIO transport (dev)
