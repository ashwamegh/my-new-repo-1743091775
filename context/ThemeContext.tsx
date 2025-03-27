import React, { createContext, useState, useContext } from 'react';

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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const colors = isDarkMode ? DarkTheme : LightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
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