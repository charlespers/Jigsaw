/**
 * Component Analysis MCP API Contract
 * 
 * This file defines the API contract for component analysis with the MCP server.
 * Currently using mock implementations for development.
 * 
 * To integrate with the real MCP server, replace the mock functions with actual implementations.
 */

import type { PartObject } from "./PartsList";

export interface ComponentReasoning {
  componentId: string;
  componentName: string;
  reasoning: string; // Snippet of reasoning from MCP agent
  status: "reasoning" | "selected" | "validated";
  hierarchyLevel?: number; // Position in the hierarchy
}

export interface ComponentSelection {
  componentId: string;
  componentName: string;
  partData: PartObject;
  position?: {
    x: number;
    y: number;
  };
}

export interface ComponentAnalysisResponse {
  type: "reasoning" | "selection" | "complete" | "error" | "context_request";
  componentId?: string;
  componentName?: string;
  reasoning?: string;
  partData?: ComponentSelection["partData"];
  position?: ComponentSelection["position"];
  message?: string;
  hierarchyLevel?: number;
  queryId?: string; // Required when type is "context_request" - used to resume analysis
  requestId?: string; // Alternative field name for queryId
}

export interface ComponentAnalysisConfig {
  baseUrl: string;
  analysisEndpoint: string; // Default: "/mcp/component-analysis"
  timeout?: number;
}

const defaultConfig: ComponentAnalysisConfig = {
  baseUrl: "http://localhost:3001",
  analysisEndpoint: "/mcp/component-analysis",
  timeout: 60000, // 60 seconds for long-running analysis
};

/**
 * MOCK IMPLEMENTATION - Replace with real API calls when MCP server is ready
 * 
 * TESTING FEATURES:
 * - Component-specific reasoning snippets
 * - Realistic part data with proper specs
 * - Console logging for debugging
 * - Configurable timing for testing
 */

// Mock configuration for testing
// You can modify these values to adjust the mock behavior
export const MOCK_CONFIG = {
  enableLogging: true, // Set to false to disable console logs
  reasoningDelay: 600, // Base delay between reasoning snippets (ms) - reduce for faster testing
  selectionDelay: 800, // Delay before selection (ms) - reduce for faster testing
  reasoningCount: { min: 2, max: 4 }, // Number of reasoning snippets per component
};

/**
 * TESTING UTILITIES
 * 
 * To test the mock API:
 * 1. Open browser console (F12)
 * 2. Click "Start Analysis" button in the design interface
 * 3. Watch console logs for detailed reasoning process
 * 4. Observe UI updates in real-time
 * 
 * To speed up testing:
 * - Set MOCK_CONFIG.reasoningDelay to 200-300ms
 * - Set MOCK_CONFIG.selectionDelay to 300-400ms
 * 
 * To see more reasoning:
 * - Increase MOCK_CONFIG.reasoningCount.max to 5-6
 * 
 * To disable console logs:
 * - Set MOCK_CONFIG.enableLogging to false
 */

