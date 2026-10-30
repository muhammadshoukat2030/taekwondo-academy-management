import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EndOfMonthAuditWidget } from './EndOfMonthAuditWidget.jsx';
import {
  Users,
  UserCheck,
  UserX,
  CreditCard,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  CalendarCheck2,
  TrendingUp,
  Award,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardView = ({ onOpenStudent, onNavigate }) => {
  const { colors, theme, mode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardKPIs();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching dashboard KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const beltPalette = {
    White: mode === 'dark' ? '#f8fafc' : '#94a3b8',
    Yellow: '#eab308',
    Green: '#10b981',
    Blue: '#3b82f6',
    Red: '#ef4444',
    Black: mode === 'dark' ? '#0f172a' : '#1e293b'
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Actions */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border shadow-sm transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🥋</span>
            <h1 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Academy Dashboard
            </h1>
          </div>
          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
            Live attendance tracking, monthly fee audits, and belt rankings for Al Murtaza Shah TKD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderColor: colors.border
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: colors.primary }} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => onNavigate('terminal')}
            className="px-3.5 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition hover:opacity-95 active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Open Attendance</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Primary KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* KPI 1: Active Students */}
          <div
            className="p-3.5 rounded-xl border shadow-sm transition-all duration-150 flex flex-col justify-between"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                  Active Students
                </span>
                <div
                  className="p-1.5 rounded-lg border"
                  style={{
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tracking-tight" style={{ color: colors.textPrimary }}>
                  {data.kpis.students.active}
                </span>
                <span className="text-xs font-medium" style={{ color: colors.primary }}>
                  Enrolled
                </span>
              </div>
            </div>

            <div
              className="mt-3 pt-2 border-t flex items-center justify-between text-xs"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                Total: <strong>{data.kpis.students.total}</strong>
              </span>
              <span className="flex items-center gap-1">
                <UserX className="w-3.5 h-3.5 text-rose-500" />
                Inactive: <strong>{data.kpis.students.inactive}</strong>
              </span>
            </div>
          </div>

          {/* KPI 2: Today's Attendance */}
          <div
            className="p-3.5 rounded-xl border shadow-sm transition-all duration-150 flex flex-col justify-between"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                  Today's Attendance
                </span>
                <div
                  className="p-1.5 rounded-lg border"
                  style={{
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  <CalendarCheck2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tracking-tight" style={{ color: colors.primary }}>
                  {data.kpis.todayAttendance.Present}
                </span>
                <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                  Present Today
                </span>
              </div>
            </div>

            <div
              className="mt-3 pt-2 border-t flex items-center justify-between text-xs"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <span className="text-rose-500 font-semibold">
                Absent: {data.kpis.todayAttendance.Absent}
              </span>
              <span className="text-amber-500 font-semibold">
                Leave: {data.kpis.todayAttendance.Leave}
              </span>
              <span className="font-semibold" style={{ color: colors.primary }}>
                Late: {data.kpis.todayAttendance.Late}
              </span>
            </div>
          </div>

          {/* KPI 3: Monthly Fee Collection */}
          <div
            className="p-3.5 rounded-xl border shadow-sm transition-all duration-150 flex flex-col justify-between"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                  Fee Collected
                </span>
                <div
                  className="p-1.5 rounded-lg border"
                  style={{
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight" style={{ color: colors.primary }}>
                  PKR {data.kpis.financial.totalFeeCollected.toLocaleString()}
                </span>
              </div>
            </div>

            <div
              className="mt-3 pt-2 border-t flex items-center justify-between text-xs"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <span>
                Expected: <strong style={{ color: colors.textPrimary }}>PKR {data.kpis.financial.totalExpectedFee.toLocaleString()}</strong>
              </span>
              <span className="font-bold font-mono" style={{ color: colors.primary }}>
                {data.kpis.financial.collectionRate}%
              </span>
            </div>
          </div>

          {/* KPI 4: Pending Dues (Baqaya) */}
          <div
            className="p-3.5 rounded-xl border shadow-sm transition-all duration-150 flex flex-col justify-between"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                  Pending Dues
                </span>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertOctagon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-rose-500 font-mono tracking-tight">
                  PKR {data.kpis.financial.totalRemainingBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div
              className="mt-3 pt-2 border-t flex items-center justify-between text-xs"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <span style={{ color: colors.primary }}>
                {data.kpis.financial.breakdown.paid} Paid
              </span>
              <span className="text-amber-500">
                {data.kpis.financial.breakdown.partial} Partial
              </span>
              <span className="font-bold text-rose-500">
                {data.kpis.financial.breakdown.unpaid} Defaulters
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Chart 1: Revenue vs Dues Bar Chart */}
          <div
            className="lg:col-span-2 p-4 rounded-xl border shadow-sm transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: colors.primary }} />
                <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                  Monthly Fee Revenue vs Pending Dues (PKR)
                </h3>
              </div>
              <span className="text-[10px]" style={{ color: colors.textMuted }}>Past 6 Months</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.visualAnalytics.revenueTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                  <XAxis dataKey="month" stroke={colors.textSecondary} fontSize={10} />
                  <YAxis stroke={colors.textSecondary} fontSize={10} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: colors.textPrimary
                    }}
                    formatter={(value) => [`PKR ${Number(value || 0).toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px', color: colors.textSecondary }} />
                  <Bar dataKey="Collected" name="Fee Collected" fill={colors.primary} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Pending" name="Remaining Baqaya" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Belt Distribution */}
          <div
            className="p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                    Belt Rank Distribution
                  </h3>
                </div>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>By Belt</span>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.visualAnalytics.beltDistribution}
                      dataKey="count"
                      nameKey="belt"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {data.visualAnalytics.beltDistribution.map((entry) => (
                        <Cell
                          key={`cell-${entry.belt}`}
                          fill={beltPalette[entry.belt] || colors.primary}
                          stroke={colors.bgCard}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.bgCard,
                        borderColor: colors.border,
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: colors.textPrimary
                      }}
                      formatter={(val) => [`${val} Students`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              className="grid grid-cols-3 gap-1.5 pt-2 border-t text-[10px]"
              style={{ borderColor: colors.border }}
            >
              {data.visualAnalytics.beltDistribution.map((b) => (
                <div key={b.belt} className="flex items-center gap-1 truncate">
                  <span
                    className="w-2 h-2 rounded-full border flex-shrink-0"
                    style={{
                      backgroundColor: beltPalette[b.belt] || colors.primary,
                      borderColor: colors.border
                    }}
                  />
                  <span className="truncate" style={{ color: colors.textSecondary }}>{b.belt}:</span>
                  <span className="font-bold" style={{ color: colors.textPrimary }}>{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart 3: Attendance Trend */}
      {data && (
        <div
          className="p-4 rounded-xl border shadow-sm transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
              <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                Daily Attendance Trend (Past 7 Days)
              </h3>
            </div>
            <span className="text-[10px]" style={{ color: colors.textMuted }}>Live Logs</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.visualAnalytics.dailyAttendanceTrend} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                <XAxis dataKey="label" stroke={colors.textSecondary} fontSize={10} />
                <YAxis stroke={colors.textSecondary} fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: colors.textPrimary
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px', color: colors.textSecondary }} />
                <Line
                  type="monotone"
                  dataKey="Present"
                  name="Present Students"
                  stroke={colors.primary}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colors.primary }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Absent"
                  name="Absent Students"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Audit Closing Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              End-of-Month Audit & Reconciliation
            </h2>
            <p className="text-[11px]" style={{ color: colors.textSecondary }}>
              Individual student monthly attendance ratios and fee balances
            </p>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-semibold flex items-center gap-1 hover:underline"
            style={{ color: colors.primary }}
          >
            <span>Full Screen Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <EndOfMonthAuditWidget onOpenStudent={onOpenStudent} />
      </div>
    </div>
  );
};
export default DashboardView;