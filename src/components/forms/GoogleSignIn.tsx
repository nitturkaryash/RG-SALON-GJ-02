import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#1f1f1f',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: '#ffffff',
    border: '1px solid #FFD700',
    boxShadow: '0 6px 20px rgba(255, 215, 0, 0.3)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    color: 'rgba(0, 0, 0, 0.4)',
    cursor: 'not-allowed',
  },
  '&:focus': {
    backgroundColor: '#ffffff',
    border: '1px solid #FFD700',
    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0px)',
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1.5),
    '& svg': {
      fontSize: '1.2rem',
    },
  },
}));

interface GoogleSignInProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  redirectTo?: string;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSuccess,
  onError,
  redirectTo,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      console.log('🔐 Starting Google OAuth...');
      console.log('📍 Redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('📊 OAuth Response:', { data, error });

      if (error) {
        console.error('❌ OAuth Error:', error);

        // Handle specific error codes
        if (error.message?.includes('provider is not enabled')) {
          const errorMsg =
            '🚫 Google Sign-In is not enabled in Supabase. Please contact support or use username/password login.';
          toast.error(errorMsg);
          onError?.(new Error(errorMsg));
        } else if (error.message?.includes('Invalid login credentials')) {
          toast.error('❌ Invalid Google credentials. Please try again.');
          onError?.(error);
        } else if (error.message?.includes('redirect_uri_mismatch')) {
          const errorMsg =
            '🔧 OAuth configuration error. Please contact support.';
          toast.error(errorMsg);
          onError?.(new Error(errorMsg));
        } else {
          toast.error(`❌ Sign-in failed: ${error.message}`);
          onError?.(error);
        }
        return;
      }

      if (data?.url) {
        console.log('✅ Redirecting to OAuth URL:', data.url);
        toast.success('🔄 Redirecting to Google...');
        window.location.href = data.url;
      } else {
        console.log('✅ OAuth successful, no redirect needed');
        toast.success('✅ Google Sign-In successful!');
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('💥 Unexpected error:', err);
      const errorMessage =
        err.message || 'Unexpected error during Google Sign-In';
      toast.error(`💥 ${errorMessage}`);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <GoogleButton
        fullWidth
        variant='contained'
        onClick={handleGoogleSignIn}
        disabled={loading}
        startIcon={loading ? null : <GoogleIcon />}
        sx={{ mb: 2 }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                border: '2px solid #ccc',
                borderTop: '2px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <span>Connecting...</span>
          </Box>
        ) : (
          'Continue with Google'
        )}
      </GoogleButton>

      <Typography
        variant='caption'
        sx={{
          display: 'block',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.75rem',
          mt: 1,
        }}
      >
        Quick and secure login with your Google account
      </Typography>
    </Box>
  );
};

export default GoogleSignIn;
