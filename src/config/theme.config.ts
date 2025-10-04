/**
 * Centralized Theme Configuration
 * 
 * Change colors, fonts, spacing, and other design tokens from this single file.
 * All changes here will automatically apply across the entire application.
 */

export const themeConfig = {
  // ============================================
  // COLOR PALETTE
  // ============================================
  colors: {
    // Primary Brand Colors
    primary: {
      main: '#667eea',      // Main purple
      light: '#764ba2',     // Light purple
      dark: '#5568d3',      // Dark purple
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },

    // Secondary Colors
    secondary: {
      main: '#8baf3f',      // Olive green
      light: '#9bc252',
      dark: '#7da237',
    },

    // Success Colors
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      gradient: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
    },

    // Warning Colors
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },

    // Error Colors
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },

    // Info Colors
    info: {
      main: '#4f46e5',
      light: '#6366f1',
      dark: '#4338ca',
      gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    },

    // Neutral Colors
    neutral: {
      white: '#ffffff',
      black: '#000000',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
    },

    // Background Colors
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
      dark: '#1a1a2e',
    },

    // Text Colors
    text: {
      primary: '#2d3748',
      secondary: '#718096',
      disabled: '#a0aec0',
      hint: '#cbd5e0',
    },

    // Border Colors
    border: {
      light: '#e0e0e0',
      main: '#d0d0d0',
      dark: '#b0b0b0',
    },

    // Table Colors
    table: {
      headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      rowHover: 'rgba(102, 126, 234, 0.08)',
      rowHoverShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
      borderColor: '#f0f0f0',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      heading: 'Inter, sans-serif',
      mono: 'Menlo, Monaco, Courier New, monospace',
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },

    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },

    letterSpacing: {
      tight: '-0.05em',
      normal: '0',
      wide: '0.05em',
      wider: '0.1em',
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    hover: '0 2px 8px rgba(102, 126, 234, 0.15)',
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },

  // ============================================
  // COMPONENT SPECIFIC STYLES
  // ============================================
  components: {
    // Button Styles
    button: {
      borderRadius: '10px',
      padding: {
        sm: '6px 16px',
        md: '8px 20px',
        lg: '12px 24px',
      },
      fontWeight: 600,
      textTransform: 'none' as const,
    },

    // Card Styles
    card: {
      borderRadius: '12px',
      padding: '24px',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },

    // Input Styles
    input: {
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '14px',
    },

    // Table Styles
    table: {
      headerPadding: '14px 16px',
      cellPadding: '12px 16px',
      fontSize: '0.85rem',
      headerFontWeight: 700,
    },

    // Dialog Styles
    dialog: {
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '600px',
    },

    // Sidebar Styles
    sidebar: {
      width: 240,
      collapsedWidth: 64,
      transition: '0.3s ease',
    },

    // Header Styles
    header: {
      height: '64px',
      padding: '16px 24px',
    },
  },

  // ============================================
  // CUSTOM GRADIENTS
  // ============================================
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
    info: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    warning: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    error: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    neutral: 'linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%)',
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    blue: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
  },

  // ============================================
  // SCROLLBAR STYLES
  // ============================================
  scrollbar: {
    width: '10px',
    height: '10px',
    track: {
      background: '#f5f7fa',
      borderRadius: '8px',
    },
    thumb: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '8px',
      hoverBackground: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    },
  },
};

// Export type for TypeScript autocomplete
export type ThemeConfig = typeof themeConfig;

// Helper function to get nested theme values
export const getThemeValue = (path: string): any => {
  const keys = path.split('.');
  let value: any = themeConfig;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }
  
  return value;
};

// Export default
export default themeConfig;

