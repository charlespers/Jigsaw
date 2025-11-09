/**
 * Celestial database tool definitions and handlers
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DatabaseClient } from '../database.js';
import {
  GetComponentsInTableArgs,
  GetComponentDetailsArgs,
} from '../types.js';

/**
 * Create and register Celestial database tools
 */
export function registerCelestialTools(server: McpServer, dbClient: DatabaseClient): void {
  console.log('Registering Celestial MCP tools...');

  // Register tools/list handler with error handling
  // MCP Protocol: tools/list should return { tools: Tool[] }
  server.server.setRequestHandler(
    z.object({
      method: z.literal('tools/list'),
    }),
    async (request) => {
      try {
        console.log('[MCP] tools/list request received');
        const tools = [
          {
            name: 'list_tables',
            description:
              'Get all available component category tables in the Celestial Altium library database. Returns an array of table names organized by component type (e.g., "Embedded - Microcontrollers", "Resistors - Surface Mount - 0201").',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'get_components_in_table',
            description:
              'Get all components in a specific category table. Returns basic component information including MPN, manufacturer, description, price, package, and datasheet URL. Use this to browse components in a category before selecting specific ones.',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description:
                    'Name of the table/category (e.g., "Embedded - Microcontrollers", "Resistors - Surface Mount - 0201")',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                  default: 100,
                },
                offset: {
                  type: 'number',
                  description: 'Offset for pagination (use with limit)',
                  default: 0,
                },
              },
              required: ['tableName'],
            },
          },
          {
            name: 'get_component_details',
            description:
              'Get full details for a specific component by Manufacturer Part Number (MPN). Returns complete component information including all available fields (core fields plus category-specific specifications like voltage, resistance, capacitance, etc.). Use this to get detailed specs before selecting a component.',
            inputSchema: {
              type: 'object',
              properties: {
                mpn: {
                  type: 'string',
                  description: 'Manufacturer Part Number (e.g., "ESP32-C3-MINI-1")',
                },
                tableName: {
                  type: 'string',
                  description:
                    'Optional: specify the table name for faster lookup. If not provided, searches all tables.',
                },
              },
              required: ['mpn'],
            },
          },
        ];
        console.log(`[MCP] tools/list returning ${tools.length} tools:`, tools.map(t => t.name).join(', '));
        return {
          tools,
        };
      } catch (error) {
        console.error('[MCP] Error in tools/list handler:', error);
        throw error;
      }
    }
  );
  console.log('Tools registered: list_tables, get_components_in_table, get_component_details');

  // Register tools/call handler
  // MCP Protocol: tools/call should return { content: Content[], isError?: boolean }
  server.server.setRequestHandler(
    z.object({
      method: z.literal('tools/call'),
      params: z.object({
        name: z.string(),
        arguments: z.any(),
      }),
    }),
    async (request) => {
      const { name, arguments: args } = request.params;
      console.log(`[MCP] tools/call request received for tool: ${name}`);

      try {
        console.log(`[MCP Tool] Executing tool: ${name} with args:`, JSON.stringify(args, null, 2));
        
        if (name === 'list_tables') {
          const tables = await dbClient.getTables();
          const result = { tables };
          console.log(`[MCP Tool] list_tables returned ${tables.length} tables`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'get_components_in_table') {
          const { tableName, limit = 100, offset = 0 } = args as GetComponentsInTableArgs;

          if (!tableName || typeof tableName !== 'string') {
            throw new Error('tableName parameter is required and must be a string');
          }

          console.log(`[MCP Tool] get_components_in_table: table=${tableName}, limit=${limit}, offset=${offset}`);
          const result = await dbClient.getComponentsInTable(tableName, limit, offset);
          console.log(`[MCP Tool] get_components_in_table returned ${result.components.length} components (total: ${result.total})`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'get_component_details') {
          const { mpn, tableName } = args as GetComponentDetailsArgs;

          if (!mpn || typeof mpn !== 'string') {
            throw new Error('mpn parameter is required and must be a string');
          }

          console.log(`[MCP Tool] get_component_details: mpn=${mpn}, tableName=${tableName || 'all'}`);
          const result = await dbClient.getComponentDetails(mpn, tableName);
          console.log(`[MCP Tool] get_component_details found component in table: ${result.tableName}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[MCP Tool] Error executing ${name}:`, errorMessage);
        // Return error in MCP format instead of throwing
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );
  
  console.log('✓ MCP tool handlers registered successfully');
}

