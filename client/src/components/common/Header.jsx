import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  MapPin,
  Phone,
  Clock,
  Shield,
  UserPlus,
  CreditCard,
  Camera,
  Sun,
  Moon,
  Palette,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X
} from 'lucide-react';

export const Header = ({
  onNavigate,
  activeTab,
  sidebarCollapsed = false,
  onToggleSidebar,
  mobileMenuOpen = false,
  onToggleMobileMenu
}) => {
  const [time, setTime] = useState(new Date());
  const { theme, mode, toggleMode, setTheme, isDark, colors } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleThemePalette = () => {
    setTheme(theme === 'emerald' ? 'royal' : 'emerald');
  };

  return (
    <header
      className="backdrop-blur-md border-b sticky top-0 z-40 px-3 sm:px-4 lg:px-6 py-2.5 no-print transition-colors duration-200"
      style={{
        backgroundColor: colors.bgSidebar,
        borderColor: colors.border
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        {/* Brand, Sidebar Toggle & Academy Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Desktop Sidebar Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg border transition-all duration-150 hover:scale-105 active:scale-95 flex-shrink-0"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textPrimary
            }}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar to Icons'}
            aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" style={{ color: colors.primary }} />
            ) : (
              <PanelLeftClose className="w-4 h-4" style={{ color: colors.textSecondary }} />
            )}
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="flex md:hidden items-center justify-center p-1.5 rounded-lg border transition-all active:scale-95 flex-shrink-0"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textPrimary
            }}
            title={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" style={{ color: colors.primary }} />
            ) : (
              <Menu className="w-4 h-4" style={{ color: colors.primary }} />
            )}
          </button>

          {/* Brand Icon */}
          <div
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg p-0.5 shadow-sm flex-shrink-0"
            style={{
              background: theme === 'emerald'
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #1D4ED8, #2563EB)'
            }}
          >
            <div
              className="w-full h-full rounded-[6px] flex items-center justify-center"
              style={{ backgroundColor: colors.bgCard }}
            >
              <span className="text-lg sm:text-xl select-none leading-none">🥋</span>
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex items-center justify-center"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.bgSidebar
              }}
            >
              <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1
                className="text-xs sm:text-base lg:text-lg font-bold tracking-tight truncate flex items-center gap-1.5"
                style={{ color: colors.textPrimary }}
              >
                <span>AL MURTAZA SHAH TAEKWONDO</span>
                <span
                  className="hidden xs:inline-block text-[9.5px] font-semibold px-1.5 py-0.2 rounded-md border"
                  style={{
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  PTF / KPK
                </span>
              </h1>
            </div>
            <div
              className="hidden sm:flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] mt-0.5"
              style={{ color: colors.textSecondary }}
            >
              <span className="flex items-center gap-1 truncate max-w-[240px] md:max-w-none">
                <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                Abdur Rehman Plaza, Chogi No.7, Kohat
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Phone className="w-3 h-3 flex-shrink-0" />
                0335-9117230
              </span>
              <span className="hidden xl:flex items-center gap-1 font-medium" style={{ color: colors.primary }}>
                <Shield className="w-3 h-3 flex-shrink-0" />
                Murtaza Hassan Bangash (President KPK TKD)
              </span>
            </div>
          </div>
        </div>

        {/* Live Clock, Theme Controls & Quick Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Live Clock (tablet+) */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textSecondary
            }}
          >
            <Clock className="w-3 h-3" style={{ color: colors.primary }} />
            <span className="font-mono font-medium text-[10.5px]" style={{ color: colors.textPrimary }}>
              {time.toLocaleTimeString()}
            </span>
          </div>

          {/* Quick Theme Controls */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleMode}
              className="p-1 rounded-md transition hover:scale-105 active:scale-95"
              style={{
                backgroundColor: colors.bgCard,
                color: mode === 'dark' ? '#FBBF24' : '#1E293B'
              }}
              title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark/light mode"
            >
              {mode === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Palette Toggle (Emerald <-> Royal Blue) */}
            <button
              onClick={handleToggleThemePalette}
              className="px-1.5 py-1 rounded-md transition flex items-center gap-1 hover:scale-105 active:scale-95 text-[10px] font-semibold"
              style={{
                backgroundColor: colors.bgCard,
                color: colors.primary
              }}
              title={`Switch to ${theme === 'emerald' ? 'Royal Blue' : 'Emerald Green'} Theme`}
              aria-label="Switch Theme Palette"
            >
              <Palette className="w-3 h-3" />
              <span className="hidden xl:inline">
                {theme === 'emerald' ? 'Emerald' : 'Royal'}
              </span>
            </button>

            {/* Direct Theme Settings Button */}
            <button
              onClick={() => onNavigate('settings')}
              className="p-1 rounded-md transition hover:scale-105"
              style={{
                backgroundColor: activeTab === 'settings' ? colors.primary : colors.bgCard,
                color: activeTab === 'settings' ? '#FFFFFF' : colors.textSecondary
              }}
              title="Open Theme & Appearance Settings"
              aria-label="Theme Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => onNavigate('terminal')}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textPrimary
              }}
              title="Open Smart Face & Fingerprint Terminal"
            >
              <Camera className="w-3 h-3" style={{ color: colors.primary }} />
              <span className="hidden sm:inline text-[11px]">Terminal</span>
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: colors.primary }}
              title="Collect Fee & Print Receipt"
            >
              <CreditCard className="w-3 h-3" />
              <span className="hidden sm:inline">Fee Desk</span>
            </button>
            <button
              onClick={() => onNavigate('admission')}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
              style={{ backgroundColor: colors.primaryHover || '#059669' }}
              title="New Student Digital Admission"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ Admission</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
