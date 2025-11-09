/**
 * HTTP transport (streamable) for production/cloud deployment
 */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Config } from '../config.js';
import { CelestialServer } from '../server.js';

interface Session {
  transport: StreamableHTTPServerTransport;
  server: CelestialServer;
}

const sessions = new Map<string, Session>();

function createStandaloneServer(databasePath: string): CelestialServer {
  return new CelestialServer(databasePath);
}

export function startHttpTransport(config: Config): void {
  const httpServer = createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    switch (url.pathname) {
      case '/health':
        handleHealthCheck(res);
        break;
      case '/mcp':
        await handleMcpRequest(req, res, config);
        break;
      case '/sse':
        await handleSSERequest(req, res, config);
        break;
      default:
        handleNotFound(res);
    }
  });

  const host = config.isProduction ? '0.0.0.0' : 'localhost';

  httpServer.listen(config.port, host, () => {
    logServerStart(config);
  });
}

async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config
): Promise<void> {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      res.statusCode = 404;
      res.end('Session not found');
      return;
    }
    return await session.transport.handleRequest(req, res);
  }

  if (req.method === 'POST') {
    await createNewSession(req, res, config);
    return;
  }

  res.statusCode = 400;
  res.end('Invalid request');
}

async function handleSSERequest(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config
): Promise<void> {
  // SSE endpoint for backward compatibility
  // Use streamable HTTP transport instead
  const serverInstance = createStandaloneServer(config.databasePath);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  try {
    await serverInstance.getServer().connect(transport);
    console.log('SSE connection established (using streamable HTTP)');
    // Note: SSE endpoint uses streamable HTTP transport for compatibility
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('SSE connection error:', error);
    res.statusCode = 500;
    res.end('SSE connection failed');
  }
}

async function createNewSession(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config
): Promise<void> {
  const serverInstance = createStandaloneServer(config.databasePath);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      sessions.set(sessionId, { transport, server: serverInstance });
      console.log('New Celestial session created:', sessionId);
    },
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      sessions.delete(transport.sessionId);
      serverInstance.close(); // Close database connection
      console.log('Celestial session closed:', transport.sessionId);
    }
  };

  try {
    await serverInstance.getServer().connect(transport);
    console.log('MCP server connected to transport, ready to handle requests');
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Streamable HTTP connection error:', error);
    res.statusCode = 500;
    res.end('Internal server error');
  }
}

function handleHealthCheck(res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'celestial-mcp',
      version: '0.1.0',
    })
  );
}

function handleNotFound(res: ServerResponse): void {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

function logServerStart(config: Config): void {
  const displayUrl = config.isProduction ? `Port ${config.port}` : `http://localhost:${config.port}`;

  console.log(`Celestial MCP Server listening on ${displayUrl}`);

  if (!config.isProduction) {
    console.log('Put this in your client config:');
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            celestial: {
              url: `http://localhost:${config.port}/mcp`,
            },
          },
        },
        null,
        2
      )
    );
    console.log('For backward compatibility, you can also use the /sse endpoint.');
  }
}

