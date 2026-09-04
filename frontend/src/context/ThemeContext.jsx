import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useContext(AuthContext) || {};

  const getStorageKey = (u) => {
    if (u?.id) return `theme_user_${u.id}`;
    if (u?.email) return `theme_user_${u.email}`;
    return 'theme_guest';
  };

  const getThemeForUser = (u) => {
    const key = getStorageKey(u);
    const saved = localStorage.getItem(key);
    if (saved) return saved === 'dark';
    // Default to light mode (false) if no preference exists
    return false;
  };

  const [isDarkMode, setIsDarkMode] = useState(() => getThemeForUser(user));
  const prevUserKeyRef = useRef(getStorageKey(user));

  // Sync theme when user changes (login, logout, switch user)
  useEffect(() => {
    const currentKey = getStorageKey(user);
    const shouldBeDark = getThemeForUser(user);
    setIsDarkMode(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
    prevUserKeyRef.current = currentKey;
  }, [user?.id, user?.email]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      const key = getStorageKey(user);
      const val = next ? 'dark' : 'light';
      localStorage.setItem(key, val);
      localStorage.setItem('theme', val);

      if (next) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      return next;
    });
  };

  const setTheme = (theme) => {
    const isDark = theme === 'dark';
    setIsDarkMode(isDark);
    const key = getStorageKey(user);
    const val = isDark ? 'dark' : 'light';
    localStorage.setItem(key, val);
    localStorage.setItem('theme', val);

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  const [localDark, setLocalDark] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark' || localStorage.getItem('theme') === 'dark';
  });

  if (!context) {
    return {
      isDarkMode: localDark,
      toggleTheme: () => {
        setLocalDark((prev) => {
          const next = !prev;
          if (next) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
          }
          return next;
        });
      },
      setTheme: (t) => {
        const next = t === 'dark';
        setLocalDark(next);
        if (next) {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
        }
      }
    };
  }
  return context;
};
