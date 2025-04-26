import React, { useState, useEffect } from 'react';
import { Box, Alert, AlertTitle, Typography, Collapse, Button } from '@mui/material';

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
        
        // All tables initialization was removed
        // No sales_products table initialization anymore
        
        console.log('DatabaseTablesInitializer: Database tables check completed');
        setInitialized(true);
        if (onComplete) onComplete(true);
        
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
                  <li>Make sure required tables exist in your database</li>
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