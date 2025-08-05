import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  TextField,
  Stack,
  Chip,
} from '@mui/material';
import { Key, Login, Logout, Person } from '@mui/icons-material';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  authenticateWithProvidedToken, 
  isTokenAuthenticated, 
  getTokenAuthenticatedUser,
  logoutTokenUser,
  isValidTokenFormat,
  AUTH_TOKEN 
} from '../utils/tokenAuth';

const TokenAuthDemo: React.FC = () => {
  const { user, authenticateWithToken } = useAuthContext();
  const [customToken, setCustomToken] = useState(AUTH_TOKEN);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAuthenticateWithProvidedToken = async () => {
    try {
      setStatus('Authenticating with provided token...');
      setError('');
      
      await authenticateWithProvidedToken();
      setStatus('Successfully authenticated with provided token!');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setStatus('');
    }
  };

  const handleAuthenticateWithCustomToken = async () => {
    try {
      if (!isValidTokenFormat(customToken)) {
        setError('Invalid token format. Please enter a valid UUID.');
        return;
      }

      setStatus('Authenticating with custom token...');
      setError('');
      
      await authenticateWithToken(customToken);
      setStatus('Successfully authenticated with custom token!');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setStatus('');
    }
  };

  const handleLogout = () => {
    logoutTokenUser();
    setStatus('Logged out successfully');
    setError('');
  };

  const currentUser = getTokenAuthenticatedUser();
  const isAuthenticated = isTokenAuthenticated();

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Key /> Token Authentication Demo
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This demo shows how to use the token authentication system with the provided token: 
          <Chip 
            label={AUTH_TOKEN} 
            size="small" 
            sx={{ ml: 1, fontFamily: 'monospace' }}
          />
        </Typography>

        {/* Status Display */}
        {status && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {status}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Authentication Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Status
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip 
              label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              color={isAuthenticated ? 'success' : 'default'}
              icon={<Person />}
            />
            {currentUser && (
              <Typography variant="body2" color="text.secondary">
                User: {currentUser.name} ({currentUser.provider})
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Authentication Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Actions
          </Typography>
          
          <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<Login />}
              onClick={handleAuthenticateWithProvidedToken}
              disabled={isAuthenticated}
              fullWidth
            >
              Authenticate with Provided Token
            </Button>

            <Box>
              <TextField
                fullWidth
                label="Custom Token"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                helperText="Enter a custom UUID token for authentication"
                sx={{ mb: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<Key />}
                onClick={handleAuthenticateWithCustomToken}
                disabled={isAuthenticated || !customToken}
                fullWidth
              >
                Authenticate with Custom Token
              </Button>
            </Box>

            {isAuthenticated && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                fullWidth
              >
                Logout
              </Button>
            )}
          </Stack>
        </Box>

        {/* Usage Instructions */}
        <Box>
          <Typography variant="h6" gutterBottom>
            How to Use
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            1. Click "Authenticate with Provided Token" to use the pre-configured token
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            2. Or enter a custom UUID token and click "Authenticate with Custom Token"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            3. Once authenticated, you can access the full application
          </Typography>
          <Typography variant="body2" color="text.secondary">
            4. Use the logout button to clear authentication
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TokenAuthDemo; 