/**
 * Command-line argument parsing
 */
export interface CliOptions {
  port?: number;
  stdio?: boolean;
}

export function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        if (i + 1 < args.length) {
          options.port = parseInt(args[i + 1], 10);
          i++;
        } else {
          throw new Error('--port flag requires a value');
        }
        break;
      case '--stdio':
        options.stdio = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }
  return options;
}

function printHelp(): void {
  console.log(`
Nexar MCP Server

USAGE:
    nexar-mcp [OPTIONS]

OPTIONS:
    --port <PORT>    Run HTTP server on specified port (default: 8080)
    --stdio          Use STDIO transport instead of HTTP
    --help           Print this help message

ENVIRONMENT VARIABLES:
    NEXAR_CLIENT_ID      Required: Your Nexar client ID
    NEXAR_CLIENT_SECRET   Required: Your Nexar client secret
    PORT                 HTTP server port (default: 8080)
    NODE_ENV            Set to 'production' for production mode
`);
}

