/**
 * TypeScript type definitions for Celestial MCP Server
 */

/**
 * Arguments for get_components_in_table tool
 */
export interface GetComponentsInTableArgs {
  tableName: string;
  limit?: number;
  offset?: number;
}

/**
 * Arguments for get_component_details tool
 */
export interface GetComponentDetailsArgs {
  mpn: string;
  tableName?: string;
}

