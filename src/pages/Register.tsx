import { Box, Typography, Container, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { ContentCut } from '@mui/icons-material';

const RegisterContainer = styled(Paper)(({ theme }) => ({
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

export default function Register() {
  const theme = useTheme();

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
        <Box>
          <LogoBox>
            <ContentCut />
          </LogoBox>
          
          <RegisterContainer>
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
                Create Account
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 2,
                  fontWeight: 500,
                }}
              >
                R&G Salon Management
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  maxWidth: '400px',
                  margin: '0 auto',
                  mb: 3,
                }}
              >
                To create a new account, please contact our administrators:
              </Typography>
              <Typography 
                variant="body1" 
                component="div"
                sx={{ 
                  color: '#FFD700',
                  mb: 2,
                  '& a': {
                    color: '#FFD700',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                <a href="mailto:nitturkaryash@gmail.com">nitturkaryash@gmail.com</a>
                <br />
                <a href="mailto:pankajhadole4@gmail.com">pankajhadole4@gmail.com</a>
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#FFD700',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </RegisterContainer>
        </Box>
      </Container>
    </Box>
  );
} 