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
    // Keep the browser/PWA chrome color in sync with the app background
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'theme-white' ? '#e8ebf0' : '#0f1117');
    localStorage.setItem('mytutor_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Briefly enable color transitions so the switch fades smoothly
    const root = document.documentElement;
    root.classList.add('theme-transition');
    window.clearTimeout(toggleTheme._timer);
    toggleTheme._timer = window.setTimeout(() => root.classList.remove('theme-transition'), 450);
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
