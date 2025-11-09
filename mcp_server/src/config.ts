/**
 * Configuration management
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

export interface Config {
  databasePath: string;
  port: number;
  isProduction: boolean;
}

export function loadConfig(): Config {
  // Database path: default to celestial.sqlite3 in the project root
  // For Dedalus deployment, the database should be in the project root
  const databasePath = process.env.DATABASE_PATH || path.join(process.cwd(), 'celestial.sqlite3');

  const port = parseInt(process.env.PORT || '8080', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Log configuration for debugging
  console.log('Celestial MCP Server Configuration:');
  console.log(`  Database path: ${databasePath}`);
  console.log(`  Port: ${port}`);
  console.log(`  Production mode: ${isProduction}`);

  return { databasePath, port, isProduction };
}

