// Using a dynamic import approach to avoid circular dependencies
let supabase: any;
let TABLES: any;

// Define local connection status variables
let connectionStatus = 'initializing';
let connectionError: Error | null = null;

// Initialize the required variables asynchronously
const initializeSupabase = async () => {
  try {
    // Dynamic import to avoid circular dependencies
    const module = await import('./supabaseClient');
    
    // Get the exported values
    supabase = module.supabase;
    TABLES = module.TABLES;
    connectionStatus = module.connectionStatus;
    connectionError = module.connectionError;
    
    return {
      supabase,
      TABLES,
      connectionStatus,
      connectionError
    };
  } catch (e) {
    console.error('Error initializing Supabase connection:', e);
    connectionError = e instanceof Error ? e : new Error('Unknown initialization error');
    return {
      supabase: null,
      TABLES: {},
      connectionStatus: 'initialization-error',
      connectionError
    };
  }
};

// Helper type for error objects
interface ErrorWithMessage {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  [key: string]: any;
}

/**
 * Verifies the connection to Supabase and checks if required tables exist
 * This can be used during application startup to validate database connectivity
 */
export const verifySupabaseConnection = async (): Promise<{
  connected: boolean;
  tables: Record<string, boolean>;
  error?: string;
  diagnostics?: any;
}> => {
  // Initialize the Supabase client and get other exports
  const { supabase, TABLES, connectionStatus, connectionError } = await initializeSupabase();
  
  if (!supabase) {
    return {
      connected: false,
      tables: {},
      error: 'Failed to initialize Supabase client',
      diagnostics: { connectionStatus, connectionError }
    };
  }
  
  // Prepare diagnostics information
  const diagnostics = {
    connectionStatus,
    connectionError,
    jwToken: {
      provided: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      length: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
      format: import.meta.env.VITE_SUPABASE_ANON_KEY?.split('.').length === 3 ? 'valid' : 'invalid',
      parts: import.meta.env.VITE_SUPABASE_ANON_KEY?.split('.').length || 0
    },
    databaseUrl: {
      provided: !!import.meta.env.VITE_SUPABASE_URL,
      value: import.meta.env.VITE_SUPABASE_URL || ''
    },
    timestamp: new Date().toISOString(),
    attempts: [] as any[]
  };

  try {
    // First check: Simple query to the sales table
    const simpleCheckStart = Date.now();
    const salesTable = TABLES.SALES || 'inventory_sales_new';
    const firstAttempt = await runDiagnosticQuery(salesTable, supabase);
    diagnostics.attempts.push({
      type: 'simple_query',
      table: salesTable,
      duration: Date.now() - simpleCheckStart,
      result: firstAttempt
    });

    // If we have a JWT error, return immediately with diagnostic info
    const errorMsg = (firstAttempt.error as ErrorWithMessage)?.message || '';
    if (firstAttempt.error && 
        (errorMsg.includes('JWT') || 
         errorMsg.includes('JWS') ||
         errorMsg.includes('CompactDecodeError'))) {
      return {
        connected: false,
        tables: {},
        error: `Failed to connect to Supabase: ${errorMsg}`,
        diagnostics
      };
    }

    // Skip the RPC call that's causing the 401 error
    // Instead, if the first query was successful, consider the connection good
    if (!firstAttempt.error) {
      console.log('Connected to Supabase successfully');
    } else {
      // If the first query failed with a non-JWT error, return the error
      return {
        connected: false,
        tables: {},
        error: `Failed to connect to Supabase: ${errorMsg}`,
        diagnostics
      };
    }
    
    // Check if all required tables exist
    const tablesResult: Record<string, boolean> = {};
    
    // Get all table names from the TABLES object
    const tableNames = Object.values(TABLES);
    
    // Check each table
    for (const tableName of tableNames) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
          
        tablesResult[tableName] = !error;
      } catch (err) {
        tablesResult[tableName] = false;
      }
    }
    
    return {
      connected: true,
      tables: tablesResult,
      diagnostics
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      connected: false,
      tables: {},
      error: errorMessage,
      diagnostics: {
        ...diagnostics,
        finalError: error
      }
    };
  }
};

/**
 * Helper function to run a diagnostic query on a table
 */
async function runDiagnosticQuery(tableName: string, supabaseClient: any) {
  try {
    const { data, error, count } = await supabaseClient
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    return { data, error, count };
  } catch (err) {
    return { data: null, error: err, count: 0 };
  }
} 