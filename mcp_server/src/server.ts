/**
 * Server instance creation
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatabaseClient } from './database.js';
import { registerCelestialTools } from './tools/index.js';

export class CelestialServer {
  private server: McpServer;
  private dbClient: DatabaseClient;

  constructor(databasePath: string) {
    this.dbClient = new DatabaseClient(databasePath);
    this.server = new McpServer(
      {
        name: 'celestial-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register tools
    registerCelestialTools(this.server, this.dbClient);
    console.log('✓ Celestial MCP Server initialized with tools registered');
    console.log('✓ Database connected:', databasePath);
  }

  getServer(): McpServer {
    return this.server;
  }

  /**
   * Cleanup: close database connection
   */
  close(): void {
    this.dbClient.close();
  }
}

