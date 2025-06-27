import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...\n');

    // Get all migration files
    const migrationsDir = './supabase/migrations';
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`📄 Processing ${file}...`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
          console.log(`❌ Error in ${file}:`, error.message);
          if (error.message.includes('permission denied')) {
            console.log('This appears to be a permissions issue. Please run migrations using the Supabase dashboard or CLI.');
            break;
          }
        } else {
          console.log(`✅ Successfully applied ${file}`);
        }
      } catch (error) {
        console.error(`❌ Failed to apply ${file}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

console.log('Supabase URL:', supabaseUrl);
console.log('---\n');

runMigrations().catch(console.error); 