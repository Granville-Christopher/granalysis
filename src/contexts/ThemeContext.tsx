import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setIsDark: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDarkState] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  // Apply theme to DOM immediately without transitions during switch
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Disable transitions for instant theme switch
    root.classList.add('no-transition');
    
    if (isDark) {
      root.classList.add("dark");
      body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    // Force a reflow to ensure classes are applied
    void root.offsetHeight;
    
    // Re-enable transitions after theme is applied
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-transition');
      });
    });
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDarkState(prev => !prev);
  }, []);

  const setIsDark = useCallback((value: boolean) => {
    setIsDarkState(value);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Backward compatibility hook
export const useDarkMode = () => {
  const { isDark, setIsDark } = useTheme();
  return [isDark, setIsDark] as const;
};

