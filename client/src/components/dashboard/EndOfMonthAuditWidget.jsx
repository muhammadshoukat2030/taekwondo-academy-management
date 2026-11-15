import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Calendar,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Clock
} from 'lucide-react';

export const EndOfMonthAuditWidget = ({ onOpenStudent }) => {
  const { colors, mode } = useTheme();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [auditRows, setAuditRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthName, setMonthName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const res = await api.getMonthlyAudit(selectedMonth, selectedYear);
      if (res.success) {
        setAuditRows(res.auditRows || []);
        setSummary(res.summary);
        setMonthName(res.monthName);
      }
    } catch (err) {
      console.error('Audit fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [selectedMonth, selectedYear]);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const filteredRows = auditRows.filter((row) => {
    const matchesSearch =
      row.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.student.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.student.registrationNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || row.fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    if (!auditRows.length) return;
    const headers = ['Reg No', 'Student Name', 'Father Name', 'Belt', 'Attendance Ratio', 'Attendance %', 'Total Fee', 'Paid Amount', 'Remaining Baqaya', 'Status'];
    const rows = filteredRows.map(r => [
      r.student.registrationNo,
      `"${r.student.fullName}"`,
      `"${r.student.fatherName}"`,
      r.student.currentBelt,
      r.attendance.attendanceRatio,
      `${r.attendance.attendancePercentage}%`,
      r.fee.totalDue,
      r.fee.paidAmount,
      r.fee.remainingBalance,
      r.fee.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Monthly_Audit_${(monthName || 'October').replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headingColor = colors.textHeading;
  const subtitleColor = colors.textSecondary;
  const tableHeaderBg = colors.bgSecondary;
  const tableHeaderColor = colors.textHeading;

  return (
    <div
      className="border rounded-xl p-3.5 lg:p-4 shadow-sm transition-all"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border
      }}
    >
      {/* Header & Month Selector */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b"
        style={{ borderColor: colors.border }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className="p-1.5 rounded-lg border flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300"
            >
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <h2
                className="text-[18px] sm:text-[19px] font-bold flex items-center gap-2 tracking-tight"
                style={{ color: headingColor }}
              >
                End-of-Month Audit & Closing Center
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded border bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                >
                  {monthName || 'Closing Audit'}
                </span>
              </h2>
              <p
                className="text-[13px] font-normal mt-0.5"
                style={{ color: subtitleColor }}
              >
                Unified audit grid comparing attendance ratios vs fee paid/baqaya for every student
              </p>
            </div>
          </div>
        </div>

        {/* Month/Year selector & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
          >
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Select Audit Month"
              className="bg-transparent text-[12.5px] font-semibold focus:outline-none cursor-pointer text-slate-900 dark:text-slate-100"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium">
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select Audit Year"
              className="bg-transparent text-[12.5px] font-semibold focus:outline-none cursor-pointer border-l pl-2 font-mono-numbers text-blue-700 dark:text-blue-300 border-slate-300 dark:border-slate-700"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="px-2.5 py-1 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-2.5 py-1 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Audit KPI Highlights */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 my-2.5">
          {/* 1. Expected Billing */}
          <div
            className="p-2 sm:p-2.5 rounded-lg border flex flex-col justify-between transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate block">
              Expected Billing
            </span>
            <div className="text-[14px] sm:text-[15px] font-bold font-mono-numbers tracking-tight tabular-nums whitespace-nowrap mt-0.5 truncate" style={{ color: colors.textPrimary }}>
              <span className="text-[10px] font-medium text-slate-400 mr-0.5">PKR</span>
              {(summary.totalExpected || 0).toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[10.5px] font-normal text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
              <span>{summary.totalStudentsCount} Students</span>
            </div>
          </div>

          {/* 2. Total Collected */}
          <div
            className="p-2 sm:p-2.5 rounded-lg border flex flex-col justify-between transition-all"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
              borderColor: 'rgba(16, 185, 129, 0.35)'
            }}
          >
            <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate block">
              Total Collected
            </span>
            <div className="text-[14px] sm:text-[15px] font-bold font-mono-numbers tracking-tight tabular-nums whitespace-nowrap mt-0.5 truncate text-emerald-600 dark:text-emerald-400">
              <span className="text-[10px] font-medium opacity-75 mr-0.5">PKR</span>
              {(summary.totalCollected || 0).toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>{summary.collectionRate}% Recovered</span>
            </div>
          </div>

          {/* 3. Pending Baqaya */}
          <div
            className="p-2 sm:p-2.5 rounded-lg border flex flex-col justify-between transition-all"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.05)',
              borderColor: 'rgba(244, 63, 94, 0.35)'
            }}
          >
            <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate block">
              Pending Baqaya
            </span>
            <div className="text-[14px] sm:text-[15px] font-bold font-mono-numbers tracking-tight tabular-nums whitespace-nowrap mt-0.5 truncate text-rose-600 dark:text-rose-400">
              <span className="text-[10px] font-medium opacity-75 mr-0.5">PKR</span>
              {(summary.totalPending || 0).toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[10.5px] font-medium text-rose-600 dark:text-rose-400 mt-0.5 truncate flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
              <span>{summary.unpaidStudents + summary.partialStudents} Students Due</span>
            </div>
          </div>

          {/* 4. Paid in Full */}
          <div
            className="p-2 sm:p-2.5 rounded-lg border flex flex-col justify-between transition-all"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)',
              borderColor: 'rgba(59, 130, 246, 0.35)'
            }}
          >
            <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate block">
              Paid in Full
            </span>
            <div className="text-[14px] sm:text-[15px] font-bold font-mono-numbers tracking-tight whitespace-nowrap mt-0.5 truncate text-blue-600 dark:text-blue-400">
              {summary.paidStudents} <span className="text-[10.5px] font-medium opacity-75">Students</span>
            </div>
            <div className="text-[10px] sm:text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>Cleared 100%</span>
            </div>
          </div>

          {/* 5. Partially Paid */}
          <div
            className="p-2 sm:p-2.5 rounded-lg border flex flex-col justify-between transition-all"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)',
              borderColor: 'rgba(245, 158, 11, 0.35)'
            }}
          >
            <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate block">
              Partially Paid
            </span>
            <div className="text-[14px] sm:text-[15px] font-bold font-mono-numbers tracking-tight whitespace-nowrap mt-0.5 truncate text-amber-600 dark:text-amber-400">
              {summary.partialStudents} <span className="text-[10.5px] font-medium opacity-75">Students</span>
            </div>
            <div className="text-[10px] sm:text-[10.5px] font-medium text-amber-600 dark:text-amber-400 mt-0.5 truncate flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
              <span>Token / Partial</span>
            </div>
          </div>

          {/* 6. Defaulters */}
          <div
            className="p-2 sm:p-2.5 rounded-lg border flex flex-col justify-between transition-all"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.05)',
              borderColor: 'rgba(244, 63, 94, 0.35)'
            }}
          >
            <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate block">
              Defaulters
            </span>
            <div className="text-[14px] sm:text-[15px] font-bold font-mono-numbers tracking-tight whitespace-nowrap mt-0.5 truncate text-rose-600 dark:text-rose-400">
              {summary.unpaidStudents} <span className="text-[10.5px] font-medium opacity-75">Students</span>
            </div>
            <div className="text-[10px] sm:text-[10.5px] font-medium text-rose-600 dark:text-rose-400 mt-0.5 truncate flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
              <span>0 PKR Paid</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search student or father name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-[13px] font-normal bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto max-w-full overflow-x-auto pb-0.5">
          <Filter className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">Status:</span>
          <div
            className="flex items-center p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[12px] flex-shrink-0"
          >
            {['All', 'PAID', 'PARTIAL', 'UNPAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className="px-2.5 py-0.5 rounded-md text-[12px] font-medium transition cursor-pointer"
                style={{
                  backgroundColor: statusFilter === st ? '#2563EB' : 'transparent',
                  color: statusFilter === st ? '#FFFFFF' : (mode === 'dark' ? '#CBD5E1' : '#334155')
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div
        className="overflow-x-auto rounded-lg border w-full border-slate-300 dark:border-slate-700"
        style={{
          backgroundColor: colors.bgCard
        }}
      >
        <table className="w-full text-left text-[13px] border-collapse min-w-[720px]">
          <thead>
            <tr
              className="uppercase text-[11.5px] font-semibold tracking-wider border-b border-slate-300 dark:border-slate-700"
              style={{
                backgroundColor: tableHeaderBg,
                color: tableHeaderColor
              }}
            >
              <th className="py-2.5 px-3">Student / Roll No</th>
              <th className="py-2.5 px-2.5">Belt</th>
              <th className="py-2.5 px-2 text-center">Pres</th>
              <th className="py-2.5 px-2 text-center">Abs</th>
              <th className="py-2.5 px-2 text-center">Ratio</th>
              <th className="py-2.5 px-2 text-center">%</th>
              <th className="py-2.5 px-2.5 text-right">Billed</th>
              <th className="py-2.5 px-2.5 text-right">Paid</th>
              <th className="py-2.5 px-2.5 text-right">Baqaya</th>
              <th className="py-2.5 px-2 text-center">Status</th>
              <th className="py-2.5 px-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-xs">Loading Monthly Audit Data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-6 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No student records matched the audit criteria for this month.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const beltBadgeClass = {
                  White: 'bg-slate-100 text-slate-900 border-slate-300 font-bold',
                  Yellow: 'bg-yellow-50 text-yellow-900 border-yellow-400 font-bold',
                  Green: 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold',
                  Blue: 'bg-blue-50 text-blue-900 border-blue-400 font-bold',
                  Red: 'bg-rose-50 text-rose-900 border-rose-400 font-bold',
                  Black: 'bg-slate-900 text-amber-300 border-amber-500 font-bold'
                }[row.student.currentBelt] || 'bg-slate-100 text-slate-800 border-slate-300 font-bold';

                return (
                  <tr
                    key={row.student._id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {row.student.photo ? (
                          <img
                            src={row.student.photo}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-slate-300 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          >
                            {row.student.fullName[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div
                            className="text-[13px] font-semibold truncate max-w-[150px]"
                            style={{ color: colors.textHeading }}
                          >
                            {row.student.fullName}
                          </div>
                          <div
                            className="text-[11px] font-normal truncate mt-0.5"
                            style={{ color: colors.textSecondary }}
                          >
                            S/O {row.student.fatherName} • <span className="font-mono-numbers font-medium text-blue-700 dark:text-blue-300">{row.student.registrationNo}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-2.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${beltBadgeClass}`}
                      >
                        {row.student.currentBelt}
                      </span>
                    </td>

                    <td className="py-2 px-2 text-center font-mono-numbers font-bold text-[12.5px] text-blue-700 dark:text-blue-300">
                      {row.attendance.presentDays}
                    </td>

                    <td className="py-2 px-2 text-center font-mono-numbers font-bold text-[12.5px] text-rose-700 dark:text-rose-400">
                      {row.attendance.absentDays}
                    </td>

                    <td
                      className="py-2 px-2 text-center font-mono-numbers font-medium text-[12px]"
                      style={{ color: colors.textPrimary }}
                    >
                      {row.attendance.attendanceRatio}
                    </td>

                    <td
                      className="py-2 px-2 text-center font-mono-numbers font-medium text-[12px]"
                      style={{ color: colors.textPrimary }}
                    >
                      {row.attendance.attendancePercentage}%
                    </td>

                    <td
                      className="py-2 px-2.5 text-right font-mono-numbers font-semibold text-[12.5px]"
                      style={{ color: colors.textPrimary }}
                    >
                      PKR {(row.fee.totalDue || 0).toLocaleString()}
                    </td>

                    <td className="py-2 px-2.5 text-right font-mono-numbers font-bold text-[12.5px] text-emerald-700 dark:text-emerald-400">
                      PKR {(row.fee.paidAmount || 0).toLocaleString()}
                    </td>

                    <td className="py-2 px-2.5 text-right font-mono-numbers font-bold text-[12.5px] text-rose-700 dark:text-rose-400">
                      PKR {(row.fee.remainingBalance || 0).toLocaleString()}
                    </td>

                    <td className="py-2 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          row.fee.status === 'PAID'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400'
                            : row.fee.status === 'PARTIAL'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-400'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-400'
                        }`}
                      >
                        {row.fee.status}
                      </span>
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => onOpenStudent && onOpenStudent(row.student?._id || row.student)}
                        className="px-2 py-1 rounded text-[11px] font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        Audit Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EndOfMonthAuditWidget;
