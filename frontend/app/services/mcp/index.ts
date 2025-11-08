/**
 * MCP Services - Centralized MCP API exports
 * 
 * This folder contains all MCP-related API services and contracts.
 * 
 * Files:
 * - mcpApi.ts: Chat API service for general MCP queries
 * - componentAnalysisApi.ts: Component analysis API service
 * - MCP_API_CONTRACT.md: Chat API documentation
 * - COMPONENT_ANALYSIS_API_CONTRACT.md: Analysis API documentation
 */

export { mcpApi, MCPApiService } from "./mcpApi";
export type {
  MCPQueryRequest,
  MCPQueryResponse,
  MCPContinueRequest,
  MCPContinueResponse,
  MCPApiConfig,
} from "./mcpApi";

export {
  componentAnalysisApi,
  ComponentAnalysisService,
  MOCK_CONFIG,
} from "./componentAnalysisApi";
export type {
  ComponentReasoning,
  ComponentSelection,
  ComponentAnalysisResponse,
  ComponentAnalysisConfig,
} from "./componentAnalysisApi";

// Export shared types
export type { PartObject } from "./types";

