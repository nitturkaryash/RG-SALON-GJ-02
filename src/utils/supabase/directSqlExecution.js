import { supabase } from '../../../lib/supabase';
/**
 * Executes SQL statements directly on Supabase
 * This is a more direct approach than using RPC
 */
export const executeSQL = async (sql, options = {}) => {
    try {
        // Log SQL for debug purposes
        if (options.debug || process.env.NODE_ENV === 'development') {
            console.log('Executing SQL query:');
            console.log(sql);
        }
        
        console.log('Attempting to execute SQL via RPC method...');
        const { data, error } = await supabase.rpc('exec_sql', { sql });
        
        if (!error) {
            console.log('SQL execution via RPC successful');
            return { success: true, data };
        } else {
            console.log('RPC method failed with error:', error);
            
            // Log detailed error info including the SQL query
            console.error('SQL Error Details:');
            console.error('Message:', error.message);
            console.error('Details:', error.details);
            console.error('Hint:', error.hint);
            console.error('Failed SQL Query:');
            console.error(sql);
            
            // If the error message mentions a relation that doesn't exist, provide more specific guidance
            if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
                const match = error.message.match(/relation "(.*?)" does not exist/);
                const missingRelation = match ? match[1] : 'unknown';
                console.error(`The table or view "${missingRelation}" doesn't exist. Check your database schema or create this relation.`);
            }
            
            return { success: false, error };
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        console.error('Failed SQL Query:');
        console.error(sql);
        return { success: false, error };
    }
};
/**
 * Creates the UUID extension if it doesn't exist
 * This is required for the uuid_generate_v4() function
 */
export const ensureUuidExtension = async () => {
    try {
        const result = await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        if (!result.success) {
            console.error('Failed to create UUID extension:', result.error);
            throw new Error(`Failed to create UUID extension: ${result.error?.message || 'Unknown error'}`);
        }
        console.log('UUID extension is available');
    }
    catch (error) {
        console.error('Failed to create UUID extension:', error);
        throw new Error(`Failed to create UUID extension: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
/**
 * Creates a table with a simple structure to test SQL execution
 */
export const createTestTable = async () => {
    try {
        const result = await executeSQL(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        return result.success;
    }
    catch (error) {
        console.error('Failed to create test table:', error);
        return false;
    }
};
