import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error, 
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use default error UI
      return (
        <Box sx={{ p: 3, m: 2 }}>
          <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: '#FFEBEE' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong!
            </Typography>
            <Typography variant="body1" paragraph>
              {this.state.error?.toString()}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>
            {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
              <Box sx={{ mt: 4, overflow: 'auto', maxHeight: '300px', p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="caption" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 