/**
 * Custom hook to access centralized theme configuration
 * 
 * Usage:
 * const theme = useAppTheme();
 * sx={{ bgcolor: theme.colors.primary.main }}
 */

import { themeConfig } from '../config/theme.config';

export const useAppTheme = () => {
  return themeConfig;
};

export default useAppTheme;

