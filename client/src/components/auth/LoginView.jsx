import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  MapPin,
  Phone
} from 'lucide-react';

export const LoginView = () => {
  const { login } = useAuth();
  const { colors, mode, toggleMode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      setErrorMessage('Network error: Unable to reach authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-150 relative overflow-hidden"
      style={{
        backgroundColor: colors.bgMain,
        color: colors.textPrimary
      }}
    >
      {/* Subtle Background Accent Glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: mode === 'dark' ? '#2563EB' : '#93C5FD'
        }}
      />

      {/* Main Login Card */}
      <div
        className="w-full max-w-md rounded-xl border shadow-xl transition-all duration-150 relative z-10 overflow-hidden"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        {/* Card Header & Theme Switcher */}
        <div
          className="p-5 sm:p-6 border-b flex items-start justify-between gap-3"
          style={{
            backgroundColor: mode === 'dark' ? '#10233D' : '#142B4A',
            borderColor: colors.border
          }}
        >
          <div className="flex items-center gap-3">
            {/* Martial Arts Academy Crest */}
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-xs flex-shrink-0">
              🥋
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] sm:text-[16px] font-bold tracking-tight text-white">
                  AL MURTAZA SHAH
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30 font-mono-numbers">
                  PTF / KPK
                </span>
              </div>
              <p className="text-[12px] font-medium text-blue-200">
                Taekwondo Academy Management System
              </p>
            </div>
          </div>

          {/* Quick Dark/Light Theme Toggle */}
          <button
            onClick={toggleMode}
            type="button"
            className="p-1.5 rounded-lg border border-white/20 transition hover:bg-white/10 active:scale-95 flex-shrink-0 text-white cursor-pointer"
            title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-200" />}
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-[18px] sm:text-[19px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Administrator Portal Sign In
            </h2>
            <p className="text-[13px] font-normal mt-0.5 text-slate-600 dark:text-slate-400">
              Enter authorized administrator credentials to manage academy operations.
            </p>
          </div>

          {/* Error Alert Banner */}
          {errorMessage && (
            <div
              className="p-3 rounded-lg border flex items-center gap-2.5 text-[12px] font-medium animate-in fade-in duration-150"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.10)',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                color: '#DC2626'
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label
                className="block text-[12.5px] font-medium mb-1.5"
                style={{ color: colors.textSecondary }}
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: colors.textMuted }}
                />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@almurtazatkd.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border text-[13.5px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-[12.5px] font-medium mb-1.5"
                style={{ color: colors.textSecondary }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: colors.textMuted }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-lg border text-[12.5px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition font-mono-numbers"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:opacity-80 transition"
                  style={{ color: colors.textMuted }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-xs transition hover:opacity-95 active:scale-98 disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Academy Location & Security Footer */}
          <div
            className="pt-3 border-t text-[11px] space-y-1 text-center"
            style={{
              borderColor: colors.border,
              color: colors.textMuted
            }}
          >
            <div className="flex items-center justify-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
              <span>Abdur Rehman Plaza, Chogi No. 7, Kohat</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-amber-500 font-mono-numbers">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>Contact: 0335-9117230</span>
            </div>
            <p className="text-[10px] pt-1 opacity-75">
              Strictly restricted to authorized academy personnel. Public registration is closed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
