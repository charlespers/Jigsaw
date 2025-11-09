/**
 * STDIO transport for development
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export async function runStdioTransport(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
    console.error('Nexar MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start STDIO transport:', error);
    throw error;
  }
}

