import { supabase } from './supabase/supabaseClient.js';
import fs from 'fs';
import path from 'path';

// Read SQL file content
const readSqlFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading SQL file: ${error.message}`);
    return null;
  }
};

// Execute SQL statements
const executeSql = async (sql) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Error executing SQL: ${error.message}`);
      return false;
    }
    
    console.log('SQL executed successfully');
    return true;
  } catch (error) {
    console.error(`Error calling exec_sql: ${error.message}`);
    return false;
  }
};

// Run migration
const runMigration = async () => {
  console.log('Starting migration...');
  
  // Path to SQL file
  const sqlFilePath = path.resolve(__dirname, '../../sql/holiday_management.sql');
  const sql = readSqlFile(sqlFilePath);
  
  if (!sql) {
    console.error('Failed to read SQL file');
    return;
  }
  
  // Execute SQL
  const success = await executeSql(sql);
  
  if (success) {
    console.log('Migration completed successfully');
  } else {
    console.error('Migration failed');
  }
};

// Function to create the exec_sql RPC if it doesn't exist
const createExecSqlFunction = async () => {
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN jsonb_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE
      );
    END;
    $$;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' });
    
    // If function doesn't exist, create it
    if (error && error.code === '42883') {
      const { error: createError } = await supabase.from('rpc').select('*').limit(1);
      
      if (createError) {
        console.error('Error checking RPC:', createError);
        return false;
      }
      
      // We'll need to create the function using SQL directly
      console.log('Creating exec_sql function...');
      // In a real-world scenario, you would need admin access to execute this
      // This is just a placeholder - in practice, you would need to run this
      // through the Supabase dashboard SQL editor as an admin
      console.log('Please create the exec_sql function through the Supabase dashboard SQL editor');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating exec_sql function:', error);
    return false;
  }
};

// Execute if this file is run directly
if (require.main === module) {
  (async () => {
    const execSqlExists = await createExecSqlFunction();
    
    if (execSqlExists) {
      await runMigration();
    } else {
      console.log('Please create the exec_sql function first');
    }
  })();
}

export { runMigration }; 