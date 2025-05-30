import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes } from '@/lib/themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('code-sandbox-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('code-sandbox-theme', theme);
    
    // Apply theme to document
    const root = document.documentElement;
    const themeColors = themes[theme];
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'vibe');
    root.classList.add(theme);
    
    // Apply CSS variables
    Object.entries(themeColors).forEach(([key, value]) => {
      if (key !== 'name' && key !== 'icon') {
        root.style.setProperty(`--${key}`, value);
      }
    });

    // Special handling for vibe theme gradient
    if (theme === 'vibe') {
      document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)';
      document.body.style.backgroundSize = '300% 300%';
      document.body.style.animation = 'gradient-shift 20s ease infinite';
    } else {
      document.body.style.background = '';
      document.body.style.backgroundSize = '';
      document.body.style.animation = '';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
