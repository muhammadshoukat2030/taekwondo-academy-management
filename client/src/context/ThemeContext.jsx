import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_PALETTES = {
  posNavy: {
    id: 'posNavy',
    name: 'POS Modern Navy',
    subtitle: 'Professional Navy Blue sidebar with clean white workspace and Royal Blue accents',
    light: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      secondaryAccent: '#3B82F6',
      bgMain: '#F4F6FA',
      bgWorkspace: '#F4F6FA',
      bgSidebar: '#142B4A',
      bgSidebarSecondary: '#1B385E',
      sidebarText: '#FFFFFF',
      sidebarTextMuted: '#94A3B8',
      sidebarActiveBg: '#2563EB',
      sidebarActiveText: '#FFFFFF',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#F8FAFC',
      bgSecondary: '#F4F6FA',
      textHeading: '#111827',
      textPrimary: '#1F2937',
      textSecondary: '#475569',
      textMuted: '#64748B',
      textSoft: '#64748B',
      border: '#E2E8F0',
      borderSubtle: '#F1F5F9',
      success: '#15803D',
      warning: '#B45309',
      danger: '#DC2626',
      glow: 'rgba(37, 99, 235, 0.12)',
      chartGrid: '#E2E8F0',
      chartTick: '#475569',
      inputBg: '#FFFFFF',
      inputBorder: '#E2E8F0',
      badgeBg: '#EFF6FF',
      badgeText: '#1D4ED8',
      accentGradient: 'from-blue-600 to-indigo-700',
    },
    dark: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      secondaryAccent: '#60A5FA',
      bgMain: '#0F172A',
      bgWorkspace: '#0F172A',
      bgSidebar: '#10233D',
      bgSidebarSecondary: '#1B385E',
      sidebarText: '#F8FAFC',
      sidebarTextMuted: '#94A3B8',
      sidebarActiveBg: '#3B82F6',
      sidebarActiveText: '#FFFFFF',
      bgCard: '#172033',
      bgCardSubtle: '#1E2D43',
      bgSecondary: '#1E2D43',
      textHeading: '#F8FAFC',
      textPrimary: '#E2E8F0',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
      textSoft: '#94A3B8',
      border: '#334155',
      borderSubtle: '#1E2D43',
      success: '#4ADE80',
      warning: '#FBBF24',
      danger: '#F87171',
      glow: 'rgba(59, 130, 246, 0.20)',
      chartGrid: '#334155',
      chartTick: '#CBD5E1',
      inputBg: '#172033',
      inputBorder: '#334155',
      badgeBg: 'rgba(59, 130, 246, 0.20)',
      badgeText: '#BFDBFE',
      accentGradient: 'from-blue-500 to-indigo-600',
    }
  }
};

// Aliases for backwards compatibility
THEME_PALETTES.blackPurple = THEME_PALETTES.posNavy;
THEME_PALETTES.emerald = THEME_PALETTES.posNavy;
THEME_PALETTES.royal = THEME_PALETTES.posNavy;

const STORAGE_KEY = 'ams_taekwondo_pos_theme_v6';
const DEFAULT_THEME = 'posNavy';
const DEFAULT_MODE = 'light';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

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

  const activePalette = THEME_PALETTES.posNavy;
  const colors = activePalette[mode] || activePalette.light;

  // Sync to HTML document attributes & localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: DEFAULT_THEME, mode }));
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', 'posNavy');
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
  }, [mode, colors]);

  const setTheme = () => {
    setThemeState(DEFAULT_THEME);
  };

  const setMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setModeState(newMode);
    }
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeAndMode = (_, newMode) => {
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
