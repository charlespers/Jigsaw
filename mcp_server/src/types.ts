/**
 * TypeScript type definitions for Nexar MCP Server
 */

/**
 * PartObject interface matching frontend types.ts
 */
export interface PartObject {
  mpn: string; // Manufacturer Part Number
  manufacturer: string;
  description: string;
  price: number;
  currency?: string; // Default: "USD"
  voltage?: string; // Voltage range (e.g., "3.0V ~ 3.6V")
  package?: string; // Package type (e.g., "32-QFN")
  interfaces?: string[]; // Array of interfaces (e.g., ["I2C", "SPI", "UART", "WiFi"])
  datasheet?: string; // URL to datasheet
  quantity?: number; // Default: 1
}

/**
 * Arguments for search_components tool
 */
export interface SearchComponentsArgs {
  query: string;
  limit?: number;
}

/**
 * Nexar API OAuth token response
 */
export interface NexarTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Nexar GraphQL API response structure
 */
export interface NexarPart {
  mpn: string;
  manufacturer: {
    name: string;
  };
  shortDescription: string;
  medianPrice1000?: {
    price: number;
    currency: string;
  };
  specs?: Array<{
    attribute: {
      shortname: string;
    };
    value: {
      text: string;
    };
  }>;
  bestDatasheet?: {
    url: string;
  };
}

export interface NexarSearchResult {
  part: NexarPart;
}

export interface NexarSearchResponse {
  data: {
    supSearch: {
      results: NexarSearchResult[];
    };
  };
  errors?: Array<{
    message: string;
  }>;
}

