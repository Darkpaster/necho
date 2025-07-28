import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  Theme,
  ThemeName,
  THEME_CONFIG,
  lightTheme,
  darkTheme,
} from '../config/theme';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setSystemTheme: (enabled: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (THEME_CONFIG.systemPreference && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return (
      (localStorage.getItem(THEME_CONFIG.storageKey) as ThemeName) ||
      THEME_CONFIG.defaultTheme
    );
  });

  const [isSystemTheme, setIsSystemTheme] = useState(() => {
    return localStorage.getItem('use_system_theme') !== 'false';
  });

  const theme = THEME_CONFIG.themes[themeName];

  useEffect(() => {
    if (!isSystemTheme || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeName(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isSystemTheme]);

  useEffect(() => {
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value);
      } else {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(
            `--color-${key}-${subKey}`,
            subValue as string,
          );
        });
      }
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    root.style.setProperty(
      '--font-family-primary',
      theme.typography.fontFamily.primary,
    );
    root.style.setProperty(
      '--font-family-secondary',
      theme.typography.fontFamily.secondary,
    );
    root.style.setProperty(
      '--font-family-monospace',
      theme.typography.fontFamily.monospace,
    );
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeName(newTheme);
    if (!isSystemTheme) {
      localStorage.setItem(THEME_CONFIG.storageKey, newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setSystemTheme = (enabled: boolean) => {
    setIsSystemTheme(enabled);
    localStorage.setItem('use_system_theme', enabled.toString());

    if (enabled && window.matchMedia) {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setThemeName(prefersDark ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        setTheme,
        toggleTheme,
        isSystemTheme,
        setSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
