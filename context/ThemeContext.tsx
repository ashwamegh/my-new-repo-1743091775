import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Storage } from '../utils/storage';
import { Analytics } from '../utils/analytics';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  subtext: string;
  accent: string;
  border: string;
}

export const LightTheme: ThemeColors = {
  primary: '#A076F9',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#121212',
  subtext: '#757575',
  accent: '#7D55E8',
  border: '#E0E0E0',
};

export const DarkTheme: ThemeColors = {
  primary: '#A076F9',
  background: '#141414',
  card: '#2D2D2D',
  text: '#FFFFFF',
  subtext: '#AAAAAA',
  accent: '#9D68FE',
  border: '#3D3D3D',
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  setSystemTheme: (useSystem: boolean) => void;
  isUsingSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUsingSystemTheme, setIsUsingSystemTheme] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const settings = await Storage.getSettings();
        setIsDarkMode(settings.darkMode);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load theme preference', error);
        setIsInitialized(true);
      }
    }
    
    loadThemePreference();
  }, []);

  // Update theme based on system preference if enabled
  useEffect(() => {
    if (isUsingSystemTheme && isInitialized) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, isUsingSystemTheme, isInitialized]);

  // Save theme preference when it changes
  useEffect(() => {
    if (isInitialized) {
      Storage.updateSettings({ darkMode: isDarkMode }).catch(console.error);
    }
  }, [isDarkMode, isInitialized]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    setIsUsingSystemTheme(false);
    Analytics.logEvent('theme_changed', { theme: !isDarkMode ? 'dark' : 'light' });
  };

  const setSystemTheme = (useSystem: boolean) => {
    setIsUsingSystemTheme(useSystem);
    if (useSystem) {
      setIsDarkMode(systemColorScheme === 'dark');
      Analytics.logEvent('theme_changed', { theme: 'system' });
    }
  };

  const colors = isDarkMode ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
        setSystemTheme,
        isUsingSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}