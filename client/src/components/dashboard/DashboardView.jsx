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
  RefreshCw
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
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 lg:p-6 rounded-2xl border transition-all shadow-md"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🥋</span>
            <h1 className="text-xl lg:text-2xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
              Executive Academy Command Center
            </h1>
          </div>
          <p className="text-xs lg:text-sm mt-1" style={{ color: colors.textSecondary }}>
            Real-time biometric tracking, end-of-month fee audits, and federation grading records for Al Murtaza Shah TKD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderColor: colors.border
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: colors.primary }} />
            <span>Sync Live</span>
          </button>
          <button
            onClick={() => onNavigate('terminal')}
            className="px-3.5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:opacity-95 active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Launch Smart Terminal</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY EXECUTIVE KPI CARDS */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Active vs Inactive Students */}
          <div
            className="p-4 rounded-2xl border shadow-sm relative overflow-hidden group transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Student Registry
              </span>
              <div
                className="p-2 rounded-xl border"
                style={{
                  backgroundColor: colors.badgeBg,
                  borderColor: colors.border,
                  color: colors.primary
                }}
              >
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black" style={{ color: colors.textPrimary }}>
                {data.kpis.students.active}
              </span>
              <span className="text-xs font-semibold" style={{ color: colors.primary }}>
                Active Students
              </span>
            </div>
            <div
              className="mt-3 pt-3 border-t flex items-center justify-between text-xs"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                Total: {data.kpis.students.total}
              </span>
              <span className="flex items-center gap-1">
                <UserX className="w-3.5 h-3.5 text-rose-500" />
                Inactive: {data.kpis.students.inactive}
              </span>
            </div>
          </div>

          {/* KPI 2: Today's Live Attendance */}
          <div
            className="p-4 rounded-2xl border shadow-sm relative overflow-hidden group transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Today's Live Attendance
              </span>
              <div
                className="p-2 rounded-xl border"
                style={{
                  backgroundColor: colors.badgeBg,
                  borderColor: colors.border,
                  color: colors.primary
                }}
              >
                <CalendarCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black" style={{ color: colors.primary }}>
                {data.kpis.todayAttendance.Present}
              </span>
              <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                Present in Dojang
              </span>
            </div>
            <div
              className="mt-3 pt-3 border-t grid grid-cols-3 gap-1.5 text-[11px] text-center font-mono"
              style={{ borderColor: colors.border }}
            >
              <div className="p-1 rounded-lg border" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}>
                <span className="text-rose-500 font-bold block">{data.kpis.todayAttendance.Absent}</span>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>Absent</span>
              </div>
              <div className="p-1 rounded-lg border" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}>
                <span className="text-amber-500 font-bold block">{data.kpis.todayAttendance.Leave}</span>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>Leave</span>
              </div>
              <div className="p-1 rounded-lg border" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}>
                <span className="font-bold block" style={{ color: colors.primary }}>{data.kpis.todayAttendance.Late}</span>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>Late</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Financial Summary (Current Month) */}
          <div
            className="p-4 rounded-2xl border shadow-sm relative overflow-hidden group transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Monthly Fee Collection
              </span>
              <div
                className="p-2 rounded-xl border"
                style={{
                  backgroundColor: colors.badgeBg,
                  borderColor: colors.border,
                  color: colors.primary
                }}
              >
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black font-mono" style={{ color: colors.primary }}>
                PKR {data.kpis.financial.totalFeeCollected.toLocaleString()}
              </span>
            </div>
            <div
              className="mt-3 pt-3 border-t flex items-center justify-between text-xs"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <span>
                Expected: <strong style={{ color: colors.textPrimary }}>PKR {data.kpis.financial.totalExpectedFee.toLocaleString()}</strong>
              </span>
              <span className="font-bold" style={{ color: colors.primary }}>
                {data.kpis.financial.collectionRate}%
              </span>
            </div>
          </div>

          {/* KPI 4: Fee Status Breakdown & Defaulters */}
          <div
            className="p-4 rounded-2xl border shadow-sm relative overflow-hidden group transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Defaulters & Pending Dues
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black text-rose-500 font-mono">
                PKR {data.kpis.financial.totalRemainingBalance.toLocaleString()}
              </span>
              <span className="text-xs text-rose-500 font-medium">Baqaya</span>
            </div>
            <div
              className="mt-3 pt-3 border-t flex items-center justify-between text-xs"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <span className="flex items-center gap-1" style={{ color: colors.primary }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {data.kpis.financial.breakdown.paid} Paid
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                {data.kpis.financial.breakdown.partial} Partial
              </span>
              <span className="flex items-center gap-1 font-bold text-rose-500">
                {data.kpis.financial.breakdown.unpaid} Defaulters
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VISUAL ANALYTICS SECTION */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Monthly Revenue vs Pending Dues Bar Chart */}
          <div
            className="lg:col-span-2 p-5 rounded-2xl border shadow-md transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: colors.primary }} />
                <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                  Monthly Fee Revenue vs Pending Dues (PKR)
                </h3>
              </div>
              <span className="text-xs" style={{ color: colors.textSecondary }}>Past 6 Months</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.visualAnalytics.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                  <XAxis dataKey="month" stroke={colors.textSecondary} fontSize={11} />
                  <YAxis stroke={colors.textSecondary} fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                      borderRadius: '12px',
                      color: colors.textPrimary
                    }}
                    formatter={(value) => [`PKR ${Number(value || 0).toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: colors.textSecondary }} />
                  <Bar dataKey="Collected" name="Fee Collected" fill={colors.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pending" name="Remaining Baqaya" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Student Belt Distribution Donut Chart */}
          <div
            className="p-5 rounded-2xl border shadow-md flex flex-col justify-between transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>Student Belt Distribution</h3>
                </div>
                <span className="text-xs" style={{ color: colors.textSecondary }}>By Rank</span>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.visualAnalytics.beltDistribution}
                      dataKey="count"
                      nameKey="belt"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
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
                        borderRadius: '12px',
                        color: colors.textPrimary
                      }}
                      formatter={(val) => [`${val} Students`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              className="grid grid-cols-3 gap-2 pt-2 border-t text-[11px]"
              style={{ borderColor: colors.border }}
            >
              {data.visualAnalytics.beltDistribution.map((b) => (
                <div key={b.belt} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border"
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

      {/* Chart 3: Daily Attendance Trend Line (Last 7 Days) */}
      {data && (
        <div
          className="p-5 rounded-2xl border shadow-md transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
              <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                Daily Attendance Trend (Last 7 Days)
              </h3>
            </div>
            <span className="text-xs" style={{ color: colors.textSecondary }}>Live Dojang Logs</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.visualAnalytics.dailyAttendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                <XAxis dataKey="label" stroke={colors.textSecondary} fontSize={11} />
                <YAxis stroke={colors.textSecondary} fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    borderRadius: '12px',
                    color: colors.textPrimary
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: colors.textSecondary }} />
                <Line
                  type="monotone"
                  dataKey="Present"
                  name="Present Students"
                  stroke={colors.primary}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: colors.primary }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Absent"
                  name="Absent Students"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* END-OF-MONTH AUDIT WIDGET INTEGRATION */}
      <EndOfMonthAuditWidget onOpenStudent={onOpenStudent} />
    </div>
  );
};
