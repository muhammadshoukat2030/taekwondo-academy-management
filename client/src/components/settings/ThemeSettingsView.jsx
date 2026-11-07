import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Sun,
  Moon,
  Check,
  RotateCcw,
  CheckCircle2,
  Palette,
  Eye,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';

export const ThemeSettingsView = () => {
  const {
    mode,
    isDark,
    setMode,
    resetDefaults,
    colors
  } = useTheme();

  const [savedNotification, setSavedNotification] = useState('');

  const triggerSavedNotice = (msg) => {
    setSavedNotification(msg);
    setTimeout(() => setSavedNotification(''), 2200);
  };

  const handleSelectMode = (newMode) => {
    setMode(newMode);
    triggerSavedNotice(`Switched to ${newMode === 'light' ? 'Light Mode (POS Modern Navy)' : 'Dark Mode (POS Midnight Slate)'}!`);
  };

  const handleReset = () => {
    resetDefaults();
    triggerSavedNotice('Reset to default Light Mode (POS Modern Navy)!');
  };

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
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold mb-1.5 border"
              style={{
                backgroundColor: colors.badgeBg,
                color: colors.primary,
                borderColor: colors.border
              }}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme & Appearance Studio</span>
            </div>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight" style={{ color: colors.textHeading }}>
              Display & Appearance Settings
            </h1>
            <p className="text-[13.5px] font-normal mt-0.5 max-w-xl leading-relaxed" style={{ color: colors.textSecondary }}>
              Switch between <strong style={{ color: colors.primary }}>Light Mode</strong> (Default: Professional Navy Blue sidebar, clean pure white workspace & Royal Blue actions) and{' '}
              <strong style={{ color: colors.primary }}>Dark Mode</strong> (Deep midnight navy & charcoal surfaces with high contrast).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 border transition-all shadow-xs hover:opacity-80 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: colors.bgSecondary,
                color: colors.textPrimary,
                borderColor: colors.border
              }}
              title="Reset to default (Light Mode)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Restore Default</span>
            </button>
          </div>
        </div>

        {/* Saved Toast Banner */}
        {savedNotification && (
          <div
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md animate-fade-in bg-blue-600 text-white"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{savedNotification}</span>
          </div>
        )}
      </div>

      {/* ONLY TWO OPTIONS: LIGHT MODE & DARK MODE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textHeading }}>
            Select Display Mode
          </h2>
          <span className="text-xs font-mono" style={{ color: colors.textSecondary }}>
            Active: <strong style={{ color: colors.primary }}>{mode === 'light' ? 'Light Mode (POS Modern Navy)' : 'Dark Mode (Midnight Slate)'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OPTION 1: LIGHT MODE - POS MODERN NAVY (DEFAULT) */}
          <div
            onClick={() => handleSelectMode('light')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-150 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
              mode === 'light' ? 'ring-2 ring-blue-500' : 'hover:scale-[1.01]'
            }`}
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: mode === 'light' ? '#2563EB' : '#E2E8F0',
              boxShadow: mode === 'light' ? '0 0 20px rgba(37, 99, 235, 0.18)' : undefined
            }}
          >
            <div>
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#142B4A] flex items-center justify-center text-white shadow-xs">
                    <Sun className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Light Mode
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      POS Modern Navy sidebar & clean workspace
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    mode === 'light'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border-2 border-slate-300'
                  }`}
                >
                  {mode === 'light' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="grid grid-cols-4 gap-2 my-4">
                <div className="p-2 rounded-lg bg-[#142B4A] border border-[#1B385E] text-center">
                  <span className="text-[9.5px] font-mono font-bold text-white block">#142B4A</span>
                  <span className="text-[9px] text-blue-200">Sidebar</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-center">
                  <span className="text-[9.5px] font-mono font-bold text-slate-900 block">#FFFFFF</span>
                  <span className="text-[9px] text-slate-500">Cards</span>
                </div>
                <div className="p-2 rounded-lg bg-[#2563EB] text-center">
                  <span className="text-[9.5px] font-mono font-bold text-white block">#2563EB</span>
                  <span className="text-[9px] text-blue-100">Primary</span>
                </div>
                <div className="p-2 rounded-lg bg-[#15803D] text-center">
                  <span className="text-[9.5px] font-mono font-bold text-white block">#15803D</span>
                  <span className="text-[9px] text-emerald-100">Success</span>
                </div>
              </div>

              {/* Live Preview Mini Mockup */}
              <div className="p-3 rounded-lg bg-[#F5F7FB] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="font-semibold text-slate-800">Fee Desk POS Preview</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">PKR 1,500</span>
                </div>
                <div className="flex gap-1.5">
                  <button className="flex-1 py-1 rounded text-[11px] font-semibold bg-blue-600 text-white shadow-xs">
                    Primary Action
                  </button>
                  <button className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600 text-white">
                    Paid
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11.5px] text-slate-600 font-medium">
              <span>Standard Academy POS theme</span>
              <span className="text-blue-600 font-semibold">{mode === 'light' ? 'Currently Active' : 'Click to Select'}</span>
            </div>
          </div>

          {/* OPTION 2: DARK MODE - POS MIDNIGHT SLATE */}
          <div
            onClick={() => handleSelectMode('dark')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-150 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
              mode === 'dark' ? 'ring-2 ring-blue-400' : 'hover:scale-[1.01]'
            }`}
            style={{
              backgroundColor: '#182438',
              borderColor: mode === 'dark' ? '#3B82F6' : '#2B3B52',
              boxShadow: mode === 'dark' ? '0 0 20px rgba(59, 130, 246, 0.22)' : undefined
            }}
          >
            <div>
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10233D] border border-[#2B3B52] flex items-center justify-center text-blue-400 shadow-inner">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">
                        Dark Mode
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-900/40 text-blue-300 border border-blue-700/50">
                        Night Shift
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Midnight Navy & Slate with high contrast
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    mode === 'dark'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'border-2 border-slate-600'
                  }`}
                >
                  {mode === 'dark' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="grid grid-cols-4 gap-2 my-4">
                <div className="p-2 rounded-lg bg-[#10233D] border border-[#2B3B52] text-center">
                  <span className="text-[9.5px] font-mono font-bold text-slate-200 block">#10233D</span>
                  <span className="text-[9px] text-slate-400">Sidebar</span>
                </div>
                <div className="p-2 rounded-lg bg-[#182438] border border-[#2B3B52] text-center">
                  <span className="text-[9.5px] font-mono font-bold text-slate-200 block">#182438</span>
                  <span className="text-[9px] text-slate-400">Cards</span>
                </div>
                <div className="p-2 rounded-lg bg-[#3B82F6] text-center">
                  <span className="text-[9.5px] font-mono font-bold text-white block">#3B82F6</span>
                  <span className="text-[9px] text-blue-100">Primary</span>
                </div>
                <div className="p-2 rounded-lg bg-[#4ADE80] text-center">
                  <span className="text-[9.5px] font-mono font-bold text-slate-900 block">#4ADE80</span>
                  <span className="text-[9px] text-emerald-950 font-bold">Success</span>
                </div>
              </div>

              {/* Live Preview Mini Mockup */}
              <div className="p-3 rounded-lg bg-[#101827] border border-[#2B3B52] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="font-semibold text-slate-200">Terminal Scanner Preview</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Active</span>
                </div>
                <div className="flex gap-1.5">
                  <button className="flex-1 py-1 rounded text-[11px] font-semibold bg-blue-600 text-white shadow-xs">
                    Primary Action
                  </button>
                  <button className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600 text-white">
                    Present
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2B3B52] flex items-center justify-between text-[11.5px] text-slate-400 font-medium">
              <span>Deep night eye comfort</span>
              <span className="text-blue-400 font-semibold">{mode === 'dark' ? 'Currently Active' : 'Click to Select'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsView;
