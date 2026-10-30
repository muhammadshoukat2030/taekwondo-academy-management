import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Calendar,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export const EndOfMonthAuditWidget = ({ onOpenStudent }) => {
  const { colors, theme, mode } = useTheme();
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

  return (
    <div
      className="border rounded-xl p-4 lg:p-5 shadow-sm transition-all"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border
      }}
    >
      {/* Header & Month Selector */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b"
        style={{ borderColor: colors.border }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className="p-1.5 rounded-lg border flex items-center justify-center"
              style={{
                backgroundColor: colors.badgeBg,
                borderColor: colors.border,
                color: colors.primary
              }}
            >
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>
                End-of-Month Audit & Closing Center
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md border font-normal"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                    color: colors.textSecondary
                  }}
                >
                  {monthName || 'Closing Audit'}
                </span>
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>
                Single unified audit grid comparing exact attendance ratios vs fee paid/baqaya for every student
              </p>
            </div>
          </div>
        </div>

        {/* Month/Year selector & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Select Audit Month"
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ color: colors.textPrimary }}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value} style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select Audit Year"
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer border-l pl-2"
              style={{
                borderColor: colors.border,
                color: colors.primary
              }}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all hover:scale-105"
            style={{
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderColor: colors.border
            }}
          >
            <FileSpreadsheet className="w-3 h-3" style={{ color: colors.primary }} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all hover:scale-105"
            style={{
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderColor: colors.border
            }}
          >
            <Printer className="w-3 h-3 text-cyan-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Audit KPI Highlights */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 my-3.5">
          <div
            className="p-2.5 rounded-lg border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            <div className="text-[10px] font-medium" style={{ color: colors.textSecondary }}>Expected Billing</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: colors.textPrimary }}>
              PKR {summary.totalExpected.toLocaleString()}
            </div>
            <div className="text-[9.5px] mt-0.5" style={{ color: colors.textMuted }}>{summary.totalStudentsCount} Students</div>
          </div>

          <div className="p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30">
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Total Collected</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-300 mt-0.5">
              PKR {summary.totalCollected.toLocaleString()}
            </div>
            <div className="text-[9.5px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">{summary.collectionRate}% Recovered</div>
          </div>

          <div className="p-2.5 rounded-lg border bg-rose-500/10 border-rose-500/30">
            <div className="text-[10px] text-rose-500 font-medium">Pending Dues (Baqaya)</div>
            <div className="text-sm font-bold text-rose-500 dark:text-rose-300 mt-0.5">
              PKR {summary.totalPending.toLocaleString()}
            </div>
            <div className="text-[9.5px] text-rose-500/80 mt-0.5">{summary.unpaidStudents + summary.partialStudents} Students</div>
          </div>

          <div
            className="p-2.5 rounded-lg border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            <div className="text-[10px] font-medium" style={{ color: colors.primary }}>Paid in Full</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: colors.textPrimary }}>{summary.paidStudents} Students</div>
            <div className="text-[9.5px] mt-0.5" style={{ color: colors.textMuted }}>Cleared 100%</div>
          </div>

          <div
            className="p-2.5 rounded-lg border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            <div className="text-[10px] text-amber-500 font-medium">Partially Paid</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: colors.textPrimary }}>{summary.partialStudents} Students</div>
            <div className="text-[9.5px] text-amber-500 mt-0.5">Token / Half fee</div>
          </div>

          <div
            className="p-2.5 rounded-lg border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            <div className="text-[10px] text-rose-500 font-medium">Defaulters (Unpaid)</div>
            <div className="text-sm font-bold text-rose-500 mt-0.5">{summary.unpaidStudents} Students</div>
            <div className="text-[9.5px] text-rose-500 mt-0.5">0 PKR Paid</div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2" style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder="Search student or father name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 rounded-lg border text-xs focus:outline-none transition"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.textPrimary
            }}
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3 h-3" style={{ color: colors.textMuted }} />
          <span className="text-[11px]" style={{ color: colors.textSecondary }}>Filter:</span>
          <div
            className="flex items-center p-0.5 rounded-lg border text-xs"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            {['All', 'PAID', 'PARTIAL', 'UNPAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium transition"
                style={{
                  backgroundColor: statusFilter === st ? colors.primary : 'transparent',
                  color: statusFilter === st ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: statusFilter === st ? '600' : '500'
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
        className="overflow-x-auto rounded-lg border w-full"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.bgCard
        }}
      >
        <table className="w-full text-left text-[11px] border-collapse min-w-[720px]">
          <thead>
            <tr
              className="uppercase text-[9.5px] tracking-wider border-b"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <th className="py-2 px-2.5">Student / Roll No</th>
              <th className="py-2 px-2.5">Belt</th>
              <th className="py-2 px-2 text-center">Pres</th>
              <th className="py-2 px-2 text-center">Abs</th>
              <th className="py-2 px-2 text-center">Ratio</th>
              <th className="py-2 px-2 text-center">%</th>
              <th className="py-2 px-2.5 text-right">Billed</th>
              <th className="py-2 px-2.5 text-right">Paid</th>
              <th className="py-2 px-2.5 text-right">Baqaya</th>
              <th className="py-2 px-2 text-center">Status</th>
              <th className="py-2 px-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y font-sans" style={{ borderColor: colors.border }}>
            {loading ? (
              <tr>
                <td colSpan={11} className="py-8 text-center" style={{ color: colors.textSecondary }}>
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin" style={{ color: colors.primary }} />
                    <span className="text-xs">Loading Monthly Audit Data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-6 text-center text-xs" style={{ color: colors.textSecondary }}>
                  No student records matched the audit criteria for this month.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const beltColors = {
                  White: mode === 'dark' ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-slate-200 text-slate-800 border-slate-300',
                  Yellow: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/40',
                  Green: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40',
                  Blue: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40',
                  Red: 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/40',
                  Black: 'bg-slate-900 text-amber-400 border-amber-500/50'
                };

                return (
                  <tr
                    key={row.student._id}
                    className="transition-colors hover:opacity-90"
                    style={{
                      borderBottom: `1px solid ${colors.border}`
                    }}
                  >
                    <td className="py-2 px-2.5">
                      <div className="flex items-center gap-2">
                        {row.student.photo ? (
                          <img
                            src={row.student.photo}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border flex-shrink-0"
                            style={{ borderColor: colors.border }}
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                          >
                            {row.student.fullName[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold truncate max-w-[140px]" style={{ color: colors.textPrimary }}>
                            {row.student.fullName}
                          </div>
                          <div className="text-[10px] truncate" style={{ color: colors.textSecondary }}>
                            S/O {row.student.fatherName} • <span className="font-mono">{row.student.registrationNo}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-2.5">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-semibold border ${
                          beltColors[row.student.currentBelt] || 'border-current'
                        }`}
                      >
                        {row.student.currentBelt}
                      </span>
                    </td>

                    <td className="py-2 px-2 text-center font-mono font-medium" style={{ color: colors.primary }}>
                      {row.attendance.presentDays}
                    </td>

                    <td className="py-2 px-2 text-center font-mono font-medium text-rose-500">
                      {row.attendance.absentDays}
                    </td>

                    <td className="py-2 px-2 text-center font-mono font-medium" style={{ color: colors.textPrimary }}>
                      {row.attendance.attendanceRatio}
                    </td>

                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div
                          className="w-10 rounded-full h-1 overflow-hidden"
                          style={{ backgroundColor: colors.bgSecondary }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, row.attendance.attendancePercentage)}%`,
                              backgroundColor:
                                row.attendance.attendancePercentage >= 75
                                  ? colors.primary
                                  : row.attendance.attendancePercentage >= 50
                                  ? '#F59E0B'
                                  : '#EF4444'
                            }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[10px]" style={{ color: colors.textPrimary }}>
                          {row.attendance.attendancePercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="py-2 px-2.5 text-right font-mono" style={{ color: colors.textSecondary }}>
                      PKR {row.fee.totalDue.toLocaleString()}
                    </td>

                    <td className="py-2 px-2.5 text-right font-mono font-semibold" style={{ color: colors.primary }}>
                      PKR {row.fee.paidAmount.toLocaleString()}
                    </td>

                    <td className="py-2 px-2.5 text-right font-mono font-bold">
                      {row.fee.remainingBalance > 0 ? (
                        <span className="text-rose-500">PKR {row.fee.remainingBalance.toLocaleString()}</span>
                      ) : (
                        <span style={{ color: colors.primary }}>0</span>
                      )}
                    </td>

                    <td className="py-2 px-2 text-center">
                      {row.fee.status === 'PAID' ? (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold border"
                          style={{
                            backgroundColor: colors.badgeBg,
                            borderColor: colors.border,
                            color: colors.primary
                          }}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          PAID
                        </span>
                      ) : row.fee.status === 'PARTIAL' ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <AlertCircle className="w-2.5 h-2.5" />
                          PART
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <AlertCircle className="w-2.5 h-2.5" />
                          UNPAID
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => onOpenStudent && onOpenStudent(row.student._id)}
                        className="px-2 py-0.5 rounded text-[10px] font-medium border transition-all hover:scale-105"
                        style={{
                          backgroundColor: colors.bgSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary
                        }}
                      >
                        360° Profile
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
