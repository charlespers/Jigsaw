/**
 * Configuration management
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Config {
  databasePath: string;
  port: number;
  isProduction: boolean;
}

export function loadConfig(): Config {
  // Database path resolution for celestial.sqlite3:
  // Priority order:
  // 1. DATABASE_PATH environment variable (explicit override)
  // 2. Current working directory (process.cwd()/celestial.sqlite3) - most common for local/dev
  // 3. Relative to compiled dist/ directory (__dirname/../celestial.sqlite3) - for deployed environments
  // 4. Parent of dist/ (__dirname/../../celestial.sqlite3) - fallback for nested deployments
  
  const DB_FILENAME = 'celestial.sqlite3';
  let databasePath: string = '';
  
  if (process.env.DATABASE_PATH) {
    // Explicit path override via environment variable
    databasePath = process.env.DATABASE_PATH;
    console.log(`Using DATABASE_PATH from environment: ${databasePath}`);
  } else {
    // Try multiple locations in order of likelihood
    const searchPaths = [
      path.join(process.cwd(), DB_FILENAME),           // Most common: project root
      path.join(__dirname, '..', DB_FILENAME),        // Relative to dist/ (deployed)
      path.join(__dirname, '../../', DB_FILENAME),    // Parent of dist/ (nested)
      path.resolve(DB_FILENAME),                      // Absolute from current dir
    ];
    
    // Find the first existing path
    let found = false;
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        databasePath = searchPath;
        found = true;
        console.log(`Found database at: ${databasePath}`);
        break;
      }
    }
    
    if (!found) {
      // Default to current working directory, but this will fail validation below
      databasePath = path.join(process.cwd(), DB_FILENAME);
      console.error(`✗ Database file '${DB_FILENAME}' not found in any of these locations:`);
      searchPaths.forEach((p, i) => {
        console.error(`  ${i + 1}. ${p}`);
      });
    }
  }

  const port = parseInt(process.env.PORT || '8080', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Log configuration for debugging
  console.log('Celestial MCP Server Configuration:');
  console.log(`  Database path: ${databasePath}`);
  console.log(`  Port: ${port}`);
  console.log(`  Production mode: ${isProduction}`);
  
  // Verify database file exists
  if (!fs.existsSync(databasePath)) {
    console.error(`✗ ERROR: Database file not found at: ${databasePath}`);
    console.error(`  Current working directory: ${process.cwd()}`);
    console.error(`  __dirname: ${__dirname}`);
    throw new Error(`Database file not found at: ${databasePath}`);
  }
  
  console.log(`✓ Database file found at: ${databasePath}`);

  return { databasePath, port, isProduction };
}

