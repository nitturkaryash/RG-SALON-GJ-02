import { supabase } from './supabase/supabaseClient';

/**
 * This script adds client_name and client_phone columns to the appointments table
 * and populates them with data from the clients table.
 */
async function addClientColumns() {
  try {
    console.log('Adding client_name and client_phone columns to appointments table...');
    
    // 1. First, check if the add_missing_column function exists
    const { error: functionCheckError } = await supabase.rpc('add_missing_column', { 
      table_name: 'appointments',
      column_name: 'client_name',
      column_definition: 'TEXT'
    });
    
    if (functionCheckError) {
      console.log('Using direct SQL query approach instead...');
      
      // 2. Add client_name column if it doesn't exist
      const { error: clientNameError } = await supabase.rpc('execute_sql', {
        sql_query: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'appointments'
              AND column_name = 'client_name'
            ) THEN
              ALTER TABLE appointments
              ADD COLUMN client_name TEXT;
              
              RAISE NOTICE 'Added client_name column to appointments table';
            ELSE
              RAISE NOTICE 'client_name column already exists in appointments table';
            END IF;
          END $$;
        `
      });
      
      if (clientNameError) {
        console.error('Error adding client_name column:', clientNameError);
      } else {
        console.log('Successfully checked/added client_name column');
      }
      
      // 3. Add client_phone column if it doesn't exist
      const { error: clientPhoneError } = await supabase.rpc('execute_sql', {
        sql_query: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'appointments'
              AND column_name = 'client_phone'
            ) THEN
              ALTER TABLE appointments
              ADD COLUMN client_phone TEXT;
              
              RAISE NOTICE 'Added client_phone column to appointments table';
            ELSE
              RAISE NOTICE 'client_phone column already exists in appointments table';
            END IF;
          END $$;
        `
      });
      
      if (clientPhoneError) {
        console.error('Error adding client_phone column:', clientPhoneError);
      } else {
        console.log('Successfully checked/added client_phone column');
      }
    } else {
      console.log('Successfully added/verified client_name and client_phone columns');
    }
    
    // 4. Populate client_name and client_phone columns with data from clients
    console.log('Updating client_name and client_phone values from client records...');
    
    const { error: updateError } = await supabase.rpc('execute_sql', {
      sql_query: `
        UPDATE appointments a
        SET 
          client_name = c.full_name,
          client_phone = c.phone
        FROM clients c
        WHERE a.client_id = c.id
        AND (a.client_name IS NULL OR a.client_phone IS NULL);
      `
    });
    
    if (updateError) {
      console.error('Error updating client_name and client_phone values:', updateError);
    } else {
      console.log('Successfully updated client_name and client_phone values');
    }
    
    console.log('Column addition and data population completed.');
    
  } catch (error) {
    console.error('Error in addClientColumns function:', error);
  }
}

// Export for use in other files
export { addClientColumns };

// If running directly, execute the function
if (typeof window === 'undefined') {
  addClientColumns().catch(console.error);
} 