// Mock components with hierarchy and specific reasoning
const mockComponents = [
  {
    id: "mcu",
    name: "Microcontroller",
    hierarchy: 0,
    reasoning: [
      "Analyzing project requirements: need WiFi/BT, sufficient GPIO, and low power consumption",
      "Comparing ESP32-S3 vs ESP32-C3: ESP32-S3 offers better performance and more pins",
      "Checking availability: ESP32-S3-WROOM-1 is in stock at multiple suppliers",
      "Validating compatibility: 3.3V operation matches power supply design",
    ],
    partData: {
      mpn: "ESP32-S3-WROOM-1-N8R2",
      manufacturer: "Espressif Systems",
      description: "WiFi and Bluetooth 5.0 enabled 32-bit microcontroller with dual-core processor",
      price: 2.89,
      currency: "USD",
      voltage: "3.0V ~ 3.6V",
      package: "48-QFN",
      interfaces: ["I2C", "SPI", "UART", "WiFi", "Bluetooth 5.0"],
      datasheet: "https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf",
      quantity: 1,
    },
    position: { x: 300, y: 200 },
  },
  {
    id: "power",
    name: "Power Management",
    hierarchy: 1,
    reasoning: [
      "Calculating power budget: MCU needs 3.3V @ 240mA, sensors need 3.3V @ 50mA",
      "USB-C input is 5V, need LDO regulator with 600mA capacity",
      "AP2112K-3.3 provides 600mA with low dropout voltage",
      "Checking thermal performance: AP2112K handles 600mA without overheating",
    ],
    partData: {
      mpn: "AP2112K-3.3TRG1",
      manufacturer: "Diodes Incorporated",
      description: "600mA low dropout voltage regulator with enable pin",
      price: 0.45,
      currency: "USD",
      voltage: "2.5V ~ 6.0V input, 3.3V output",
      package: "SOT-25",
      interfaces: [],
      datasheet: "https://www.diodes.com/assets/Datasheets/AP2112.pdf",
      quantity: 1,
    },
    position: { x: 200, y: 220 },
  },
  {
    id: "sensors",
    name: "Temperature Sensor",
    hierarchy: 1,
    reasoning: [
      "Project requires temperature and humidity sensing with high accuracy",
      "BME280 provides temperature, humidity, and pressure in single package",
      "I2C interface compatible with ESP32-S3, only needs 2 GPIO pins",
      "Validating accuracy: ±3% RH and ±1°C meets project requirements",
    ],
    partData: {
      mpn: "BME280",
      manufacturer: "Bosch Sensortec",
      description: "Digital humidity, pressure and temperature sensor with I2C and SPI interfaces",
      price: 3.95,
      currency: "USD",
      voltage: "1.71V ~ 3.6V",
      package: "LGA-8",
      interfaces: ["I2C", "SPI"],
      datasheet: "https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf",
      quantity: 1,
    },
    position: { x: 400, y: 220 },
  },
  {
    id: "memory",
    name: "Flash Memory",
    hierarchy: 2,
    reasoning: [
      "ESP32-S3 has 8MB flash, but project needs additional storage for data logging",
      "W25Q128 provides 16MB SPI flash with fast read/write speeds",
      "SPI interface uses 4 pins, compatible with ESP32-S3 SPI peripheral",
      "Verifying endurance: 100K write cycles sufficient for logging application",
    ],
    partData: {
      mpn: "W25Q128JVSIQ",
      manufacturer: "Winbond Electronics",
      description: "128M-bit serial flash memory with SPI interface",
      price: 1.25,
      currency: "USD",
      voltage: "2.7V ~ 3.6V",
      package: "SOIC-8",
      interfaces: ["SPI"],
      datasheet: "https://www.winbond.com/resource-files/w25q128jv%20revf%2003272018%20plus.pdf",
      quantity: 1,
    },
    position: { x: 300, y: 120 },
  },
  {
    id: "antenna",
    name: "WiFi Antenna",
    hierarchy: 2,
    reasoning: [
      "ESP32-S3 requires external antenna for optimal WiFi/BT range",
      "Ceramic chip antenna provides good performance in compact form factor",
      "ANT-2.4-CHP-T tuned for 2.4GHz ISM band with 2dBi gain",
      "Placement verified: antenna position optimized for RF performance",
    ],
    partData: {
      mpn: "ANT-2.4-CHP-T",
      manufacturer: "Antenova",
      description: "2.4GHz ceramic chip antenna with 2dBi gain for WiFi and Bluetooth applications",
      price: 0.85,
      currency: "USD",
      voltage: "N/A",
      package: "Chip",
      interfaces: [],
      datasheet: "https://www.antenova.com/datasheets/ANT-2.4-CHP-T.pdf",
      quantity: 1,
    },
    position: { x: 380, y: 150 },
  },
  {
    id: "passives",
    name: "Passives & Caps",
    hierarchy: 3,
    reasoning: [
      "Decoupling capacitors needed: 100nF for each IC power pin, 10µF bulk capacitor",
      "0603 package size provides good balance of size and capacitance",
      "X7R dielectric suitable for temperature range and voltage rating",
      "Calculating total: 8x 100nF + 2x 10µF = 10 capacitors total",
    ],
    partData: {
      mpn: "0603-X7R-100nF-50V",
      manufacturer: "Generic",
      description: "100nF X7R ceramic capacitor in 0603 package, 50V rating",
      price: 0.12,
      currency: "USD",
      voltage: "50V",
      package: "0603",
      interfaces: [],
      quantity: 10,
    },
    position: { x: 220, y: 150 },
  },
  {
    id: "connector",
    name: "USB-C Connector",
    hierarchy: 3,
    reasoning: [
      "USB-C connector needed for power input and programming interface",
      "USB4105-GF-A provides USB 2.0 data and 5V power in compact package",
      "24-pin connector with proper mechanical retention",
      "Verifying compatibility: matches ESP32-S3 USB-C design guidelines",
    ],
    partData: {
      mpn: "USB4105-GF-A",
      manufacturer: "GCT",
      description: "USB Type-C connector with 24 pins, USB 2.0 data and 5V power",
      price: 0.65,
      currency: "USD",
      voltage: "5V",
      package: "SMT",
      interfaces: ["USB 2.0"],
      datasheet: "https://gct.co/files/drawings/usb4105.pdf",
      quantity: 1,
    },
    position: { x: 250, y: 300 },
  },
];

