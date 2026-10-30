import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  ScanFace,
  Receipt,
  Award,
  CalendarCheck,
  AlertTriangle,
  Palette,
  X
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  onNavigate,
  defaulterCount = 0,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { theme, mode, colors } = useTheme();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      badge: null
    },
    {
      id: 'admission',
      label: 'New Admission',
      icon: UserPlus,
      badge: null
    },
    {
      id: 'terminal',
      label: 'Attendance',
      icon: ScanFace,
      badge: 'Live'
    },
    {
      id: 'fees',
      label: 'Fee Desk',
      icon: Receipt,
      badge: defaulterCount > 0 ? `${defaulterCount} Dues` : null
    },
    {
      id: 'audit',
      label: 'Monthly Audit',
      icon: CalendarCheck,
      badge: null
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: Award,
      badge: null
    },
    {
      id: 'settings',
      label: 'Theme & Settings',
      icon: Palette,
      badge: null
    }
  ];

  const renderNavButtons = (collapsed = false) => (
    <div className="space-y-1">
      {!collapsed && (
        <div
          className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase flex items-center justify-between"
          style={{ color: colors.textMuted }}
        >
          <span>Main Menu</span>
          <span className="text-[9px] font-mono opacity-60">
            {mode === 'dark' ? 'DARK' : 'LIGHT'}
          </span>
        </div>
      )}

      {navItems.map((item) => {
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
            className={`w-full text-left rounded-lg transition-all duration-150 flex items-center group relative ${
              collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            }`}
            style={{
              backgroundColor: isActive ? colors.primary : 'transparent',
              color: isActive ? '#FFFFFF' : colors.textSecondary
            }}
          >
            <div className={`flex items-center min-w-0 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
              <Icon
                className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105"
                style={{
                  color: isActive ? '#FFFFFF' : colors.primary
                }}
              />

              {!collapsed && (
                <span
                  className="text-xs font-semibold leading-tight truncate"
                  style={{
                    color: isActive ? '#FFFFFF' : colors.textPrimary
                  }}
                >
                  {item.label}
                </span>
              )}
            </div>

            {/* Desktop Collapsed Floating Tooltip */}
            {collapsed && (
              <div
                className="absolute left-full ml-2 px-2.5 py-1 rounded-md text-xs font-semibold shadow-lg hidden group-hover:flex items-center gap-1.5 z-50 pointer-events-none whitespace-nowrap border"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className="text-[9px] font-bold px-1 rounded"
                    style={{ backgroundColor: colors.badgeBg, color: colors.primary }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            )}

            {!collapsed && item.badge && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded border ml-1.5 flex-shrink-0"
                style={{
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.2)'
                    : colors.badgeBg,
                  color: isActive ? '#FFFFFF' : colors.primary,
                  borderColor: isActive ? 'rgba(255, 255, 255, 0.3)' : colors.border
                }}
              >
                {item.badge}
              </span>
            )}

            {collapsed && item.badge && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. MOBILE SLIDE-IN DRAWER & BACKDROP */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] flex flex-col justify-between p-3.5 shadow-2xl md:hidden transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: colors.bgSidebar,
          borderColor: colors.border
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🥋</span>
              <div>
                <div className="text-xs font-bold leading-tight" style={{ color: colors.textPrimary }}>
                  Al Murtaza Shah TKD
                </div>
                <div className="text-[10px]" style={{ color: colors.textSecondary }}>
                  Kohat Academy
                </div>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg border transition hover:opacity-80 active:scale-95"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textPrimary
              }}
              aria-label="Close Navigation Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {renderNavButtons(false)}
        </div>

        {/* Mobile Notice Board Footer */}
        <div
          className="mt-4 p-2.5 rounded-xl border text-[10px]"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center gap-1.5 font-bold" style={{ color: colors.warning }}>
            <AlertTriangle className="w-3 h-3" />
            <span>Notice</span>
          </div>
          <p className="mt-1 leading-snug text-[10px]" style={{ color: colors.textSecondary }}>
            KPK Taekwondo Promotion Test scheduled for next month.
          </p>
        </div>
      </aside>

      {/* 2. DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex ${
          isCollapsed ? 'w-16 p-2' : 'w-56 p-2.5'
        } border-r flex-shrink-0 flex-col justify-between no-print transition-all duration-200`}
        style={{
          backgroundColor: colors.bgSidebar,
          borderColor: colors.border
        }}
      >
        <div className="space-y-0.5">
          {renderNavButtons(isCollapsed)}
        </div>

        {/* Desktop Notice Board */}
        {!isCollapsed ? (
          <div
            className="mt-4 p-2.5 rounded-xl border text-[10px] transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center gap-1.5 font-bold" style={{ color: colors.warning }}>
              <AlertTriangle className="w-3 h-3" />
              <span>Academy Notice</span>
            </div>
            <p className="mt-1 leading-snug text-[10px]" style={{ color: colors.textSecondary }}>
              KPK Taekwondo Promotion Test scheduled for next month.
            </p>
            <div
              className="mt-2 pt-1.5 border-t text-[9.5px] flex items-center justify-between"
              style={{
                borderColor: colors.border,
                color: colors.textMuted
              }}
            >
              <span>AMS Taekwondo</span>
              <span className="font-bold" style={{ color: colors.primary }}>
                {theme === 'emerald' ? 'Emerald' : 'Royal'}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="mt-4 p-2 rounded-lg border text-center transition-all cursor-pointer group relative"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
            title="Notice: KPK Taekwondo Promotion Test scheduled for next month."
          >
            <AlertTriangle className="w-3.5 h-3.5 mx-auto" style={{ color: colors.warning }} />
          </div>
        )}
      </aside>
    </>
  );
};
export default Sidebar;