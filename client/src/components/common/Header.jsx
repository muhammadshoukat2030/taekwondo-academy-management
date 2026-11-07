import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAcademy } from '../../context/AcademyContext.jsx';
import {
  Clock,
  UserPlus,
  CreditCard,
  Camera,
  Sun,
  Moon,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Search,
  Bell,
  LogOut
} from 'lucide-react';

export const Header = ({
  onNavigate,
  activeTab,
  sidebarCollapsed = false,
  onToggleSidebar,
  mobileMenuOpen = false,
  onToggleMobileMenu,
  defaulterCount = 0
}) => {
  const [time, setTime] = useState(new Date());
  const [headerSearch, setHeaderSearch] = useState('');
  const { mode, toggleMode, colors } = useTheme();
  const { admin, logout } = useAuth();
  const { settings } = useAcademy();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('students');
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to log out of the Administrator Portal?')) {
      logout();
    }
  };

  const headerBg = colors.bgCard;
  const headerBorder = colors.border;

  return (
    <header
      className="border-b sticky top-0 z-20 px-3.5 sm:px-5 py-2.5 no-print transition-colors duration-150 flex-shrink-0"
      style={{
        backgroundColor: headerBg,
        borderColor: headerBorder
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Sidebar Toggle, Title & Search */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Desktop Sidebar Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg border transition duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            style={{
              borderColor: headerBorder,
              color: colors.textPrimary
            }}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            )}
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="flex md:hidden items-center justify-center p-1.5 rounded-lg border transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            style={{
              borderColor: headerBorder,
              color: colors.textPrimary
            }}
            title={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-blue-600" />
            ) : (
              <Menu className="w-4 h-4 text-blue-600" />
            )}
          </button>

          {/* Academy Brand Title */}
          <div className="min-w-0 flex items-center gap-2.5">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain border p-0.5 flex-shrink-0"
                style={{ borderColor: headerBorder }}
              />
            ) : (
              <span className="hidden sm:inline text-lg flex-shrink-0">🥋</span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-[14px] sm:text-[15px] font-bold tracking-tight truncate"
                  style={{ color: colors.textHeading }}
                >
                  {settings?.academyName || 'Al Murtaza Shah Taekwondo Academy'}
                </span>
                {settings?.recognition && (
                  <span className="hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 uppercase tracking-wider">
                    {settings.recognition}
                  </span>
                )}
              </div>
              <p
                className="hidden xl:block text-[11.5px] font-normal truncate"
                style={{ color: colors.textSecondary }}
              >
                {settings?.address || 'Abdur Rehman Plaza, Chogi No.7, Kohat'} • {settings?.phone || '0335-9117230'}
              </p>
            </div>
          </div>

          {/* POS Quick Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center ml-2 relative w-60"
          >
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or receipt..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-[12.5px] font-normal focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              style={{
                backgroundColor: colors.inputBg,
                borderColor: headerBorder,
                color: colors.textPrimary
              }}
            />
          </form>
        </div>

        {/* Right Side: Quick Action Buttons, Notifications, Theme & Profile Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Live Clock Pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs bg-slate-100 dark:bg-slate-900"
            style={{ borderColor: headerBorder }}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono-numbers font-semibold text-[13px] text-slate-900 dark:text-slate-100">
              {time.toLocaleTimeString()}
            </span>
          </div>

          {/* Defaulter Alert Notification Bell */}
          <button
            onClick={() => onNavigate('fees')}
            className="relative p-1.5 rounded-lg border transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            style={{
              borderColor: headerBorder,
              color: defaulterCount > 0 ? '#DC2626' : colors.textSecondary
            }}
            title={defaulterCount > 0 ? `${defaulterCount} Defaulters Pending` : 'All Fees Cleared'}
            aria-label="Defaulters Alert"
          >
            <Bell className="w-4 h-4" />
            {defaulterCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-[16px] rounded-full bg-rose-600 text-white text-[10px] font-bold font-mono-numbers flex items-center justify-center shadow-xs">
                {defaulterCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button (Light/Dark) */}
          <button
            onClick={toggleMode}
            className="p-1.5 rounded-lg border transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            style={{
              borderColor: headerBorder,
              color: mode === 'dark' ? '#FBBF24' : '#0F172A'
            }}
            title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light mode"
          >
            {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>

          {/* Quick Settings Shortcut */}
          <button
            onClick={() => onNavigate('settings')}
            className={`p-1.5 rounded-lg border transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
              activeTab === 'settings' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
            }`}
            style={{ borderColor: headerBorder }}
            title="Theme & System Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('terminal')}
              className="px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Attendance Scanner Terminal"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Terminal</span>
            </button>

            <button
              onClick={() => onNavigate('fees')}
              className="px-2.5 py-1.5 rounded-lg text-white text-[12.5px] font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 transition shadow-xs cursor-pointer"
              title="Collect Fee & Print POS Slip"
            >
              <CreditCard className="w-3.5 h-3.5 text-white" />
              <span className="hidden xs:inline">Fee Desk</span>
            </button>

            <button
              onClick={() => onNavigate('admission')}
              className="px-2.5 py-1.5 rounded-lg text-white text-[12.5px] font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
              title="Register New Student"
            >
              <UserPlus className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">+ Admission</span>
            </button>
          </div>

          {/* Admin Sign Out */}
          <button
            onClick={handleLogoutClick}
            type="button"
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title={`Log Out (${admin?.name || 'Admin'})`}
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
