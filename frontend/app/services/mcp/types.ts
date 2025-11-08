/**
 * Shared Types for MCP Services
 * 
 * This file contains type definitions shared across MCP services.
 * This ensures the MCP folder is self-contained and doesn't depend on design components.
 */

/**
 * Part Object Interface
 * 
 * This matches the PartObject interface from PartsList but is defined here
 * to keep MCP services independent of UI components.
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

