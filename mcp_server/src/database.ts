/**
 * SQLite Database Client for Celestial Altium Library
 * Handles queries to the SQLite database with 132 component tables
 * Returns raw database rows - transformation to PartObject happens in backend
 */
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

export class DatabaseClient {
  private db: DatabaseType;
  private tableNames: string[] | null = null;

  constructor(databasePath: string) {
    try {
      this.db = new Database(databasePath, { readonly: true });
      console.log(`✓ Connected to database: ${databasePath}`);
      // Verify database is accessible
      const testStmt = this.db.prepare('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"');
      const result = testStmt.get() as { count: number };
      console.log(`✓ Database contains ${result.count} tables`);
    } catch (error) {
      console.error(`✗ Failed to connect to database: ${databasePath}`);
      throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all table names from the database
   * Caches the result for performance
   */
  async getTables(): Promise<string[]> {
    if (this.tableNames) {
      return this.tableNames;
    }

    try {
      const stmt = this.db.prepare(`
        SELECT name 
        FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `);
      
      const rows = stmt.all() as Array<{ name: string }>;
      this.tableNames = rows.map(row => row.name);
      return this.tableNames;
    } catch (error) {
      throw new Error(`Failed to get tables: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get components from a specific table
   * Returns raw database rows (core 6 columns)
   */
  async getComponentsInTable(
    tableName: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ components: Record<string, any>[]; total: number }> {
    // Validate table name exists
    const tables = await this.getTables();
    if (!tables.includes(tableName)) {
      throw new Error(`Table "${tableName}" does not exist`);
    }

    try {
      // Get total count
      const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const countResult = countStmt.get() as { count: number };
      const total = countResult.count;

      // Get components with pagination - return raw database columns
      const query = `
        SELECT 
          "Part Number",
          "Manufacturer",
          "Description",
          "Price",
          "Device Package",
          "ComponentLink1URL"
        FROM "${tableName}"
        ORDER BY "Part Number"
        LIMIT ? OFFSET ?
      `;

      const stmt = this.db.prepare(query);
      const rows = stmt.all(limit, offset) as Record<string, any>[];

      return { components: rows, total };
    } catch (error) {
      throw new Error(`Failed to get components from table "${tableName}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get full details for a specific component by MPN
   * If tableName is provided, searches only that table (faster)
   * Otherwise, searches all tables
   * Returns raw database row with all columns
   */
  async getComponentDetails(mpn: string, tableName?: string): Promise<{
    component: Record<string, any>;
    tableName: string;
  }> {
    try {
      if (tableName) {
        // Search specific table
        const tables = await this.getTables();
        if (!tables.includes(tableName)) {
          throw new Error(`Table "${tableName}" does not exist`);
        }

        const result = await this.searchComponentInTable(mpn, tableName);
        if (!result) {
          throw new Error(`Component with MPN "${mpn}" not found in table "${tableName}"`);
        }

        return result;
      } else {
        // Search all tables
        const tables = await this.getTables();
        
        for (const table of tables) {
          const result = await this.searchComponentInTable(mpn, table);
          if (result) {
            return result;
          }
        }

        throw new Error(`Component with MPN "${mpn}" not found in any table`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Failed to get component details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search for a component in a specific table
   * Returns all columns as raw database row
   */
  private async searchComponentInTable(
    mpn: string,
    tableName: string
  ): Promise<{
    component: Record<string, any>;
    tableName: string;
  } | null> {
    try {
      // First, get all column names for this table
      const pragmaStmt = this.db.prepare(`PRAGMA table_info("${tableName}")`);
      const columns = pragmaStmt.all() as Array<{ name: string; type: string }>;
      const columnNames = columns.map(col => col.name);

      // Build query with all columns
      const columnList = columnNames.map(name => `"${name}"`).join(', ');
      const query = `
        SELECT ${columnList}
        FROM "${tableName}"
        WHERE "Part Number" = ?
        LIMIT 1
      `;

      const stmt = this.db.prepare(query);
      const row = stmt.get(mpn) as Record<string, any> | undefined;

      if (!row) {
        return null;
      }

      // Return raw database row - backend will transform to PartObject
      return {
        component: row,
        tableName,
      };
    } catch (error) {
      throw new Error(`Failed to search component in table "${tableName}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

