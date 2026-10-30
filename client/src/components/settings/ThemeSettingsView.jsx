import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Palette,
  Sun,
  Moon,
  Check,
  RotateCcw,
  Sparkles,
  Layout,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  Sliders,
  Eye
} from 'lucide-react';

export const ThemeSettingsView = () => {
  const {
    theme,
    mode,
    isDark,
    setTheme,
    setMode,
    toggleMode,
    setThemeAndMode,
    resetDefaults,
    colors,
    palettes
  } = useTheme();

  const [savedNotification, setSavedNotification] = useState(false);

  const triggerSavedNotice = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2400);
  };

  const handleSelectTheme = (newTheme) => {
    setTheme(newTheme);
    triggerSavedNotice();
  };

  const handleSelectMode = (newMode) => {
    setMode(newMode);
    triggerSavedNotice();
  };

  const handleSelectPreset = (pTheme, pMode) => {
    setThemeAndMode(pTheme, pMode);
    triggerSavedNotice();
  };

  const handleReset = () => {
    resetDefaults();
    triggerSavedNotice();
  };

  const presets = [
    {
      id: 'emerald-dark',
      theme: 'emerald',
      mode: 'dark',
      label: 'Emerald Green + Dark',
      sublabel: 'Default Academy Look',
      isDefault: true,
      primaryColor: '#10B981',
      bgColor: '#071C18',
      cardColor: '#123D32',
      textColor: '#F0FDF4',
      borderColor: '#245044'
    },
    {
      id: 'emerald-light',
      theme: 'emerald',
      mode: 'light',
      label: 'Emerald Green + Light',
      sublabel: 'Fresh Mint Morning Style',
      isDefault: false,
      primaryColor: '#10B981',
      bgColor: '#F2FBF6',
      cardColor: '#FFFFFF',
      textColor: '#064E3B',
      borderColor: '#D1FAE5'
    },
    {
      id: 'royal-dark',
      theme: 'royal',
      mode: 'dark',
      label: 'White + Royal Blue + Dark',
      sublabel: 'Midnight Deep Blue SaaS',
      isDefault: false,
      primaryColor: '#2563EB',
      bgColor: '#0A1128',
      cardColor: '#162248',
      textColor: '#EFF6FF',
      borderColor: '#1E3A8A'
    },
    {
      id: 'royal-light',
      theme: 'royal',
      mode: 'light',
      label: 'White + Royal Blue + Light',
      sublabel: 'Clean Modern SaaS Dashboard',
      isDefault: false,
      primaryColor: '#1D4ED8',
      bgColor: '#F8FAFC',
      cardColor: '#FFFFFF',
      textColor: '#172554',
      borderColor: '#E2E8F0'
    }
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-8">
      {/* Top Banner */}
      <div
        className="rounded-xl p-4 lg:p-5 border shadow-sm relative overflow-hidden transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold mb-1.5"
              style={{
                backgroundColor: colors.badgeBg,
                color: colors.primary,
                border: `1px solid ${colors.border}`
              }}
            >
              <Palette className="w-3 h-3" />
              <span>Theme Customization Engine</span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Appearance & Dual Theme Studio
            </h1>
            <p className="text-xs mt-0.5 max-w-xl leading-relaxed" style={{ color: colors.textSecondary }}>
              Switch seamlessly between <strong style={{ color: colors.primary }}>Emerald Green</strong> and{' '}
              <strong style={{ color: '#3B82F6' }}>White + Royal Blue</strong> themes in Dark or Light mode.
              All preferences are synced live across all components and persisted in local storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all shadow-sm hover:scale-102 active:scale-95"
              style={{
                backgroundColor: colors.bgSecondary,
                color: colors.textPrimary,
                borderColor: colors.border
              }}
              title="Reset to factory default (Emerald Green + Dark)"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Default Theme</span>
            </button>
          </div>
        </div>

        {/* Saved Toast Banner */}
        {savedNotification && (
          <div
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md animate-bounce"
            style={{
              backgroundColor: colors.primary,
              color: '#FFFFFF'
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Theme preferences saved!</span>
          </div>
        )}
      </div>

      {/* 4 PRE-CONFIGURED COMBO PRESETS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: colors.textPrimary }}>
              <Layers className="w-3.5 h-3.5" style={{ color: colors.primary }} />
              <span>1-Click Theme & Mode Combinations</span>
            </h2>
            <p className="text-[11px]" style={{ color: colors.textSecondary }}>
              Instantly activate any of the 4 independent theme configurations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const isCurrent = theme === preset.theme && mode === preset.mode;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.theme, preset.mode)}
                className={`group relative p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
                  isCurrent ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: preset.cardColor,
                  borderColor: isCurrent ? preset.primaryColor : preset.borderColor,
                  outlineColor: isCurrent ? preset.primaryColor : 'transparent'
                }}
              >
                {/* Visual miniature preview bar */}
                <div
                  className="w-full h-14 rounded-lg mb-2.5 p-1.5 flex flex-col justify-between overflow-hidden border"
                  style={{
                    backgroundColor: preset.bgColor,
                    borderColor: preset.borderColor
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.primaryColor }}></span>
                      <span className="w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: preset.textColor }}></span>
                    </div>
                    <span
                      className="text-[8.5px] font-bold px-1 py-0.2 rounded uppercase"
                      style={{
                        backgroundColor: preset.primaryColor,
                        color: '#FFFFFF'
                      }}
                    >
                      {preset.mode}
                    </span>
                  </div>

                  {/* Sample mini bar */}
                  <div className="space-y-0.5">
                    <div className="w-2/3 h-1 rounded-full opacity-80" style={{ backgroundColor: preset.textColor }}></div>
                    <div className="w-1/2 h-1 rounded-full opacity-40" style={{ backgroundColor: preset.textColor }}></div>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold leading-tight" style={{ color: preset.textColor }}>
                        {preset.label}
                      </h3>
                      {preset.isDefault && (
                        <span className="text-[8.5px] px-1 py-0.2 rounded-full font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] mt-0.5 opacity-80" style={{ color: preset.textColor }}>
                      {preset.sublabel}
                    </p>
                  </div>

                  {isCurrent ? (
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: preset.primaryColor }}
                    >
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full border border-dashed opacity-40 group-hover:opacity-100 transition flex-shrink-0"
                      style={{ borderColor: preset.textColor }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INDEPENDENT CONTROLS: THEME SELECTOR & DARK/LIGHT MODE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module 1: Color Theme Selector */}
        <div
          className="p-4 lg:p-5 rounded-xl border shadow-sm transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4" style={{ color: colors.primary }} />
            <div>
              <h2 className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                1. Select Primary Color Theme
              </h2>
              <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                Choose the academy brand aesthetic
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Theme 1: Emerald Green */}
            <div
              onClick={() => handleSelectTheme('emerald')}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                theme === 'emerald' ? 'ring-2' : 'hover:scale-[1.01]'
              }`}
              style={{
                backgroundColor: theme === 'emerald' ? colors.bgSecondary : colors.bgCardSubtle,
                borderColor: theme === 'emerald' ? '#10B981' : colors.border
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  🥋
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                      Emerald Green
                    </span>
                    <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Primary
                    </span>
                  </div>
                  <p className="text-[10.5px] mt-0.5" style={{ color: colors.textSecondary }}>
                    Primary: #10B981 | Dark BG: #071C18 | Cards: #123D32
                  </p>
                  {/* Swatches */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#10B981' }} title="Primary #10B981"></span>
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#071C18' }} title="Dark BG #071C18"></span>
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#123D32' }} title="Cards #123D32"></span>
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#F0FDF4' }} title="Text #F0FDF4"></span>
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#245044' }} title="Border #245044"></span>
                  </div>
                </div>
              </div>

              {theme === 'emerald' && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Theme 2: White + Royal Blue */}
            <div
              onClick={() => handleSelectTheme('royal')}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                theme === 'royal' ? 'ring-2' : 'hover:scale-[1.01]'
              }`}
              style={{
                backgroundColor: theme === 'royal' ? colors.bgSecondary : colors.bgCardSubtle,
                borderColor: theme === 'royal' ? '#1D4ED8' : colors.border
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                      White + Royal Blue
                    </span>
                    <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      SaaS Clean
                    </span>
                  </div>
                  <p className="text-[10.5px] mt-0.5" style={{ color: colors.textSecondary }}>
                    Primary: #1D4ED8 | Main BG: #F8FAFC | Cards: #FFFFFF
                  </p>
                  {/* Swatches */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#1D4ED8' }} title="Primary #1D4ED8"></span>
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#F8FAFC' }} title="Light BG #F8FAFC"></span>
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#FFFFFF' }} title="Cards #FFFFFF"></span>
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#172554' }} title="Text #172554"></span>
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: '#E2E8F0' }} title="Border #E2E8F0"></span>
                  </div>
                </div>
              </div>

              {theme === 'royal' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Module 2: Dark vs Light Mode Toggle */}
        <div
          className="p-4 lg:p-5 rounded-xl border shadow-sm transition-all flex flex-col justify-between"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4" style={{ color: colors.primary }} />
              <div>
                <h2 className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                  2. Choose Display Mode
                </h2>
                <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                  Select high-contrast dark or crisp daytime light mode
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Dark Mode Button */}
              <div
                onClick={() => handleSelectMode('dark')}
                className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${
                  mode === 'dark' ? 'ring-2' : 'hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: mode === 'dark' ? colors.bgSecondary : colors.bgCardSubtle,
                  borderColor: mode === 'dark' ? colors.primary : colors.border
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-amber-400 mb-1.5">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                  Dark Mode
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: colors.textSecondary }}>
                  Deep martial arts contrast
                </div>
                {mode === 'dark' && (
                  <div
                    className="inline-block mt-1.5 text-[9.5px] font-bold px-1.5 py-0.2 rounded-full"
                    style={{
                      backgroundColor: colors.badgeBg,
                      color: colors.primary
                    }}
                  >
                    Active
                  </div>
                )}
              </div>

              {/* Light Mode Button */}
              <div
                onClick={() => handleSelectMode('light')}
                className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${
                  mode === 'light' ? 'ring-2' : 'hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: mode === 'light' ? colors.bgSecondary : colors.bgCardSubtle,
                  borderColor: mode === 'light' ? colors.primary : colors.border
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-amber-600 mb-1.5">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                  Light Mode
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: colors.textSecondary }}>
                  Clean daylight readability
                </div>
                {mode === 'light' && (
                  <div
                    className="inline-block mt-1.5 text-[9.5px] font-bold px-1.5 py-0.2 rounded-full"
                    style={{
                      backgroundColor: colors.badgeBg,
                      color: colors.primary
                    }}
                  >
                    Active
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="mt-3 p-2 rounded-lg border text-[11px] flex items-center justify-between"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textSecondary
            }}
          >
            <span>Current Theme State:</span>
            <span className="font-mono font-bold text-xs" style={{ color: colors.primary }}>
              data-theme="{theme}" data-mode="{mode}"
            </span>
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE THEME PREVIEW STAGE */}
      <div
        className="p-4 lg:p-5 rounded-xl border shadow-sm transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: colors.primary }} />
            <div>
              <h2 className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                Live Interactive Dashboard Preview
              </h2>
              <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                Preview how the dashboard cards, navigation, tables, and buttons render in real time
              </p>
            </div>
          </div>

          <span
            className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
            style={{
              backgroundColor: colors.bgSecondary,
              color: colors.primary,
              borderColor: colors.border
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></span>
            Live Reactive
          </span>
        </div>

        {/* Mock Interactive Window */}
        <div
          className="rounded-xl border overflow-hidden shadow-md transition-all"
          style={{
            backgroundColor: colors.bgMain,
            borderColor: colors.border
          }}
        >
          {/* Mock Header */}
          <div
            className="px-3.5 py-2.5 border-b flex items-center justify-between"
            style={{
              backgroundColor: colors.bgSidebar,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm"
                style={{ backgroundColor: colors.primary }}
              >
                🥋
              </div>
              <div>
                <div className="text-xs font-bold leading-none" style={{ color: colors.textPrimary }}>
                  Al Murtaza Shah Taekwondo
                </div>
                <div className="text-[9.5px] mt-0.5" style={{ color: colors.textSecondary }}>
                  Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-2.5 py-1 rounded-md text-[10.5px] font-semibold text-white shadow-sm"
                style={{ backgroundColor: colors.primary }}
              >
                + New Admission
              </button>
            </div>
          </div>

          {/* Mock Main Area */}
          <div className="p-3.5 lg:p-4 space-y-3">
            {/* 3 Mock KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Card 1 */}
              <div
                className="p-2.5 rounded-lg border shadow-sm transition"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-center justify-between text-[11px]" style={{ color: colors.textSecondary }}>
                  <span>Active Students</span>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                </div>
                <div className="text-base font-bold mt-0.5" style={{ color: colors.textPrimary }}>
                  48 <span className="text-[10px] font-normal opacity-70">Enrolled</span>
                </div>
                <div className="text-[9.5px] mt-0.5 text-emerald-500 font-medium">
                  ↑ 96.2% Active Rate
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="p-2.5 rounded-lg border shadow-sm transition"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-center justify-between text-[11px]" style={{ color: colors.textSecondary }}>
                  <span>Today's Attendance</span>
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                </div>
                <div className="text-base font-bold mt-0.5" style={{ color: colors.textPrimary }}>
                  42 <span className="text-[10px] font-normal opacity-70">Present</span>
                </div>
                <div className="text-[9.5px] mt-0.5 text-emerald-500 font-medium">
                  3 Leaves | 3 Absents
                </div>
              </div>

              {/* Card 3 */}
              <div
                className="p-2.5 rounded-lg border shadow-sm transition"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-center justify-between text-[11px]" style={{ color: colors.textSecondary }}>
                  <span>Monthly Collection</span>
                  <Award className="w-3.5 h-3.5" style={{ color: colors.warning }} />
                </div>
                <div className="text-base font-bold mt-0.5" style={{ color: colors.textPrimary }}>
                  PKR 48,000
                </div>
                <div className="text-[9.5px] mt-0.5" style={{ color: colors.textSecondary }}>
                  Pending Dues: PKR 8,500
                </div>
              </div>
            </div>

            {/* Mock Table */}
            <div
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border
              }}
            >
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: colors.bgSecondary,
                      borderColor: colors.border,
                      color: colors.textSecondary
                    }}
                  >
                    <th className="p-2 font-semibold text-[10px]">Roll #</th>
                    <th className="p-2 font-semibold text-[10px]">Student Name</th>
                    <th className="p-2 font-semibold text-[10px]">Current Belt</th>
                    <th className="p-2 font-semibold text-[10px]">Fee Status</th>
                    <th className="p-2 font-semibold text-[10px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: colors.border }}>
                  <tr>
                    <td className="p-2 font-mono font-bold text-[11px]" style={{ color: colors.primary }}>
                      TKD-001
                    </td>
                    <td className="p-2 font-medium text-[11px]" style={{ color: colors.textPrimary }}>
                      Abdul Basit S/O Qari Sabir
                    </td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">
                        Blue Belt
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className="px-1.5 py-0.2 rounded text-[9.5px] font-bold"
                        style={{
                          backgroundColor: colors.badgeBg,
                          color: colors.primary
                        }}
                      >
                        PAID (PKR 1000)
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        className="px-2 py-0.5 rounded text-[10.5px] font-medium border"
                        style={{
                          backgroundColor: colors.bgSecondary,
                          color: colors.textPrimary,
                          borderColor: colors.border
                        }}
                      >
                        View 360°
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-[11px]" style={{ color: colors.primary }}>
                      TKD-002
                    </td>
                    <td className="p-2 font-medium text-[11px]" style={{ color: colors.textPrimary }}>
                      Muhammad Huzaifa S/O Noor Rehman
                    </td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-green-500/20 text-green-500 border border-green-500/30">
                        Green Belt
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-red-500/20 text-red-500">
                        UNPAID (Baqaya PKR 1000)
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        className="px-2 py-0.5 rounded text-[10.5px] font-medium border"
                        style={{
                          backgroundColor: colors.bgSecondary,
                          color: colors.textPrimary,
                          borderColor: colors.border
                        }}
                      >
                        View 360°
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