async function mockStartAnalysis(
  query: string,
  config: ComponentAnalysisConfig,
  onUpdate: (update: ComponentAnalysisResponse) => void,
  signal?: AbortSignal,
  contextQueryId?: string,
  context?: string
): Promise<void> {
  if (MOCK_CONFIG.enableLogging) {
    console.group("🧪 Mock Component Analysis - Starting");
    console.log("Query:", query);
    if (contextQueryId && context) {
      console.log("Resuming with context:", context);
    }
    console.log("Components to analyze:", mockComponents.length);
  }
  
  // Simulate context request (for testing - can be triggered randomly or at specific points)
  // In real implementation, this would come from the MCP server
  if (!contextQueryId && Math.random() < 0.1 && MOCK_CONFIG.enableLogging) {
    // 10% chance to request context (for testing)
    // In production, this would be determined by the MCP server
    const testQueryId = `query_${Date.now()}`;
    onUpdate({
      type: "context_request",
      queryId: testQueryId,
      message: "I need more information about your power requirements. What is your target voltage range?",
    });
    return; // Pause until context is provided
  }

  // Simulate hierarchical reasoning process
  for (let i = 0; i < mockComponents.length; i++) {
    // Check if cancelled before processing each component
    if (signal?.aborted) {
      throw new Error("Analysis cancelled");
    }
    
    const component = mockComponents[i];
    
    if (MOCK_CONFIG.enableLogging) {
      console.group(`📦 ${component.name} (Level ${component.hierarchy})`);
    }

    // Send reasoning updates with component-specific snippets
    const reasoningCount =
      Math.floor(
        Math.random() *
          (MOCK_CONFIG.reasoningCount.max - MOCK_CONFIG.reasoningCount.min + 1)
      ) + MOCK_CONFIG.reasoningCount.min;

    for (let j = 0; j < reasoningCount; j++) {
      // Check if cancelled
      if (signal?.aborted) {
        throw new Error("Analysis cancelled");
      }
      
      const delay =
        MOCK_CONFIG.reasoningDelay + Math.random() * 400; // Add some variance
      await new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, delay);
        // Cancel timeout if aborted
        if (signal) {
          signal.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            resolve();
          });
        }
      });
      
      // Check again after delay
      if (signal?.aborted) {
        throw new Error("Analysis cancelled");
      }

      const reasoningSnippet =
        component.reasoning[j] ||
        component.reasoning[
          Math.floor(Math.random() * component.reasoning.length)
        ];

      if (MOCK_CONFIG.enableLogging) {
        console.log(`💭 Reasoning ${j + 1}/${reasoningCount}:`, reasoningSnippet);
      }

      onUpdate({
        type: "reasoning",
        componentId: component.id,
        componentName: component.name,
        reasoning: reasoningSnippet,
        hierarchyLevel: component.hierarchy,
      });
    }

    // Send selection
    // Check if cancelled
    if (signal?.aborted) {
      throw new Error("Analysis cancelled");
    }
    
    await new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, MOCK_CONFIG.selectionDelay);
      // Cancel timeout if aborted
      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          resolve();
        });
      }
    });
    
    // Check again after delay
    if (signal?.aborted) {
      throw new Error("Analysis cancelled");
    }

    if (MOCK_CONFIG.enableLogging) {
      console.log("✅ Selected:", component.partData.mpn);
      console.log("   Manufacturer:", component.partData.manufacturer);
      console.log("   Price:", component.partData.currency || "USD", component.partData.price.toFixed(2));
      if (component.partData.interfaces && component.partData.interfaces.length > 0) {
        console.log("   Interfaces:", component.partData.interfaces.join(", "));
      }
    }

    onUpdate({
      type: "selection",
      componentId: component.id,
      componentName: component.name,
      partData: component.partData,
      position: component.position,
      hierarchyLevel: component.hierarchy,
    });

    if (MOCK_CONFIG.enableLogging) {
      console.groupEnd();
    }
  }

  // Send completion
  // Check if cancelled
  if (signal?.aborted) {
    throw new Error("Analysis cancelled");
  }
  
  await new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, 500);
    // Cancel timeout if aborted
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        resolve();
      });
    }
  });
  
  // Check again after delay
  if (signal?.aborted) {
    throw new Error("Analysis cancelled");
  }

  if (MOCK_CONFIG.enableLogging) {
    console.log("✨ Analysis complete!");
    console.groupEnd();
  }

  onUpdate({
    type: "complete",
    message: "Component analysis complete. All components validated and optimized.",
  });
}

/**
 * REAL API IMPLEMENTATION (commented out - uncomment when MCP server is ready)
 */

