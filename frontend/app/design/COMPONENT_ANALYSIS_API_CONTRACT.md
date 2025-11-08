# Component Analysis MCP API Contract

This document defines the API contract for component analysis with the MCP server. The analysis process involves hierarchical reasoning about parts selection with real-time updates.

## Overview

The component analysis endpoint provides a streaming interface where the MCP server reasons about component selection in a hierarchical manner, sending reasoning snippets and final selections as they are determined.

## Base Configuration

- **Base URL**: Configurable via `VITE_MCP_SERVER_URL` environment variable (default: `http://localhost:3001`)
- **Analysis Endpoint**: `/mcp/component-analysis`
- **Request Timeout**: 60 seconds (configurable)
- **Protocol**: Server-Sent Events (SSE) or WebSocket for streaming

## API Endpoint

### Component Analysis Endpoint

**Endpoint**: `POST /mcp/component-analysis`

**Request Body**:

```json
{
  "query": "string" // The design requirements/query
}
```

**Response Format**: Server-Sent Events (SSE) stream

Each event in the stream is a JSON object with the following structure:

```json
{
  "type": "reasoning" | "selection" | "complete" | "error",
  "componentId": "string", // Required for reasoning and selection types
  "componentName": "string", // Required for reasoning and selection types
  "reasoning": "string", // Required for reasoning type - snippet of agent reasoning
  "partData": { // Required for selection type
    "item_name": "string",
    "price": "number",
    "pins": "number (optional)",
    "communication_prot": "string (optional)",
    "voltage_in": "number (optional)",
    "current": "number (optional)",
    "model": "string (optional)",
    "quantity": "number (optional, default: 1)"
  },
  "position": { // Optional for selection type - PCB placement coordinates
    "x": "number",
    "y": "number"
  },
  "hierarchyLevel": "number (optional)", // Position in component hierarchy
  "message": "string (optional)" // For complete/error types
}
```

## Response Types

### 1. Reasoning Update

Sent when an MCP agent is reasoning about a component. Multiple reasoning updates may be sent for the same component.

```json
{
  "type": "reasoning",
  "componentId": "mcu",
  "componentName": "Microcontroller",
  "reasoning": "Analyzing power requirements for microcontroller selection. Need WiFi/BT support and sufficient GPIO pins.",
  "hierarchyLevel": 0
}
```

**Fields**:

- `type`: Must be `"reasoning"`
- `componentId`: Unique identifier for the component
- `componentName`: Human-readable component name
- `reasoning`: Snippet of reasoning text from the MCP agent
- `hierarchyLevel`: Optional, indicates position in the component hierarchy (0 = top level)

### 2. Component Selection

Sent when a component has been selected and validated.

```json
{
  "type": "selection",
  "componentId": "mcu",
  "componentName": "Microcontroller",
  "partData": {
    "item_name": "ESP32-S3-WROOM-1",
    "price": 2.89,
    "pins": 48,
    "communication_prot": "I2C, SPI, UART",
    "voltage_in": 3.3,
    "current": 500,
    "model": "ESP32-S3-WROOM-1-N8R2",
    "quantity": 1
  },
  "position": {
    "x": 300,
    "y": 200
  },
  "hierarchyLevel": 0
}
```

**Fields**:

- `type`: Must be `"selection"`
- `componentId`: Unique identifier for the component
- `componentName`: Human-readable component name
- `partData`: Complete part information matching the `PartObject` interface
- `position`: Optional, suggested PCB placement coordinates
- `hierarchyLevel`: Optional, indicates position in the component hierarchy

### 3. Analysis Complete

Sent when all component analysis is finished.

```json
{
  "type": "complete",
  "message": "Component analysis complete. All components validated and optimized."
}
```

### 4. Error

Sent when an error occurs during analysis.

```json
{
  "type": "error",
  "message": "Failed to find compatible components for power requirements"
}
```

## Component Hierarchy

The MCP server handles component selection in a hierarchical manner. Components are typically analyzed in this order:

1. **Level 0**: Core components (e.g., Microcontroller)
2. **Level 1**: Supporting components (e.g., Power Management, Sensors)
3. **Level 2**: Secondary components (e.g., Memory, Antennas)
4. **Level 3**: Passive components (e.g., Capacitors, Connectors)

The `hierarchyLevel` field indicates where each component sits in this hierarchy. The frontend uses this to organize the display, but the MCP server is responsible for determining the order.

## Request Cancellation

The frontend supports request cancellation via `AbortSignal`. The server should handle aborted requests gracefully and stop processing when cancelled.

## Implementation Notes

1. **Streaming**: The endpoint should use Server-Sent Events (SSE) or WebSocket for real-time updates. Each line should be prefixed with `data: ` for SSE.

2. **Reasoning Snippets**: Multiple reasoning updates may be sent for the same component as the agent thinks through the selection process.

3. **Component IDs**: Use consistent, lowercase IDs (e.g., "mcu", "power", "sensors") for easy identification.

4. **Position Coordinates**: If provided, coordinates are relative to the PCB canvas (typically 600x400px viewport).

5. **Part Data**: The `partData` object must match the `PartObject` interface used by the PartsList component.

## Frontend Integration

The frontend implementation is located in:

- `app/design/ComponentGraph.tsx` - Component analysis UI
- `app/design/componentAnalysisApi.ts` - API service layer
- `app/design/PCBViewer.tsx` - PCB visualization
- `app/design/PartsList.tsx` - Parts display

To switch from mock to real API:

1. Open `app/design/componentAnalysisApi.ts`
2. Set `useMock: false` in the `ComponentAnalysisService` constructor
3. Uncomment the `realStartAnalysis` function
4. Update the base URL if needed via environment variable `VITE_MCP_SERVER_URL`

## Testing

The frontend includes a mock implementation that simulates:

- Hierarchical component reasoning
- Multiple reasoning snippets per component
- Component selection with part data
- Analysis completion

To test the mock implementation:

- Click "Start Analysis" in the header
- Watch as components appear with reasoning snippets
- See components turn green when selected
- Observe components appear on the PCB viewer
- Check parts list updates automatically
