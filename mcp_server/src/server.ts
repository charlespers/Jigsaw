/**
 * Server instance creation
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NexarClient } from './client.js';
import { registerNexarTools } from './tools/index.js';

export class NexarServer {
  private server: McpServer;
  private nexarClient: NexarClient;

  constructor(clientId: string, clientSecret: string) {
    this.nexarClient = new NexarClient(clientId, clientSecret);
    this.server = new McpServer(
      {
        name: 'nexar-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register tools
    registerNexarTools(this.server, this.nexarClient);
    console.log('Nexar MCP Server initialized with tools registered');
  }

  getServer(): McpServer {
    return this.server;
  }
}