/*
async function realStartAnalysis(
  query: string,
  config: ComponentAnalysisConfig,
  onUpdate: (update: ComponentAnalysisResponse) => void,
  signal?: AbortSignal
): Promise<void> {
  const controller = signal ? undefined : new AbortController();
  const abortSignal = signal || controller?.signal;
  
  const timeoutId = config.timeout
    ? setTimeout(() => controller?.abort(), config.timeout)
    : null;

  try {
    // Use Server-Sent Events or WebSocket for streaming
    const response = await fetch(`${config.baseUrl}${config.analysisEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      signal: abortSignal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // If using Server-Sent Events
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: ComponentAnalysisResponse = JSON.parse(line.slice(6));
              onUpdate(data);
              
              if (data.type === "complete" || data.type === "error") {
                return;
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
    }
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Analysis timeout or cancelled");
    }
    throw error;
  }
}
*/

/**
 * Component Analysis API Service
 */
class ComponentAnalysisService {
  private config: ComponentAnalysisConfig;
  private useMock: boolean;
  private currentAnalysis: AbortController | null = null;

  constructor(config?: Partial<ComponentAnalysisConfig>, useMock: boolean = true) {
    this.config = { ...defaultConfig, ...config };
    this.useMock = useMock;
  }

  /**
   * Start component analysis with real-time updates
   * 
   * @param query - The design query/requirements
   * @param onUpdate - Callback function for receiving updates
   * @param signal - Optional AbortSignal for cancelling
   * @param contextQueryId - Optional query ID if resuming after context was provided
   * @param context - Optional context string if resuming after context was provided
   */
  async startAnalysis(
    query: string,
    onUpdate: (update: ComponentAnalysisResponse) => void,
    signal?: AbortSignal,
    contextQueryId?: string,
    context?: string
  ): Promise<void> {
    // Cancel any existing analysis
    if (this.currentAnalysis) {
      this.currentAnalysis.abort();
    }

    const controller = signal ? undefined : new AbortController();
    this.currentAnalysis = controller || undefined;
    const abortSignal = signal || controller?.signal;

    try {
      if (this.useMock) {
        await mockStartAnalysis(query, this.config, onUpdate, abortSignal, contextQueryId, context);
      } else {
        // Uncomment when ready to use real API:
        // await realStartAnalysis(query, this.config, onUpdate, abortSignal, contextQueryId, context);
        throw new Error("Real API not yet implemented. Set useMock=true for development.");
      }
    } catch (error: any) {
      if (error.name === "AbortError" || error.message?.includes("cancelled")) {
        onUpdate({
          type: "error",
          message: "Analysis cancelled",
        });
        return;
      }
      onUpdate({
        type: "error",
        message: error.message || "Analysis failed",
      });
      throw error;
    } finally {
      if (this.currentAnalysis === controller) {
        this.currentAnalysis = null;
      }
    }
  }

  /**
   * Cancel current analysis
   */
  cancelAnalysis(): void {
    if (this.currentAnalysis) {
      this.currentAnalysis.abort();
      this.currentAnalysis = null;
    }
  }

  /**
   * Update the API configuration
   */
  updateConfig(config: Partial<ComponentAnalysisConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Switch between mock and real API
   */
  setUseMock(useMock: boolean) {
    this.useMock = useMock;
  }
}

// Export singleton instance
export const componentAnalysisApi = new ComponentAnalysisService(
  {
    baseUrl: typeof window !== "undefined" 
      ? ((import.meta as any).env?.VITE_MCP_SERVER_URL || "http://localhost:3001")
      : "http://localhost:3001",
  },
  true // Set to false when MCP server is ready
);

// Export the class for creating custom instances
export { ComponentAnalysisService };

/**
 * TESTING HELPER - Available in browser console
 * 
 * Usage in browser console:
 *   window.testComponentAnalysis("Temperature sensor with WiFi")
 * 
 * This will run a quick test of the mock API and log results to console.
 */
if (typeof window !== "undefined") {
  (window as any).testComponentAnalysis = (query: string = "Test query") => {
    console.log("🧪 Running test component analysis...");
    console.log("Query:", query);
    
    let updateCount = 0;
    const updates: ComponentAnalysisResponse[] = [];
    
    componentAnalysisApi
      .startAnalysis(
        query,
        (update) => {
          updateCount++;
          updates.push(update);
          console.log(`Update ${updateCount}:`, update);
        },
        undefined
      )
      .then(() => {
        console.log(`✅ Test complete! Received ${updateCount} updates.`);
        console.log("Summary:", {
          reasoning: updates.filter((u) => u.type === "reasoning").length,
          selections: updates.filter((u) => u.type === "selection").length,
          complete: updates.filter((u) => u.type === "complete").length,
        });
      })
      .catch((error) => {
        console.error("❌ Test failed:", error);
      });
  };
  
  console.log(
    "💡 Testing helper available! Type 'window.testComponentAnalysis(\"your query\")' in console to test."
  );
}

