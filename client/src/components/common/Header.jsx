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
  Settings
} from 'lucide-react';

export const Header = ({ onNavigate, activeTab }) => {
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
      className="backdrop-blur-md border-b sticky top-0 z-40 px-4 lg:px-8 py-3 no-print transition-colors duration-200"
      style={{
        backgroundColor: mode === 'dark' ? 'rgba(11, 39, 33, 0.92)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: colors.border
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Location Info */}
        <div className="flex items-center gap-4">
          <div
            className="relative flex items-center justify-center w-12 h-12 rounded-xl p-0.5 shadow-lg"
            style={{
              background: theme === 'emerald'
                ? 'linear-gradient(135deg, #10B981, #059669, #047857)'
                : 'linear-gradient(135deg, #1D4ED8, #2563EB, #3B82F6)'
            }}
          >
            <div
              className="w-full h-full rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: colors.bgCard }}
            >
              <span className="text-2xl select-none">🥋</span>
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.bgSidebar
              }}
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-bold tracking-tight flex items-center gap-2"
                style={{ color: colors.textPrimary }}
              >
                AL MURTAZA SHAH TAEKWONDO
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  KPK / PTF Affiliated
                </span>
              </h1>
            </div>
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-0.5"
              style={{ color: colors.textSecondary }}
            >
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Phone className="w-3.5 h-3.5" />
                0335-9117230
              </span>
              <span className="hidden lg:flex items-center gap-1" style={{ color: colors.primary }}>
                <Shield className="w-3.5 h-3.5" />
                President KPK TKD: Murtaza Hassan Bangash
              </span>
            </div>
          </div>
        </div>

        {/* Live Clock, Theme Controls & Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-end md:self-center">
          {/* Live Clock */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textSecondary
            }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: colors.primary }} />
            <span className="font-mono font-medium" style={{ color: colors.textPrimary }}>
              {time.toLocaleTimeString()}
            </span>
            <span className="opacity-40">|</span>
            <span>{time.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Quick Theme Controls */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleMode}
              className="p-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: colors.bgCard,
                color: mode === 'dark' ? '#FBBF24' : '#1E293B',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark/light mode"
            >
              {mode === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Palette Toggle (Emerald <-> Royal Blue) */}
            <button
              onClick={handleToggleThemePalette}
              className="p-1.5 rounded-lg transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: colors.bgCard,
                color: colors.primary,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              title={`Switch to ${theme === 'emerald' ? 'Royal Blue' : 'Emerald Green'} Theme`}
              aria-label="Switch Theme Palette"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold hidden xl:inline">
                {theme === 'emerald' ? 'Emerald' : 'Royal'}
              </span>
            </button>

            {/* Direct Theme Settings Button */}
            <button
              onClick={() => onNavigate('settings')}
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${
                activeTab === 'settings' ? 'ring-1' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'settings' ? colors.primary : colors.bgCard,
                color: activeTab === 'settings' ? '#FFFFFF' : colors.textSecondary,
                borderColor: colors.border
              }}
              title="Open Theme & Appearance Settings"
              aria-label="Theme Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('terminal')}
              className="px-2.5 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#4F46E5' }}
              title="Open Smart Face & Fingerprint Terminal"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terminal</span>
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="px-2.5 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: colors.primary }}
              title="Collect Fee & Print Receipt"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fee Desk</span>
            </button>
            <button
              onClick={() => onNavigate('admission')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              title="New Student Digital Admission"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Admission</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
