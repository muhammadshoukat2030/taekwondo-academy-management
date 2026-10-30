import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_PALETTES = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    subtitle: 'Elegant, fresh, modern martial arts aesthetic',
    dark: {
      primary: '#10B981',
      primaryHover: '#059669',
      bgMain: '#071C18',
      bgSidebar: '#0B2721',
      bgCard: '#123D32',
      bgCardSubtle: '#0E3027',
      bgSecondary: '#102C25',
      textPrimary: '#F0FDF4',
      textSecondary: '#A7C4B8',
      textMuted: '#6B9080',
      border: '#245044',
      borderSubtle: '#1A3C33',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      glow: 'rgba(16, 185, 129, 0.25)',
      chartGrid: '#1B4137',
      inputBg: '#09211C',
      inputBorder: '#245044',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeText: '#34D399',
      accentGradient: 'from-emerald-500 to-teal-600',
    },
    light: {
      primary: '#10B981',
      primaryHover: '#059669',
      bgMain: '#F2FBF6',
      bgSidebar: '#FFFFFF',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#F6FDF9',
      bgSecondary: '#E6F7F0',
      textPrimary: '#064E3B',
      textSecondary: '#2D6A55',
      textMuted: '#528B75',
      border: '#D1FAE5',
      borderSubtle: '#E2E8F0',
      success: '#10B981',
      warning: '#D97706',
      danger: '#EF4444',
      glow: 'rgba(16, 185, 129, 0.15)',
      chartGrid: '#E2E8F0',
      inputBg: '#FFFFFF',
      inputBorder: '#D1FAE5',
      badgeBg: '#D1FAE5',
      badgeText: '#065F46',
      accentGradient: 'from-emerald-500 to-teal-600',
    }
  },
  royal: {
    id: 'royal',
    name: 'White + Royal Blue',
    subtitle: 'Clean, professional, modern premium SaaS dashboard',
    light: {
      primary: '#1D4ED8',
      primaryHover: '#1E40AF',
      bgMain: '#F8FAFC',
      bgSidebar: '#FFFFFF',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#F1F5F9',
      bgSecondary: '#EFF4FF',
      textPrimary: '#172554',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      border: '#E2E8F0',
      borderSubtle: '#CBD5E1',
      success: '#16A34A',
      warning: '#F59E0B',
      danger: '#DC2626',
      glow: 'rgba(29, 78, 216, 0.15)',
      chartGrid: '#E2E8F0',
      inputBg: '#FFFFFF',
      inputBorder: '#E2E8F0',
      badgeBg: '#DBEAFE',
      badgeText: '#1E40AF',
      accentGradient: 'from-blue-600 to-indigo-700',
    },
    dark: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      bgMain: '#0A1128',
      bgSidebar: '#0F1A3A',
      bgCard: '#162248',
      bgCardSubtle: '#111B3C',
      bgSecondary: '#131D3F',
      textPrimary: '#EFF6FF',
      textSecondary: '#93C5FD',
      textMuted: '#6B8CC7',
      border: '#1E3A8A',
      borderSubtle: '#233876',
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      glow: 'rgba(37, 99, 235, 0.25)',
      chartGrid: '#1E3A8A',
      inputBg: '#0D1734',
      inputBorder: '#1E3A8A',
      badgeBg: 'rgba(37, 99, 235, 0.2)',
      badgeText: '#93C5FD',
      accentGradient: 'from-blue-500 to-indigo-600',
    }
  }
};

const STORAGE_KEY = 'ams_taekwondo_theme_prefs_v2';
const DEFAULT_THEME = 'emerald';
const DEFAULT_MODE = 'dark';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme === 'royal' || parsed.theme === 'emerald') {
          return parsed.theme;
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_THEME;
  });

  const [mode, setModeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode === 'light' || parsed.mode === 'dark') {
          return parsed.mode;
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_MODE;
  });

  // Current palette colors
  const activePalette = THEME_PALETTES[theme] || THEME_PALETTES.emerald;
  const colors = activePalette[mode] || activePalette.dark;

  // Sync to HTML document attributes & localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, mode }));
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);

    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Set body inline styles for immediate flicker-free rendering
    document.body.style.backgroundColor = colors.bgMain;
    document.body.style.color = colors.textPrimary;
  }, [theme, mode, colors]);

  const setTheme = (newTheme) => {
    if (newTheme === 'emerald' || newTheme === 'royal') {
      setThemeState(newTheme);
    }
  };

  const setMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setModeState(newMode);
    }
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeAndMode = (newTheme, newMode) => {
    if (newTheme) setTheme(newTheme);
    if (newMode) setMode(newMode);
  };

  const resetDefaults = () => {
    setThemeState(DEFAULT_THEME);
    setModeState(DEFAULT_MODE);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        isDark: mode === 'dark',
        setTheme,
        setMode,
        toggleMode,
        setThemeAndMode,
        resetDefaults,
        colors,
        palettes: THEME_PALETTES
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
