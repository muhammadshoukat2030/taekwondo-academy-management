import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAcademy } from '../../context/AcademyContext.jsx';
import { EndOfMonthAuditWidget } from './EndOfMonthAuditWidget.jsx';
import { DashboardSkeleton } from '../common/Skeleton.jsx';
import {
  Users,
  UserCheck,
  CreditCard,
  DollarSign,
  AlertOctagon,
  CalendarCheck2,
  TrendingUp,
  Award,
  RefreshCw,
  ArrowRight,
  UserPlus,
  Receipt,
  ChevronRight,
  Activity
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
  const { colors, mode } = useTheme();
  const { settings } = useAcademy();
  const [data, setData] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiRes, studentsRes, feesRes] = await Promise.all([
        api.getDashboardKPIs(),
        api.getStudents(),
        api.getFees()
      ]);
      if (kpiRes.success) {
        setData(kpiRes);
      }
      if (studentsRes && studentsRes.data) {
        setRecentStudents(studentsRes.data.slice(0, 4));
      }
      if (feesRes && feesRes.data) {
        setRecentTransactions(feesRes.data.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const beltPalette = {
    White: mode === 'dark' ? '#f8fafc' : '#64748b',
    Yellow: '#eab308',
    Green: '#10b981',
    Blue: '#3b82f6',
    Red: '#ef4444',
    Black: mode === 'dark' ? '#0f172a' : '#1e293b'
  };

  const beltColors = {
    White: mode === 'dark' ? 'bg-slate-200 text-slate-900 border-slate-400' : 'bg-slate-100 text-slate-900 border-slate-300 font-bold',
    Yellow: 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-400 dark:border-yellow-700 font-bold',
    Green: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 font-bold',
    Blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-400 dark:border-blue-700 font-bold',
    Red: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-700 font-bold',
    Black: 'bg-slate-900 text-amber-300 border-amber-500 font-bold shadow-xs'
  };

  const chartAxisColor = mode === 'dark' ? '#94A3B8' : '#64748B';
  const headingColor = colors.textHeading;
  const cardHeadingColor = colors.textHeading;
  const subtitleColor = colors.textSecondary;

  return (
    <div className="space-y-3.5">
      {/* 1. TOP OVERVIEW SECTION */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border shadow-xs transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt=""
                className="w-7 h-7 rounded-lg object-contain border p-0.5"
                style={{ borderColor: colors.border }}
              />
            ) : (
              <span className="text-xl">🥋</span>
            )}
            <h1
              className="text-[20px] sm:text-[22px] font-bold tracking-tight"
              style={{ color: headingColor }}
            >
              {settings?.dashboardHeading || 'Academy Overview Dashboard'}
            </h1>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded border tracking-wide font-mono-numbers bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
            >
              LIVE
            </span>
          </div>
          <p
            className="text-[12.5px] font-normal mt-0.5"
            style={{ color: subtitleColor }}
          >
            {settings?.dashboardSubtitle || `${settings?.academyName || 'Al Murtaza Shah Taekwondo'} • ${settings?.address || 'Abdur Rehman Plaza, Chogi No.7, Kohat'} • ${settings?.recognition || 'PTF/KPK Recognized'}`}
          </p>
        </div>

        {/* Useful Dashboard Actions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => onNavigate('terminal')}
            className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => onNavigate('fees')}
            className="px-3 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 transition hover:bg-emerald-100 dark:hover:bg-emerald-900 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Collect Fee</span>
          </button>

          <button
            onClick={() => onNavigate('admission')}
            className="px-3 py-1.5 rounded-lg text-white text-[12.5px] font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-white" />
            <span>+ Admission</span>
          </button>
        </div>
      </div>

      {/* SKELETON LOADER WHILE FETCHING INITIAL METRICS */}
      {!data && loading && <DashboardSkeleton />}

      {/* 2. COMPACT 5-KPI STATISTICS SECTION */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3">
          {/* KPI 1: Total Students */}
          <div
            className="p-2.5 sm:p-3 rounded-xl border shadow-xs transition-all flex flex-col justify-between"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: cardHeadingColor }}
              >
                Total Students
              </span>
              <div className="w-7 h-7 rounded-md border flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <div
                className="text-[22px] sm:text-[23px] font-bold font-mono tracking-tight tabular-nums leading-tight"
                style={{ color: headingColor }}
              >
                {data.kpis.students.total}
              </div>
              <div
                className="text-[11.5px] font-normal truncate mt-0.5"
                style={{ color: subtitleColor }}
              >
                All-time enrolled roster
              </div>
            </div>
          </div>

          {/* KPI 2: Active Students */}
          <div
            className="p-2.5 sm:p-3 rounded-xl border shadow-xs transition-all flex flex-col justify-between"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: cardHeadingColor }}
              >
                Active Students
              </span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <div className="text-[22px] sm:text-[23px] font-bold font-mono tracking-tight tabular-nums leading-tight text-emerald-700 dark:text-emerald-400">
                {data.kpis.students.active}
              </div>
              <div
                className="text-[11.5px] font-normal truncate mt-0.5"
                style={{ color: subtitleColor }}
              >
                {Math.round((data.kpis.students.active / (data.kpis.students.total || 1)) * 100)}% attendance eligible
              </div>
            </div>
          </div>

          {/* KPI 3: Today's Attendance */}
          <div
            className="p-2.5 sm:p-3 rounded-xl border shadow-xs transition-all flex flex-col justify-between"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: cardHeadingColor }}
              >
                Today's Attendance
              </span>
              <div className="w-7 h-7 rounded-md border flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300">
                <CalendarCheck2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <div className="text-[22px] sm:text-[23px] font-bold font-mono tracking-tight tabular-nums leading-tight text-blue-700 dark:text-blue-400">
                {data.kpis.todayAttendance.Present}
              </div>
              <div
                className="text-[11.5px] font-normal truncate mt-0.5"
                style={{ color: subtitleColor }}
              >
                {data.kpis.todayAttendance.Absent} Absent • {data.kpis.todayAttendance.Leave} Leave
              </div>
            </div>
          </div>

          {/* KPI 4: Monthly Fee Collection */}
          <div
            className="p-2.5 sm:p-3 rounded-xl border shadow-xs transition-all flex flex-col justify-between"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: cardHeadingColor }}
              >
                Fee Collected
              </span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <div className="text-[21px] sm:text-[22px] font-bold font-mono tracking-tight tabular-nums leading-tight text-emerald-700 dark:text-emerald-400 truncate">
                PKR {data.kpis.financial.totalFeeCollected.toLocaleString()}
              </div>
              <div
                className="text-[11.5px] font-normal truncate mt-0.5"
                style={{ color: subtitleColor }}
              >
                {data.kpis.financial.collectionRate}% Recovered this month
              </div>
            </div>
          </div>

          {/* KPI 5: Pending Fees (Baqaya) */}
          <div
            className="p-2.5 sm:p-3 rounded-xl border shadow-xs transition-all flex flex-col justify-between col-span-2 sm:col-span-1 xl:col-span-1"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: cardHeadingColor }}
              >
                Pending Baqaya
              </span>
              <div className="w-7 h-7 rounded-md bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <div className="text-[21px] sm:text-[22px] font-bold font-mono tracking-tight tabular-nums leading-tight text-rose-700 dark:text-rose-400 truncate">
                PKR {data.kpis.financial.totalRemainingBalance.toLocaleString()}
              </div>
              <div className="text-[11.5px] font-medium truncate mt-0.5 text-rose-700 dark:text-rose-400">
                {data.kpis.financial.breakdown.unpaid} Defaulters Pending
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT: BALANCED TWO-COLUMN CORONA/POS LAYOUT */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Visual Charts & Full End-of-Month Audit (8 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-3.5">
            {/* Chart 1: Revenue vs Baqaya Past 6 Months */}
            <div
              className="p-3.5 sm:p-4 rounded-xl border shadow-xs transition-all"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3
                      className="text-[15px] sm:text-[16px] font-semibold tracking-tight"
                      style={{ color: cardHeadingColor }}
                    >
                      Fee Collection Revenue vs Pending Baqaya (PKR)
                    </h3>
                    <p
                      className="text-[12.5px] font-normal mt-0.5"
                      style={{ color: subtitleColor }}
                    >
                      Monthly cash recovery performance over the past 6 billing cycles
                    </p>
                  </div>
                </div>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded border bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                >
                  Past 6 Months
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.visualAnalytics.revenueTrend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
                    <XAxis dataKey="month" stroke={chartAxisColor} fontSize={12} fontWeight={500} tickLine={false} />
                    <YAxis stroke={chartAxisColor} fontSize={12} fontWeight={500} tickFormatter={(val) => `${val / 1000}k`} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.bgCard,
                        borderColor: colors.border,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: colors.textPrimary
                      }}
                      formatter={(value) => [`PKR ${Number(value || 0).toLocaleString()}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '6px', color: subtitleColor }} />
                    <Bar dataKey="Collected" name="Fee Collected" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" name="Remaining Baqaya" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Daily Attendance Trend Past 7 Days */}
            <div
              className="p-3.5 sm:p-4 rounded-xl border shadow-xs transition-all"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3
                      className="text-[15px] sm:text-[16px] font-semibold tracking-tight"
                      style={{ color: cardHeadingColor }}
                    >
                      Daily Student Attendance Trend
                    </h3>
                    <p
                      className="text-[12.5px] font-normal mt-0.5"
                      style={{ color: subtitleColor }}
                    >
                      Active daily attendance logs recorded via Face AI and Fingerprint scanning
                    </p>
                  </div>
                </div>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded border bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                >
                  Past 7 Days
                </span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.visualAnalytics.dailyAttendanceTrend} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
                    <XAxis dataKey="label" stroke={chartAxisColor} fontSize={12} fontWeight={500} tickLine={false} />
                    <YAxis stroke={chartAxisColor} fontSize={12} fontWeight={500} allowDecimals={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.bgCard,
                        borderColor: colors.border,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: colors.textPrimary
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '6px', color: subtitleColor }} />
                    <Line
                      type="monotone"
                      dataKey="Present"
                      name="Present Students"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#2563EB' }}
                      activeDot={{ r: 5.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Absent"
                      name="Absent Students"
                      stroke="#DC2626"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#DC2626' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Left Column: End-of-Month Audit Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2
                    className="text-[18px] sm:text-[19px] font-bold tracking-tight"
                    style={{ color: headingColor }}
                  >
                    End-of-Month Audit & Reconciliation
                  </h2>
                  <p
                    className="text-[13px] font-normal mt-0.5"
                    style={{ color: subtitleColor }}
                  >
                    Individual student monthly attendance ratios and fee balances
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('audit')}
                  className="text-[13px] font-semibold flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400 cursor-pointer"
                >
                  <span>Full Screen Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <EndOfMonthAuditWidget onOpenStudent={onOpenStudent} />
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Belt Stats, Quick Actions & Recent Logs (4 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-3.5">
            {/* Right Card 1: Belt Rank Distribution */}
            <div
              className="p-3.5 sm:p-4 rounded-xl border shadow-xs transition-all"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3
                    className="text-[15px] sm:text-[16px] font-semibold tracking-tight"
                    style={{ color: cardHeadingColor }}
                  >
                    Belt Rank Distribution
                  </h3>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">By Belt</span>
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
                      innerRadius={42}
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
                        fontSize: '13px',
                        fontWeight: 500,
                        color: colors.textPrimary
                      }}
                      formatter={(val) => [`${val} Students`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Belt Badges Grid */}
              <div
                className="grid grid-cols-3 gap-1.5 pt-3 border-t text-[12px]"
                style={{ borderColor: colors.border }}
              >
                {data.visualAnalytics.beltDistribution.map((b) => (
                  <div key={b.belt} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0"
                      style={{
                        backgroundColor: beltPalette[b.belt] || colors.primary
                      }}
                    />
                    <span className="truncate font-normal" style={{ color: subtitleColor }}>{b.belt}:</span>
                    <span className="font-semibold font-mono-numbers" style={{ color: cardHeadingColor }}>{b.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card 2: Financial Recovery Breakdown */}
            <div
              className="p-3.5 sm:p-4 rounded-xl border shadow-xs transition-all"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3
                    className="text-[15px] sm:text-[16px] font-semibold tracking-tight"
                    style={{ color: cardHeadingColor }}
                  >
                    Monthly Billing Recovery
                  </h3>
                </div>
                <span className="text-[12px] font-bold font-mono-numbers text-emerald-700 dark:text-emerald-400">
                  {data.kpis.financial.collectionRate}%
                </span>
              </div>

              {/* Recovery Progress Bar */}
              <div className="space-y-2">
                <div
                  className="w-full h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700"
                >
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-blue-600"
                    style={{
                      width: `${data.kpis.financial.collectionRate}%`
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-lg border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800">
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Cleared</div>
                    <div className="text-[15px] font-bold font-mono-numbers text-emerald-700 dark:text-emerald-300">
                      {data.kpis.financial.breakdown.paid}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg border bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800">
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">Partial</div>
                    <div className="text-[15px] font-bold font-mono-numbers text-amber-700 dark:text-amber-300">
                      {data.kpis.financial.breakdown.partial}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg border bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800">
                    <div className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">Defaulters</div>
                    <div className="text-[15px] font-bold font-mono-numbers text-rose-700 dark:text-rose-300">
                      {data.kpis.financial.breakdown.unpaid}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t flex items-center justify-between text-[12px]" style={{ borderColor: colors.border }}>
                <span className="font-normal" style={{ color: subtitleColor }}>Expected: PKR {data.kpis.financial.totalExpectedFee.toLocaleString()}</span>
                <button
                  onClick={() => onNavigate('fees')}
                  className="font-medium hover:underline flex items-center gap-0.5 text-blue-600 dark:text-blue-400 cursor-pointer"
                >
                  <span>Open Fee Desk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Card 3: Recent Student Admissions */}
            <div
              className="p-3.5 sm:p-4 rounded-xl border shadow-xs transition-all"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3
                    className="text-[15px] sm:text-[16px] font-semibold tracking-tight"
                    style={{ color: cardHeadingColor }}
                  >
                    Recent Student Admissions
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('students')}
                  className="text-[12px] font-medium hover:underline flex items-center gap-0.5 text-blue-600 dark:text-blue-400 cursor-pointer"
                >
                  <span>All ({data.kpis.students.total})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentStudents.length === 0 ? (
                <p className="text-[13px] py-4 text-center font-normal" style={{ color: subtitleColor }}>
                  No student records found.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentStudents.map((st) => (
                    <div
                      key={st._id}
                      onClick={() => onOpenStudent && onOpenStudent(st._id)}
                      className="p-2 rounded-lg border flex items-center justify-between cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800/80 group"
                      style={{
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {st.photo ? (
                          <img
                            src={st.photo}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border flex-shrink-0"
                            style={{ borderColor: colors.border }}
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200"
                          >
                            {st.fullName ? st.fullName[0] : 'S'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div
                            className="text-[13.5px] font-semibold truncate leading-tight group-hover:underline"
                            style={{ color: cardHeadingColor }}
                          >
                            {st.fullName}
                          </div>
                          <div
                            className="text-[12px] truncate font-normal mt-0.5"
                            style={{ color: subtitleColor }}
                          >
                            S/O {st.fatherName} • <span className="font-mono-numbers text-blue-700 dark:text-blue-300">{st.registrationNo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            beltColors[st.currentBelt] || 'border-current'
                          }`}
                        >
                          {st.currentBelt}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Card 4: Recent Fee Transactions */}
            <div
              className="p-3.5 sm:p-4 rounded-xl border shadow-xs transition-all"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3
                    className="text-[15px] sm:text-[16px] font-semibold tracking-tight"
                    style={{ color: cardHeadingColor }}
                  >
                    Recent Fee Receipts
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('fees')}
                  className="text-[12px] font-medium hover:underline flex items-center gap-0.5 text-blue-600 dark:text-blue-400 cursor-pointer"
                >
                  <span>Receipts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentTransactions.length === 0 ? (
                <p className="text-[13px] py-4 text-center font-normal" style={{ color: subtitleColor }}>
                  No fee transactions recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="p-2 rounded-lg border flex items-center justify-between"
                      style={{
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border
                      }}
                    >
                      <div className="min-w-0">
                        <div
                          className="text-[13px] font-semibold truncate leading-tight"
                          style={{ color: cardHeadingColor }}
                        >
                          {tx.studentName || 'Student Fee'}
                        </div>
                        <div
                          className="text-[11.5px] font-normal font-mono-numbers mt-0.5"
                          style={{ color: subtitleColor }}
                        >
                          Receipt #{tx.receiptNo || '101'} • {tx.paymentMethod || 'Cash'}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[13.5px] font-bold font-mono-numbers text-emerald-700 dark:text-emerald-400">
                          PKR {(tx.receivedAmount || tx.amountReceived || 1000).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          CLEARED
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardView;
