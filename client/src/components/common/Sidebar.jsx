import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAcademy } from '../../context/AcademyContext.jsx';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  ScanFace,
  Receipt,
  Award,
  CalendarCheck,
  Settings,
  X,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  onNavigate,
  defaulterCount = 0,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { mode, colors } = useTheme();
  const { admin, logout } = useAuth();
  const { settings } = useAcademy();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Administrator Portal?')) {
      logout();
    }
  };

  const adminName = admin?.name || 'Murtaza Bangash';
  const adminInitials = adminName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'MB';

  const navGroups = [
    {
      group: 'Core Management',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'students',
          label: 'All Students',
          icon: Users,
          badge: null
        },
        {
          id: 'admission',
          label: 'New Admission',
          icon: UserPlus,
          badge: null
        }
      ]
    },
    {
      group: 'Operations',
      items: [
        {
          id: 'terminal',
          label: 'Attendance Terminal',
          icon: ScanFace,
          badge: 'Live',
          badgeColor: '#16A34A'
        },
        {
          id: 'fees',
          label: 'Fee Desk & POS',
          icon: Receipt,
          badge: defaulterCount > 0 ? `${defaulterCount} Due` : null,
          badgeColor: '#EF4444'
        },
        {
          id: 'audit',
          label: 'Monthly Audit',
          icon: CalendarCheck,
          badge: null
        }
      ]
    },
    {
      group: 'System & Tools',
      items: [
        {
          id: 'certificates',
          label: 'Certificates',
          icon: Award,
          badge: null
        },
        {
          id: 'settings',
          label: 'Academy Settings',
          icon: Settings,
          badge: null
        }
      ]
    }
  ];

  const sidebarBg = mode === 'dark' ? '#10233D' : '#142B4A';
  const sidebarBorder = mode === 'dark' ? '#1E2D43' : '#1E3A63';

  const renderNavButtons = (collapsed = false) => (
    <div className="space-y-4">
      {navGroups.map((grp) => (
        <div key={grp.group} className="space-y-1">
          {!collapsed && (
            <div className="px-3 py-1 text-[11.5px] font-semibold tracking-wider uppercase text-slate-300 select-none">
              {grp.group}
            </div>
          )}

          {grp.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full text-left rounded-lg transition-all duration-150 flex items-center group relative cursor-pointer ${
                  collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                }`}
                style={{
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: '#FFFFFF'
                }}
              >
                <div className={`flex items-center min-w-0 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <div
                    className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'text-slate-300 group-hover:text-white group-hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-white" />
                  </div>

                  {!collapsed && (
                    <span
                      className="text-[13.5px] leading-tight truncate text-white group-hover:text-white"
                      style={{
                        fontWeight: isActive ? 600 : 400
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md text-[12px] font-semibold shadow-xl hidden group-hover:flex items-center gap-1.5 z-50 pointer-events-none whitespace-nowrap bg-slate-900 text-white border border-slate-700">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.2 rounded font-mono-numbers text-white"
                        style={{ backgroundColor: item.badgeColor || '#2563EB' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Counter / Live Badge */}
                {!collapsed && item.badge && (
                  <span
                    className="text-[10.5px] font-bold px-2 py-0.5 rounded-md font-mono-numbers tracking-tight text-white shadow-xs"
                    style={{
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : (item.badgeColor || '#2563EB')
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* =========================================================
          DESKTOP FIXED FULL-HEIGHT SIDEBAR
          Occupies full viewport height (h-screen)
          Internal menu scrolls independently
          Stays fixed in place while content scrolls
          ========================================================= */}
      <aside
        className={`hidden md:flex flex-col h-screen flex-shrink-0 border-r select-none transition-all duration-200 z-30 ${
          isCollapsed ? 'w-[68px]' : 'w-60'
        }`}
        style={{
          backgroundColor: sidebarBg,
          borderColor: sidebarBorder
        }}
      >
        {/* Academy Brand Identity */}
        <div
          className={`p-3.5 border-b flex-shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}
          style={{ borderColor: sidebarBorder }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20 flex-shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                🥋
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-white tracking-tight truncate uppercase">
                  {settings?.shortName || 'AL MURTAZA SHAH'}
                </div>
                <div className="text-[11px] text-blue-200 font-medium tracking-wide truncate">
                  {settings?.subtitle || 'TAEKWONDO POS & ERP'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Body (Scrolls independently if menu height exceeds viewport) */}
        <div className="flex-1 p-2.5 overflow-y-auto space-y-4 min-h-0">
          {renderNavButtons(isCollapsed)}
        </div>

        {/* Administrator Profile Card (Pinned at bottom of fixed sidebar) */}
        <div
          className="p-2.5 border-t flex-shrink-0"
          style={{ borderColor: sidebarBorder }}
        >
          {!isCollapsed ? (
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-blue-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {adminInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-white truncate">
                    {adminName}
                  </div>
                  <div className="text-[11px] text-slate-300 font-normal truncate flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                    <span>Administrator</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-md bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 flex items-center justify-center transition border border-white/10 cursor-pointer"
                title={`Log out (${adminName})`}
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================
          MOBILE SLIDE-IN DRAWER
          Full height drawer with visible close button & backdrop
          ========================================================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer container */}
          <div
            className="relative flex-1 flex flex-col max-w-xs w-full h-full shadow-2xl z-10"
            style={{
              backgroundColor: sidebarBg,
              borderColor: sidebarBorder
            }}
          >
            {/* Drawer Header with Close Button */}
            <div
              className="p-3.5 border-b flex-shrink-0 flex items-center justify-between"
              style={{ borderColor: sidebarBorder }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {settings?.logo ? (
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20 flex-shrink-0 shadow-sm"
                  />
                ) : (
                  <span className="text-xl">🥋</span>
                )}
                <div className="min-w-0">
                  <h2 className="text-[13px] font-bold text-white tracking-tight truncate uppercase">
                    {settings?.shortName || 'AL MURTAZA SHAH'}
                  </h2>
                  <p className="text-[10.5px] text-blue-200 font-semibold truncate">
                    {settings?.subtitle || 'Taekwondo POS & ERP'}
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-white hover:bg-white/10 border border-white/20 transition cursor-pointer"
                title="Close Menu"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 p-3 overflow-y-auto min-h-0">
              {renderNavButtons(false)}
            </div>

            {/* Drawer Bottom Profile */}
            <div
              className="p-3 border-t flex-shrink-0"
              style={{ borderColor: sidebarBorder }}
            >
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-blue-500 text-white font-bold text-xs flex items-center justify-center">
                    {adminInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{adminName}</p>
                    <p className="text-[11px] text-slate-300 font-medium">Head Administrator</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
