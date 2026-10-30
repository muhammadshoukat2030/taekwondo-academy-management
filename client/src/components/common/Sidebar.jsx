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
  Palette
} from 'lucide-react';

export const Sidebar = ({ activeTab, onNavigate, defaulterCount = 0 }) => {
  const { theme, mode, colors } = useTheme();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Admin Dashboard',
      sublabel: 'KPIs & Visual Analytics',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'audit',
      label: 'End-of-Month Audit',
      sublabel: 'Attendance & Fee Closing',
      icon: CalendarCheck,
      badge: null
    },
    {
      id: 'admission',
      label: 'Digital Admission',
      sublabel: 'Urdu/English Physical Form',
      icon: UserPlus,
      badge: null
    },
    {
      id: 'students',
      label: 'Student 360° Profiles',
      sublabel: 'Master Registry & Ledgers',
      icon: Users,
      badge: null
    },
    {
      id: 'terminal',
      label: 'Smart Terminal',
      sublabel: 'Face AI / Fingerprint / Matrix',
      icon: ScanFace,
      badge: 'Live'
    },
    {
      id: 'fees',
      label: 'Fee & Defaulter Desk',
      sublabel: 'Billing & Dual-Slip Receipt',
      icon: Receipt,
      badge: defaulterCount > 0 ? `${defaulterCount} Dues` : null,
      badgeColor: 'bg-amber-500/20 text-amber-500 border-amber-500/30'
    },
    {
      id: 'certificates',
      label: 'Federation Certificates',
      sublabel: 'KPK / PTF Belt Printing',
      icon: Award,
      badge: null
    },
    {
      id: 'settings',
      label: 'Appearance & Theme',
      sublabel: 'Dual Theme & Dark Mode',
      icon: Palette,
      badge: theme === 'emerald' ? 'Emerald' : 'Royal',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
  ];

  return (
    <aside
      className="w-full md:w-64 border-r flex-shrink-0 flex flex-col justify-between p-3.5 no-print transition-colors duration-200"
      style={{
        backgroundColor: colors.bgSidebar,
        borderColor: colors.border
      }}
    >
      <div className="space-y-1.5">
        <div
          className="px-3 py-2 text-[10px] font-bold tracking-wider uppercase flex items-center justify-between"
          style={{ color: colors.textMuted }}
        >
          <span>Academy Modules</span>
          <span className="text-[9px] font-mono opacity-70">
            {mode === 'dark' ? 'DARK' : 'LIGHT'}
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group relative ${
                isActive
                  ? 'font-semibold shadow-md scale-[1.01]'
                  : 'hover:scale-[1.005]'
              }`}
              style={{
                backgroundColor: isActive ? colors.primary : 'transparent',
                color: isActive ? '#FFFFFF' : colors.textSecondary
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? 'rgba(0, 0, 0, 0.15)'
                      : colors.bgCard,
                    color: isActive ? '#FFFFFF' : colors.primary
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div
                    className="text-xs font-semibold leading-none"
                    style={{
                      color: isActive ? '#FFFFFF' : colors.textPrimary
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-[10px] mt-1 truncate"
                    style={{
                      color: isActive ? 'rgba(255, 255, 255, 0.85)' : colors.textMuted
                    }}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border transition"
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
            </button>
          );
        })}
      </div>

      {/* Academy Credentials / Notice Board */}
      <div
        className="mt-6 p-3.5 rounded-2xl border text-[11px] transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div className="flex items-center gap-1.5 font-bold" style={{ color: colors.warning }}>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Notice Board</span>
        </div>
        <p className="mt-1 leading-relaxed text-[11px]" style={{ color: colors.textSecondary }}>
          KPK Taekwondo Promotion Test scheduled for next month. Ensure all student dues & attendance are closed.
        </p>
        <div
          className="mt-2.5 pt-2 border-t text-[10px] flex items-center justify-between"
          style={{
            borderColor: colors.border,
            color: colors.textMuted
          }}
        >
          <span className="font-semibold">MERN v2.4</span>
          <span className="font-bold" style={{ color: colors.primary }}>
            {theme === 'emerald' ? 'Emerald Theme' : 'Royal Blue'}
          </span>
        </div>
      </div>
    </aside>
  );
};
