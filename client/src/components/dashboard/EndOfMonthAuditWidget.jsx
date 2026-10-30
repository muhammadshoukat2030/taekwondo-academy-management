import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl">
      {/* Header & Month Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-600/10 text-red-500 border border-red-500/20">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                End-of-Month Audit & Closing Center
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-normal">
                  {monthName || 'Closing Audit'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Single unified audit grid comparing exact attendance ratios vs fee paid/baqaya for every student
              </p>
            </div>
          </div>
        </div>

        {/* Month/Year selector & Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Select Audit Month"
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select Audit Year"
              className="bg-transparent text-xs font-semibold text-red-400 focus:outline-none cursor-pointer border-l border-slate-800 pl-2"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Audit</span>
          </button>
        </div>
      </div>

      {/* Audit KPI Highlights */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 my-5">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Expected Billing</div>
            <div className="text-base font-bold text-white mt-1">PKR {summary.totalExpected.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{summary.totalStudentsCount} Students</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <div className="text-[11px] text-emerald-400 font-medium">Total Collected</div>
            <div className="text-base font-bold text-emerald-300 mt-1">PKR {summary.totalCollected.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">{summary.collectionRate}% Recovered</div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40">
            <div className="text-[11px] text-rose-400 font-medium">Pending Dues (Baqaya)</div>
            <div className="text-base font-bold text-rose-300 mt-1">PKR {summary.totalPending.toLocaleString()}</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">{summary.unpaidStudents + summary.partialStudents} Students</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-emerald-400 font-medium">Paid in Full</div>
            <div className="text-base font-bold text-white mt-1">{summary.paidStudents} Students</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cleared 100%</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-amber-400 font-medium">Partially Paid</div>
            <div className="text-base font-bold text-white mt-1">{summary.partialStudents} Students</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Token / Half fee</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-rose-400 font-medium">Defaulters (Unpaid)</div>
            <div className="text-base font-bold text-rose-400 mt-1">{summary.unpaidStudents} Students</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">0 PKR Paid</div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student or father name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Fee Filter:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['All', 'PAID', 'PARTIAL', 'UNPAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  statusFilter === st
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <th className="py-3 px-3">Student / Roll No</th>
              <th className="py-3 px-3">Belt Rank</th>
              <th className="py-3 px-3 text-center">Days Present</th>
              <th className="py-3 px-3 text-center">Days Absent</th>
              <th className="py-3 px-3 text-center">Attendance Ratio</th>
              <th className="py-3 px-3 text-center">Attendance %</th>
              <th className="py-3 px-3 text-right">Fee Billed</th>
              <th className="py-3 px-3 text-right">Fee Paid</th>
              <th className="py-3 px-3 text-right">Remaining Baqaya</th>
              <th className="py-3 px-3 text-center">Payment Status</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 text-red-500 animate-spin" />
                    <span>Loading Monthly Audit Data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400">
                  No student records matched the audit criteria for this month.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const beltColors = {
                  White: 'bg-slate-100 text-slate-900 border-slate-300',
                  Yellow: 'bg-yellow-400/20 text-yellow-300 border-yellow-500/40',
                  Green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  Blue: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                  Red: 'bg-red-500/20 text-red-300 border-red-500/40',
                  Black: 'bg-slate-950 text-amber-400 border-amber-500/50'
                };

                return (
                  <tr
                    key={row.student._id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {row.student.photo ? (
                          <img
                            src={row.student.photo}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                            {row.student.fullName[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">
                            {row.student.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            S/O {row.student.fatherName} • <span className="font-mono text-slate-300">{row.student.registrationNo}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          beltColors[row.student.currentBelt] || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {row.student.currentBelt} Belt
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-medium text-emerald-400">
                      {row.attendance.presentDays}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-medium text-rose-400">
                      {row.attendance.absentDays}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-200">
                      {row.attendance.attendanceRatio}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.attendance.attendancePercentage >= 75
                                ? 'bg-emerald-500'
                                : row.attendance.attendancePercentage >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, row.attendance.attendancePercentage)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200 text-[11px]">
                          {row.attendance.attendancePercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      PKR {row.fee.totalDue.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-400">
                      PKR {row.fee.paidAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {row.fee.remainingBalance > 0 ? (
                        <span className="text-rose-400">PKR {row.fee.remainingBalance.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-400">0</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {row.fee.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          PAID
                        </span>
                      ) : row.fee.status === 'PARTIAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3" />
                          PARTIAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          UNPAID
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onOpenStudent && onOpenStudent(row.student._id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
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
