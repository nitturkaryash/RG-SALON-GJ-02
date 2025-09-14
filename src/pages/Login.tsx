import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Fade,
  useTheme,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ContentCut, LockPerson, Key } from '@mui/icons-material';
import GoogleSignIn from '../components/forms/GoogleSignIn';

const LoginContainer = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #111111 0%, #000000 100%)',
  color: theme.palette.common.white,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'radial-gradient(circle at top right, rgba(255, 215, 0, 0.1), transparent 70%)',
    pointerEvents: 'none',
  },
}));

const GoldTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius,
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.3)',
      transition: 'all 0.2s ease-in-out',
    },
    '&:hover fieldset': {
      borderColor: '#FFD700',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#FFD700',
    },
  },
  '& .MuiInputAdornment-root': {
    color: 'rgba(255, 215, 0, 0.5)',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #B8860B, #FFD700)',
  color: theme.palette.common.black,
  fontWeight: 'bold',
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #DAA520, #FFF8DC)',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(218, 165, 32, 0.4)',
  },
  transition: 'all 0.3s ease-in-out',
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  '& .MuiSvgIcon-root': {
    fontSize: '4rem',
    color: '#FFD700',
    filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))',
    animation: 'float 3s ease-in-out infinite',
  },
  '@keyframes float': {
    '0%, 100%': {
      transform: 'rotate(-45deg) translateY(0px)',
    },
    '50%': {
      transform: 'rotate(-45deg) translateY(-10px)',
    },
  },
}));

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    session,
    user,
    loading: authLoading,
    authenticateWithToken,
  } = useAuthContext();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [token, setToken] = useState('3f4b718f-70cb-4873-a62c-b8806a92e25b'); // Pre-filled with provided token
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Handle OAuth errors from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_callback_error') {
      setError(
        'Google Sign-In failed. Please try again or use your username/password.'
      );
    }
  }, [searchParams]);

  useEffect(() => {
    // Don't redirect if still loading auth state
    if (authLoading) return;

    // Check if user is authenticated (either through Supabase session or localStorage)
    if (session || user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [session, user, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use Supabase authentication instead of custom auth table
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.username, // Treating username as email for Supabase auth
        password: credentials.password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        throw new Error(error.message || 'Invalid email or password');
      }

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      // Clear any old localStorage auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Navigate to dashboard - the AuthContext will handle the session
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authenticateWithToken(token);

      // Navigate to dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Token authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    // Success will be handled by the auth callback route
    // User will be redirected automatically
  };

  const handleGoogleError = (error: any) => {
    console.error('Google Sign-In error:', error);
    setError(
      'Google Sign-In failed. Please try again or use your username/password.'
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(''); // Clear any existing errors when switching tabs
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #000000 0%, #1a1a1a 100%)',
        }}
      >
        <Typography variant='h6' sx={{ color: '#FFD700' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #000000 0%, #1a1a1a 100%)',
        padding: theme.spacing(3),
      }}
    >
      <Container maxWidth='sm'>
        <Fade in timeout={1000}>
          <Box>
            <LogoBox>
              <ContentCut />
            </LogoBox>

            <LoginContainer>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant='h4'
                  sx={{
                    color: '#FFD700',
                    fontWeight: 'bold',
                    mb: 1,
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  Welcome to R&G Salon
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  Admin Portal
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    maxWidth: '400px',
                    margin: '0 auto',
                  }}
                >
                  Enter your credentials to access the salon management system
                </Typography>
              </Box>

              {error && (
                <Fade in>
                  <Alert
                    severity='error'
                    sx={{
                      bgcolor: 'rgba(211, 47, 47, 0.1)',
                      color: '#ff8a80',
                      '& .MuiAlert-icon': {
                        color: '#ff8a80',
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Google Sign-In Section */}
              <Box sx={{ mb: 3 }}>
                <GoogleSignIn
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  redirectTo={`${window.location.origin}/dashboard`}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Divider
                    sx={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                  />
                  <Typography
                    sx={{
                      px: 2,
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.875rem',
                    }}
                  >
                    OR
                  </Typography>
                  <Divider
                    sx={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                  />
                </Box>
              </Box>

              {/* Authentication Tabs */}
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  mb: 3,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-selected': {
                        color: '#FFD700',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#FFD700',
                    },
                  }}
                >
                  <Tab label='Email & Password' />
                  <Tab label='Token Authentication' />
                </Tabs>
              </Box>

              {/* Email & Password Tab */}
              {activeTab === 0 && (
                <Box
                  component='form'
                  onSubmit={handleSubmit}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <GoldTextField
                    required
                    fullWidth
                    label='Email'
                    type='email'
                    value={credentials.username}
                    onChange={e =>
                      setCredentials({
                        ...credentials,
                        username: e.target.value,
                      })
                    }
                  />

                  <GoldTextField
                    required
                    fullWidth
                    label='Password'
                    type='password'
                    value={credentials.password}
                    onChange={e =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                  />

                  <LoginButton
                    type='submit'
                    fullWidth
                    size='large'
                    disabled={
                      loading || !credentials.username || !credentials.password
                    }
                    startIcon={<LockPerson />}
                  >
                    {loading ? 'Signing In...' : 'Sign In to Dashboard'}
                  </LoginButton>
                </Box>
              )}

              {/* Token Authentication Tab */}
              {activeTab === 1 && (
                <Box
                  component='form'
                  onSubmit={handleTokenSubmit}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <GoldTextField
                    required
                    fullWidth
                    label='Authentication Token'
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    helperText='Enter your authentication token'
                  />

                  <LoginButton
                    type='submit'
                    fullWidth
                    size='large'
                    disabled={loading || !token}
                    startIcon={<Key />}
                  >
                    {loading ? 'Authenticating...' : 'Authenticate with Token'}
                  </LoginButton>
                </Box>
              )}

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                  }}
                >
                  Don't have an account?{' '}
                  <Link
                    to='/register'
                    style={{
                      color: '#FFD700',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>

              <Typography
                variant='body2'
                align='center'
                sx={{
                  mt: 2,
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.875rem',
                }}
              >
                © 2024 R&G Salon. All rights reserved.
              </Typography>
            </LoginContainer>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
