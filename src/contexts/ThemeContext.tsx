import * as React from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
};

// Create light and dark theme options
const getThemeOptions = (mode: ThemeMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: {
            main: '#5E35B1', // Deep purple
          },
          secondary: {
            main: '#FF4081', // Pink
          },
          background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: '#7C4DFF', // Light purple
          },
          secondary: {
            main: '#FF80AB', // Light pink
          },
          background: {
            default: '#121212',
            paper: '#1E1E1E',
          },
        }),
  },
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: mode === 'light' ? '0 4px 10px rgba(94, 53, 177, 0.2)' : 'none',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 6px 12px rgba(94, 53, 177, 0.3)' : 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 6px 16px rgba(0, 0, 0, 0.05)' 
            : '0 6px 16px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

// Create the theme context
const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Create the theme provider component
export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  // Check if a theme preference is stored in localStorage
  const savedTheme = localStorage.getItem('themeMode') as ThemeMode;
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultTheme: ThemeMode = savedTheme || (prefersDarkMode ? 'dark' : 'light');

  const [mode, setMode] = React.useState<ThemeMode>(defaultTheme);
  const theme = React.useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  // Toggle between light and dark mode
  const toggleTheme = React.useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  }, []);

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }
  return context;
}; 