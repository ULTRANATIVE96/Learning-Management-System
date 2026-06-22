import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Default to theme-black (Dark Mode) as required
    const saved = localStorage.getItem('mytutor_theme');
    return saved ? saved : 'theme-black';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'theme-white') {
      root.classList.remove('theme-black');
      root.classList.add('theme-white');
    } else {
      root.classList.remove('theme-white');
      root.classList.add('theme-black');
    }
    localStorage.setItem('mytutor_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'theme-black' ? 'theme-white' : 'theme-black');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
