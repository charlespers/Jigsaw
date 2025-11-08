#!/usr/bin/env node
/**
 * Main entry point for Nexar MCP Server
 * Follows Dedalus Labs MCP Server Guidelines
 */
import { config as loadEnv } from 'dotenv';
loadEnv();

import { loadConfig } from './config.js';
import { parseArgs } from './cli.js';
import { NexarServer } from './server.js';
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
      const server = new NexarServer(config.clientId, config.clientSecret);
      await runStdioTransport(server.getServer());
    } else {
      // HTTP transport for production/cloud deployment
      const port = cliOptions.port || config.port;
      startHttpTransport({ ...config, port });
    }
  } catch (error) {
    console.error('Fatal error running Nexar server:', error);
    process.exit(1);
  }
}

main();

