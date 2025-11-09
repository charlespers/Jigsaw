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

  // Register tools/list handler
  server.server.setRequestHandler(
    z.object({
      method: z.literal('tools/list'),
    }),
    async () => {
      return {
        tools: [
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
        ],
      };
    }
  );
  console.log('Tools registered: list_tables, get_components_in_table, get_component_details');

  // Register tools/call handler
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

      try {
        if (name === 'list_tables') {
          const tables = await dbClient.getTables();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ tables }, null, 2),
              },
            ],
          };
        }

        if (name === 'get_components_in_table') {
          const { tableName, limit = 100, offset = 0 } = args as GetComponentsInTableArgs;

          if (!tableName || typeof tableName !== 'string') {
            throw new Error('tableName parameter is required and must be a string');
          }

          const result = await dbClient.getComponentsInTable(tableName, limit, offset);
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

          const result = await dbClient.getComponentDetails(mpn, tableName);
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
        throw new Error(`Tool execution failed: ${errorMessage}`);
      }
    }
  );
}

