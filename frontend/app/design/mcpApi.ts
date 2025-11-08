/**
 * MCP Server API Contract
 * 
 * This file defines the API contract between the frontend and the MCP server.
 * Currently using mock implementations for development.
 * 
 * To integrate with the real MCP server, replace the mock functions with actual fetch calls.
 */

export interface MCPQueryRequest {
  query: string;
}

export interface MCPQueryResponse {
  type: "response" | "context_request";
  queryId?: string; // Required when type is "context_request"
  requestId?: string; // Alternative field name for queryId
  message: string;
  response?: string; // Alternative field name for message
}

export interface MCPContinueRequest {
  context: string;
  queryId: string;
}

export interface MCPContinueResponse {
  type: "response" | "context_request";
  queryId?: string;
  requestId?: string;
  message: string;
  response?: string;
}

/**
 * MCP Server API Configuration
 */
export interface MCPApiConfig {
  baseUrl: string;
  queryEndpoint: string; // Default: "/mcp/query"
  continueEndpoint: string; // Default: "/mcp/continue"
  timeout?: number; // Request timeout in milliseconds
}

/**
 * Default API configuration
 */
const defaultConfig: MCPApiConfig = {
  baseUrl: "http://localhost:3001",
  queryEndpoint: "/mcp/query",
  continueEndpoint: "/mcp/continue",
  timeout: 30000, // 30 seconds
};

/**
 * MOCK IMPLEMENTATION - Replace with real API calls when MCP server is ready
 * 
 * This simulates the MCP server behavior for development/testing.
 * The mock randomly returns either a direct response or a context request
 * to test both flows.
 */

// Mock state to simulate query IDs
let mockQueryIdCounter = 0;
const mockActiveQueries = new Map<string, { query: string; timestamp: number }>();

async function mockQuery(
  request: MCPQueryRequest,
  config: MCPApiConfig
): Promise<MCPQueryResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  const queryId = `query_${++mockQueryIdCounter}_${Date.now()}`;
  mockActiveQueries.set(queryId, { query: request.query, timestamp: Date.now() });

  // Randomly return either a context request or a direct response
  // This allows testing both flows
  const shouldRequestContext = Math.random() > 0.5;

  if (shouldRequestContext) {
    return {
      type: "context_request",
      queryId,
      message: `I need more information to process your query: "${request.query}". Please provide additional context about your requirements.`,
    };
  } else {
    mockActiveQueries.delete(queryId);
    return {
      type: "response",
      message: `Mock response to: "${request.query}". This is a simulated response. The actual MCP server will provide real responses.`,
    };
  }
}

async function mockContinue(
  request: MCPContinueRequest,
  config: MCPApiConfig
): Promise<MCPContinueResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  const queryData = mockActiveQueries.get(request.queryId);
  if (!queryData) {
    throw new Error("Query ID not found. It may have expired.");
  }

  // Randomly return either another context request or a final response
  const shouldRequestMoreContext = Math.random() > 0.7;

  if (shouldRequestMoreContext) {
    return {
      type: "context_request",
      queryId: request.queryId,
      message: `Thank you for the context. I need one more piece of information: What is your preferred budget range?`,
    };
  } else {
    mockActiveQueries.delete(request.queryId);
    return {
      type: "response",
      message: `Thank you for providing the context. Based on your query "${queryData.query}" and the context you provided, here is the final response.`,
    };
  }
}

/**
 * REAL API IMPLEMENTATION (commented out - uncomment when MCP server is ready)
 * 
 * Replace the mock functions above with these implementations:
 */

/*
async function realQuery(
  request: MCPQueryRequest,
  config: MCPApiConfig,
  signal?: AbortSignal
): Promise<MCPQueryResponse> {
  const controller = signal ? undefined : new AbortController();
  const abortSignal = signal || controller?.signal;
  
  const timeoutId = config.timeout
    ? setTimeout(() => controller?.abort(), config.timeout)
    : null;

  try {
    const response = await fetch(`${config.baseUrl}${config.queryEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: abortSignal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MCPQueryResponse = await response.json();
    return data;
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout or cancelled");
    }
    throw error;
  }
}

async function realContinue(
  request: MCPContinueRequest,
  config: MCPApiConfig,
  signal?: AbortSignal
): Promise<MCPContinueResponse> {
  const controller = signal ? undefined : new AbortController();
  const abortSignal = signal || controller?.signal;
  
  const timeoutId = config.timeout
    ? setTimeout(() => controller?.abort(), config.timeout)
    : null;

  try {
    const response = await fetch(`${config.baseUrl}${config.continueEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: abortSignal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MCPContinueResponse = await response.json();
    return data;
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout or cancelled");
    }
    throw error;
  }
}
*/

/**
 * API Service Class
 * 
 * This class provides a clean interface for MCP server communication.
 * Switch between mock and real implementations by changing the USE_MOCK flag.
 */
class MCPApiService {
  private config: MCPApiConfig;
  private useMock: boolean;

  constructor(config?: Partial<MCPApiConfig>, useMock: boolean = true) {
    this.config = { ...defaultConfig, ...config };
    this.useMock = useMock;
  }

  /**
   * Send a query to the MCP server
   * 
   * @param query - The user's query string
   * @param signal - Optional AbortSignal for cancelling the request
   * @returns Promise resolving to the MCP server response
   */
  async sendQuery(query: string, signal?: AbortSignal): Promise<MCPQueryResponse> {
    const request: MCPQueryRequest = { query };

    if (this.useMock) {
      return mockQuery(request, this.config);
    } else {
      // Uncomment when ready to use real API:
      // return realQuery(request, this.config, signal);
      throw new Error("Real API not yet implemented. Set useMock=true for development.");
    }
  }

  /**
   * Send context response to continue a query that requested context
   * 
   * @param context - The context information provided by the user
   * @param queryId - The query ID from the context request
   * @param signal - Optional AbortSignal for cancelling the request
   * @returns Promise resolving to the MCP server response
   */
  async sendContext(
    context: string,
    queryId: string,
    signal?: AbortSignal
  ): Promise<MCPContinueResponse> {
    const request: MCPContinueRequest = { context, queryId };

    if (this.useMock) {
      return mockContinue(request, this.config);
    } else {
      // Uncomment when ready to use real API:
      // return realContinue(request, this.config, signal);
      throw new Error("Real API not yet implemented. Set useMock=true for development.");
    }
  }

  /**
   * Update the API configuration
   */
  updateConfig(config: Partial<MCPApiConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Switch between mock and real API
   */
  setUseMock(useMock: boolean) {
    this.useMock = useMock;
  }
}

// Helper to get MCP server URL from environment
function getMCPServerUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }
  try {
    return import.meta.env?.VITE_MCP_SERVER_URL || "http://localhost:3001";
  } catch {
    return "http://localhost:3001";
  }
}

// Export singleton instance (can also create new instances)
export const mcpApi = new MCPApiService(
  {
    baseUrl: getMCPServerUrl(),
  },
  true // Set to false when MCP server is ready
);

// Export the class for creating custom instances
export { MCPApiService };

