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
  Tab,
  Tabs,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ContentCut, PersonAdd, Login as LoginIcon } from '@mui/icons-material';

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
    background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.1), transparent 70%)',
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: '#FFD700',
  },
  '& .MuiTab-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-selected': {
      color: '#FFD700',
    },
  },
}));

export default function UserAuth() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  });

  useEffect(() => {
    if (session) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [session, navigate, location]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await signIn(loginData.email, loginData.password);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!registerData.businessName.trim()) {
      setError('Business name is required');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting registration process...');
      
      const { error } = await signUp(registerData.email, registerData.password, {
        role: 'user',
        salon_name: registerData.businessName,
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.message?.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message?.includes('Password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message?.includes('relation "user_profiles" does not exist')) {
          errorMessage = 'Database is not properly set up. Please contact support.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      console.log('Registration successful');
      setSuccess('Registration successful! Please check your email to confirm your account, then use the login tab.');
      
      // Reset form and switch to login tab
      setRegisterData({
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
      });
      
      // Switch to login tab after successful registration
      setTimeout(() => setActiveTab(0), 2000);
    } catch (err: any) {
      console.error('Registration error in component:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Box>
            <LogoBox>
              <ContentCut />
            </LogoBox>
            
            <AuthContainer>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography 
                  variant="h4" 
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
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    maxWidth: '400px',
                    margin: '0 auto',
                  }}
                >
                  Login to your account or create a new one to manage your salon
                </Typography>
              </Box>

              <StyledTabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                sx={{ mb: 3 }}
              >
                <Tab 
                  icon={<LoginIcon />} 
                  label="Login" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<PersonAdd />} 
                  label="Register" 
                  iconPosition="start"
                />
              </StyledTabs>

              <Divider sx={{ mb: 3, backgroundColor: 'rgba(255, 215, 0, 0.2)' }} />

              {/* Messages */}
              {error && (
                <Fade in>
                  <Alert 
                    severity="error" 
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
                    severity="success" 
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

              {/* Login Form */}
              {activeTab === 0 && (
                <Box
                  component="form"
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
                    label="Email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />

                  <GoldTextField
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />

                  <ActionButton
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={loading || !loginData.email || !loginData.password}
                    startIcon={<LoginIcon />}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </ActionButton>
                </Box>
              )}

              {/* Register Form */}
              {activeTab === 1 && (
                <Box
                  component="form"
                  onSubmit={handleRegister}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <GoldTextField
                    required
                    fullWidth
                    label="Business Name"
                    value={registerData.businessName}
                    onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                    placeholder="Enter your salon/business name"
                  />

                  <GoldTextField
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="Enter your email address"
                  />

                  <GoldTextField
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    inputProps={{ minLength: 6 }}
                  />

                  <GoldTextField
                    required
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                  />

                  <ActionButton
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={loading || !registerData.email || !registerData.password || !registerData.confirmPassword || !registerData.businessName}
                    startIcon={<PersonAdd />}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </ActionButton>
                </Box>
              )}

              <Typography 
                variant="body2" 
                align="center" 
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