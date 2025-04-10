const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables or provide default values for development
const supabaseUrl = process.env.SUPABASE_URL || 'https://cpkxkoosykyahuezxela.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseKey) {
  console.error('Error: Supabase key is required. Set the SUPABASE_KEY environment variable.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
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