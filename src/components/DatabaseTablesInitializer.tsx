import React, { useState, useEffect } from 'react';
import { Box, Alert, AlertTitle, Typography, Collapse, Button, Link } from '@mui/material';
import { createSalesProductsTable } from '../utils/createTablesIfNotExist';

interface DatabaseTablesInitializerProps {
  onComplete?: (success: boolean) => void;
}

const DatabaseTablesInitializer: React.FC<DatabaseTablesInitializerProps> = ({ 
  onComplete 
}) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const initTables = async () => {
      try {
        console.log('DatabaseTablesInitializer: Initializing required tables...');
        
        // Initialize sales_products table
        const salesTableCreated = await createSalesProductsTable();
        
        if (salesTableCreated) {
          console.log('DatabaseTablesInitializer: Sales products table initialized successfully');
          setInitialized(true);
          if (onComplete) onComplete(true);
        } else {
          console.error('DatabaseTablesInitializer: Failed to initialize sales products table');
          setError('Failed to initialize sales_products table');
          if (onComplete) onComplete(false);
        }
      } catch (err) {
        console.error('DatabaseTablesInitializer: Error initializing tables', err);
        setError(`Error initializing database tables: ${err instanceof Error ? err.message : String(err)}`);
        if (onComplete) onComplete(false);
      }
    };

    initTables();
  }, [onComplete]);

  if (initialized && !error) {
    return null; // Don't render anything if initialization was successful
  }

  return (
    <Box sx={{ mb: 3 }}>
      {error && (
        <Alert 
          severity="warning" 
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          }
        >
          <AlertTitle>Database Tables Initialization Warning</AlertTitle>
          <Typography variant="body2">
            There was an issue initializing some database tables. The application might not function correctly.
          </Typography>
          
          <Collapse in={showDetails}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Troubleshooting Steps:
              </Typography>
              
              <Typography variant="body2" component="div">
                <ol>
                  <li>Check if your Supabase server is running and accessible</li>
                  <li>Go to the Supabase dashboard SQL Editor</li>
                  <li>Run the following SQL to create the required table:
                    <Box 
                      component="pre" 
                      sx={{ 
                        mt: 1, 
                        p: 2, 
                        backgroundColor: 'background.paper', 
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.8rem'
                      }}
                    >
                      {`CREATE TABLE IF NOT EXISTS public.sales_products (
  serial_no TEXT PRIMARY KEY,
  order_id TEXT,
  date TEXT,
  product_name TEXT,
  quantity TEXT,
  unit_price_ex_gst TEXT,
  gst_percentage TEXT,
  taxable_value TEXT,
  cgst_amount TEXT,
  sgst_amount TEXT,
  total_purchase_cost TEXT,
  discount TEXT,
  tax TEXT,
  payment_amount TEXT,
  payment_method TEXT,
  payment_date TEXT
);`}
                    </Box>
                  </li>
                  <li>
                    <Link href="/schema.sql" download>
                      Click here to download the complete SQL schema
                    </Link>
                  </li>
                </ol>
              </Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Error Details:
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  mt: 1, 
                  p: 2, 
                  backgroundColor: 'rgba(255, 0, 0, 0.05)', 
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.8rem'
                }}
              >
                {error}
              </Box>
            </Box>
          </Collapse>
        </Alert>
      )}
    </Box>
  );
};

export default DatabaseTablesInitializer; 