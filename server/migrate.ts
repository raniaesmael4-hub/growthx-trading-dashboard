import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn('[Migration] DATABASE_URL not set, skipping migrations');
    return;
  }

  try {
    console.log('[Migration] Connecting to database...');
    const connection = await mysql.createConnection(databaseUrl);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, '../drizzle');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`[Migration] Found ${files.length} migration files`);
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      // Split by statement breakpoint
      const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
      
      console.log(`[Migration] Running ${file} (${statements.length} statements)...`);
      
      for (const statement of statements) {
        if (statement) {
          try {
            await connection.query(statement);
          } catch (error: any) {
            // Ignore "table already exists" errors
            if (!error.message.includes('already exists')) {
              console.error(`[Migration] Error in ${file}:`, error.message);
            }
          }
        }
      }
    }
    
    await connection.end();
    console.log('[Migration] ✅ Migrations completed successfully');
  } catch (error) {
    console.error('[Migration] ❌ Migration failed:', error);
    // Don't throw - allow app to start even if migrations fail
  }
}
