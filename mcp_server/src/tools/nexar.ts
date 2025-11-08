/**
 * Nexar tool definitions and handlers
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { NexarClient } from '../client.js';
import { SearchComponentsArgs } from '../types.js';

/**
 * Create and register Nexar tools
 */
export function registerNexarTools(server: Server, nexarClient: NexarClient): void {
  // Register tools/list handler
  server.setRequestHandler(
    z.object({
      method: z.literal('tools/list'),
    }),
    async () => {
      return {
        tools: [
          {
            name: 'search_components',
            description:
              'Search for electronic components using the Nexar Supply API. Returns a list of compatible components with specifications, pricing, and availability.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description:
                    'Search query describing the component needed (e.g., "ESP32 microcontroller with WiFi", "3.3V LDO regulator 600mA")',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    }
  );

  // Register tools/call handler
  server.setRequestHandler(
    z.object({
      method: z.literal('tools/call'),
      params: z.object({
        name: z.string(),
        arguments: z.any(),
      }),
    }),
    async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'search_components') {
        const { query, limit = 10 } = args as SearchComponentsArgs;

        if (!query || typeof query !== 'string') {
          throw new Error('query parameter is required and must be a string');
        }

        try {
          const components = await nexarClient.searchComponents(query, limit);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(components, null, 2),
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to search components: ${errorMessage}`);
        }
      }

      throw new Error(`Unknown tool: ${name}`);
    }
  );
}

