import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ContentCut, Login as LoginIcon } from '@mui/icons-material';

const AuthContainer = styled(Paper)(({ theme }) => ({
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
}));

const ActionButton = styled(Button)(({ theme }) => ({
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

export default function UserAuth() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuthContext();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (session) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [session, navigate, location]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      setSuccess('Login successful! Redirecting...');

      // Reset form
      setLoginData({ email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

            <AuthContainer>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant='h4'
                  sx={{
                    color: '#FFD700',
                    fontWeight: 'bold',
                    mb: 1,
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  Sign In
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  R&G Salon Management
                </Typography>
              </Box>

              {error && (
                <Fade in>
                  <Alert
                    severity='error'
                    sx={{
                      mb: 3,
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

              {success && (
                <Fade in>
                  <Alert
                    severity='success'
                    sx={{
                      mb: 3,
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      color: '#81c784',
                      '& .MuiAlert-icon': {
                        color: '#81c784',
                      },
                    }}
                  >
                    {success}
                  </Alert>
                </Fade>
              )}

              <Box
                component='form'
                onSubmit={handleLogin}
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
                  value={loginData.email}
                  onChange={e =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />

                <GoldTextField
                  required
                  fullWidth
                  label='Password'
                  type='password'
                  value={loginData.password}
                  onChange={e =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />

                <ActionButton
                  type='submit'
                  fullWidth
                  size='large'
                  disabled={loading || !loginData.email || !loginData.password}
                  startIcon={<LoginIcon />}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </ActionButton>

                <Typography
                  variant='body1'
                  align='center'
                  sx={{
                    mt: 3,
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Need an account? Contact our administrators:
                </Typography>
                <Typography
                  variant='body1'
                  component='div'
                  align='center'
                  sx={{
                    color: '#FFD700',
                    '& a': {
                      color: '#FFD700',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    },
                  }}
                >
                  <a href='mailto:nitturkashyash@gmail.com'>
                    nitturkashyash@gmail.com
                  </a>
                  <br />
                  <a href='mailto:pankajhadole@gmail.com'>
                    pankajhadole@gmail.com
                  </a>
                </Typography>
              </Box>

              <Typography
                variant='body2'
                align='center'
                sx={{
                  mt: 3,
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.875rem',
                }}
              >
                © 2024 R&G Salon. All rights reserved.
              </Typography>
            </AuthContainer>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
