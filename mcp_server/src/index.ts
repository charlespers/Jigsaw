#!/usr/bin/env node
/**
 * Main entry point for Celestial MCP Server
 * Follows Dedalus Labs MCP Server Guidelines
 */
import { config as loadEnv } from 'dotenv';
loadEnv();

import { loadConfig } from './config.js';
import { parseArgs } from './cli.js';
import { CelestialServer } from './server.js';
import { runStdioTransport, startHttpTransport } from './transport/index.js';

/**
 * Transport selection logic:
 * 1. --stdio flag forces STDIO transport
 * 2. Default: HTTP transport for production compatibility
 */
async function main() {
  try {
    const config = loadConfig();
    const cliOptions = parseArgs();

    if (cliOptions.stdio) {
      // STDIO transport for local development
      const server = new CelestialServer(config.databasePath);
      
      // Handle cleanup on exit
      process.on('SIGINT', () => {
        server.close();
        process.exit(0);
      });
      process.on('SIGTERM', () => {
        server.close();
        process.exit(0);
      });

      await runStdioTransport(server.getServer());
    } else {
      // HTTP transport for production/cloud deployment
      // Dedalus expects the server to start and listen on the port
      const port = cliOptions.port || config.port;
      console.log(`Starting Celestial MCP Server on port ${port}...`);
      startHttpTransport({ ...config, port });
      // Keep process alive
      process.on('SIGINT', () => {
        console.log('Received SIGINT, shutting down gracefully...');
        process.exit(0);
      });
      process.on('SIGTERM', () => {
        console.log('Received SIGTERM, shutting down gracefully...');
        process.exit(0);
      });
    }
  } catch (error) {
    console.error('Fatal error running Celestial server:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

main();

