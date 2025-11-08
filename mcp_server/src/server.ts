/**
 * Server instance creation
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { NexarClient } from './client.js';
import { registerNexarTools } from './tools/index.js';

export class NexarServer {
  private server: Server;
  private nexarClient: NexarClient;

  constructor(clientId: string, clientSecret: string) {
    this.nexarClient = new NexarClient(clientId, clientSecret);
    this.server = new Server(
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
  }

  getServer(): Server {
    return this.server;
  }
}

