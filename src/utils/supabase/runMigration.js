const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting database migration with NEW Supabase credentials...');

// Supabase configuration strictly from env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  try {
    console.log('Starting migration process...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'salon_consumption_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running SQL migration...');
    console.log('SQL to execute:', sql);
    
    // Execute the SQL using the Supabase client
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }
    
    console.log('Migration successful!', data);
    
    // Verify the table was created
    const { data: tableCheck, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'inventory_salon_consumption')
      .single();
      
    if (tableError) {
      console.warn('Could not verify table creation:', tableError);
    } else {
      console.log('Table verification:', tableCheck ? 'Table exists!' : 'Table not found!');
    }
    
  } catch (err) {
    console.error('Unexpected error during migration:', err);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 