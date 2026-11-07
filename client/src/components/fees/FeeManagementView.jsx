import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { DualSlipReceipt } from './DualSlipReceipt.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  CreditCard,
  AlertTriangle,
  Receipt,
  MessageSquare,
  Sparkles,
  Printer,
  Search,
  PlusCircle
} from 'lucide-react';

export const FeeManagementView = ({
  initialStudentId,
  onOpenStudentProfile
}) => {
  const { colors, theme, mode } = useTheme();
  const [activeTab, setActiveTab] = useState('collection');
  const [students, setStudents] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Fee Collection Form State
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || '');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [monthlyFee, setMonthlyFee] = useState(1000);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [previousArrears, setPreviousArrears] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [receivedBy, setReceivedBy] = useState('Instructor Murtaza Hassan Bangash');
  const [feeNotes, setFeeNotes] = useState('Monthly academy fee');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [defaulterFilter, setDefaulterFilter] = useState('ALL');

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsRes, defaultersRes, receiptsRes] = await Promise.all([
        api.getStudents({ status: 'Active' }),
        api.getDefaulters(),
        api.getFees()
      ]);

      if (studentsRes.success) setStudents(studentsRes.data);
      if (defaultersRes.success) setDefaulters(defaultersRes.data);
      if (receiptsRes.success) setReceipts(receiptsRes.data);
    } catch (err) {
      console.error('Error fetching fee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const found = students.find(s => s._id === selectedStudentId);
      if (found) {
        setSelectedStudent(found);
        setMonthlyFee(found.fixedMonthlyFee || 1000);

        const def = defaulters.find(d => {
          const sObj = d.student;
          return sObj && (sObj._id === found._id || sObj === found._id);
        });

        if (def && def.remainingBalance > 0) {
          setPreviousArrears(def.previousBalance || 0);
          setReceivedAmount(def.totalDue);
        } else {
          setPreviousArrears(0);
          setReceivedAmount(found.fixedMonthlyFee || 1000);
        }
      }
    }
  }, [selectedStudentId, students, defaulters]);

  const totalPayable = (monthlyFee || 0) + (admissionFee || 0) + (previousArrears || 0);
  const calculatedRemainingBalance = Math.max(0, totalPayable - (receivedAmount || 0));

  const handleGenerateMonthlyDues = async () => {
    try {
      setLoading(true);
      const res = await api.generateMonthlyDues();
      if (res.success) {
        alert(res.message);
        loadInitialData();
      }
    } catch (err) {
      console.error('Billing error:', err);
      alert('Failed to run automated monthly billing engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectFee = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Please select a student first.');
      return;
    }
    if (receivedAmount <= 0) {
      alert('Please enter a valid received amount.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.collectFee({
        studentId: selectedStudentId,
        amountReceived: receivedAmount,
        receivedAmount,
        paymentMethod,
        receivedBy,
        notes: feeNotes
      });

      if (res.success && res.receipt) {
        setActiveReceipt(res.receipt);
        loadInitialData();
      } else {
        alert(res.message || 'Error collecting fee');
      }
    } catch (err) {
      console.error('Collect fee error:', err);
      alert('Failed to process fee collection.');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppReminder = (ledger) => {
    const student = ledger.student;
    if (!student || !student.phone) {
      alert('No phone number on record for this student.');
      return;
    }

    const cleanPhone = student.whatsapp || student.phone;
    const internationalPhone = cleanPhone.startsWith('0')
      ? '92' + cleanPhone.slice(1).replace(/[^0-9]/g, '')
      : cleanPhone.replace(/[^0-9]/g, '');

    const message = `السلام علیکم محترم والد صاحب (${student.fatherName})،\n` +
      `المurtضٰی شاہ تائیکوانڈو اکیڈمی کوہاٹ کی طرف سے اطلاع ہے کہ طالبعلم ${student.fullName} کی ماہانہ فیس برائے ${ledger.monthName || 'Current Month'} بقایا ہے:\n` +
      `• واجب الادا بقایا فیس: PKR ${ledger.remainingBalance}\n` +
      `• آخری تاریخ: 10 تاریخ\n` +
      `برائے مہربانی اکیڈمی آفس (عبدالرحمن پلازہ چنگی نمبر 7 کوہاٹ) میں فیس جمع کروائیں۔ شکریہ!\n` +
      `رابطہ: 0335-9117230`;

    const url = `https://api.whatsapp.com/send?phone=${internationalPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const filteredDefaulters = defaulters.filter((d) => {
    const s = d.student;
    if (!s) return false;
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registrationNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = defaulterFilter === 'ALL' || d.status === defaulterFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner & Automated Billing Engine Trigger */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 lg:p-4 rounded-xl border shadow-sm transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className="p-1.5 rounded-lg border flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300"
            >
              <CreditCard className="w-4 h-4" />
            </span>
            <h1
              className="text-[20px] sm:text-[22px] font-bold tracking-tight"
              style={{ color: colors.textHeading }}
            >
              Fee Management & Receipts
            </h1>
          </div>
          <p
            className="text-[12px] sm:text-[13px] font-normal mt-0.5 leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Monthly fee collection, baqaya arrears tracking, WhatsApp alerts, and dual-slip printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateMonthlyDues}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg text-white text-[12.5px] font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm transition cursor-pointer"
            title="Automatically generate dues for all active students and carry over Baqaya"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Monthly Dues</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b pb-2.5 border-slate-300 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('collection')}
          className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
          style={{
            backgroundColor: activeTab === 'collection' ? '#2563EB' : (mode === 'dark' ? '#1E2D43' : '#FFFFFF'),
            color: activeTab === 'collection' ? '#FFFFFF' : (mode === 'dark' ? '#D7E0EC' : '#334155'),
            border: activeTab === 'collection' ? '1px solid #2563EB' : '1px solid ' + colors.border
          }}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Collect Fee</span>
        </button>

        <button
          onClick={() => setActiveTab('defaulters')}
          className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
          style={{
            backgroundColor: activeTab === 'defaulters' ? '#DC2626' : (mode === 'dark' ? '#1E2D43' : '#FFFFFF'),
            color: activeTab === 'defaulters' ? '#FFFFFF' : (mode === 'dark' ? '#D7E0EC' : '#334155'),
            border: activeTab === 'defaulters' ? '1px solid #DC2626' : '1px solid ' + colors.border
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Defaulters ({defaulters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
          style={{
            backgroundColor: activeTab === 'receipts' ? '#2563EB' : (mode === 'dark' ? '#1E2D43' : '#FFFFFF'),
            color: activeTab === 'receipts' ? '#FFFFFF' : (mode === 'dark' ? '#D7E0EC' : '#334155'),
            border: activeTab === 'receipts' ? '1px solid #2563EB' : '1px solid ' + colors.border
          }}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Receipts Archive ({receipts.length})</span>
        </button>
      </div>

      {/* TAB 1: FEE COLLECTION & DUAL-SLIP GENERATOR */}
      {activeTab === 'collection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form
            onSubmit={handleCollectFee}
            className="lg:col-span-2 p-3.5 lg:p-4 rounded-xl border shadow-sm space-y-3 transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <h3 className="text-[13.5px] font-semibold pb-2 border-b flex items-center justify-between tracking-tight" style={{ borderColor: colors.border, color: colors.textPrimary }}>
              <span>Collect Fee & Issue Dual-Part Receipt</span>
              <span className="text-[10.5px] font-mono-numbers font-medium" style={{ color: colors.primary }}>RECEIPT #100+ ENGINE</span>
            </h3>

            <div>
              <label className="block text-[11.5px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                Select Enrolled Student *
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border text-[12.5px] focus:outline-none font-medium transition"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              >
                <option value="">-- Choose Student from Kohat Registry --</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id} style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
                    {st.fullName} S/O {st.fatherName} ({st.registrationNo}) - {st.currentBelt} Belt
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div
                className="p-2.5 rounded-lg border grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div>
                  <span className="text-[10px] uppercase font-medium" style={{ color: colors.textMuted }}>Student Name:</span>
                  <div className="font-semibold truncate text-[12.5px]" style={{ color: colors.textPrimary }}>{selectedStudent.fullName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-medium" style={{ color: colors.textMuted }}>Father Name:</span>
                  <div className="truncate text-[12px]" style={{ color: colors.textSecondary }}>{selectedStudent.fatherName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-medium" style={{ color: colors.textMuted }}>Cell / Phone:</span>
                  <div className="font-mono-numbers font-medium text-amber-500 truncate text-[12px]">{selectedStudent.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-medium" style={{ color: colors.textMuted }}>Address:</span>
                  <div className="truncate text-[12px]" style={{ color: colors.textSecondary }}>{selectedStudent.permanentAddress}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11.5px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Monthly Academy Fee (PKR)
                </label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-[13px] font-mono-numbers font-semibold focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Admission Fee (if new)
                </label>
                <input
                  type="number"
                  value={admissionFee}
                  onChange={(e) => setAdmissionFee(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-[13px] font-mono-numbers font-semibold focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Previous Arrears / Baqaya
                </label>
                <input
                  type="number"
                  value={previousArrears}
                  onChange={(e) => setPreviousArrears(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-[13px] font-mono-numbers font-semibold text-rose-500 focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border
                  }}
                />
              </div>
            </div>

            <div
              className="p-2.5 rounded-lg border flex items-center justify-between"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border
              }}
            >
              <div>
                <span className="text-[11.5px] font-medium" style={{ color: colors.textSecondary }}>Total Payable Amount:</span>
                <p className="text-[10px] font-normal" style={{ color: colors.textMuted }}>Monthly + Admission + Carried Arrears</p>
              </div>
              <span className="text-[17px] font-semibold font-mono-numbers tabular-nums" style={{ color: colors.textPrimary }}>
                PKR {totalPayable.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              <div>
                <label className="block text-[11.5px] font-semibold mb-1 uppercase tracking-wider" style={{ color: colors.primary }}>
                  Amount Received (PKR) *
                </label>
                <input
                  type="number"
                  required
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border-2 text-[14px] font-mono-numbers font-semibold focus:outline-none"
                  style={{
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.primary,
                    color: colors.primary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold mb-1 uppercase tracking-wider text-rose-500">
                  Calculated Remaining Baqaya (PKR)
                </label>
                <div
                  className="w-full px-2.5 py-1.5 rounded-lg border text-[14px] font-mono-numbers font-semibold text-rose-500 flex items-center"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border
                  }}
                >
                  PKR {calculatedRemainingBalance.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                >
                  <option value="Cash">Cash (نقدی)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Authorized Collector / Instructor
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: colors.border }}>
              <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                Instantly prints physical dual-part perforated slip
              </span>
              <button
                type="submit"
                disabled={loading || !selectedStudentId}
                className="px-4 py-2 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition hover:scale-102 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: colors.primary }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Confirm & Print Dual Receipt</span>
              </button>
            </div>
          </form>

          <div
            className="p-3.5 lg:p-4 rounded-xl border shadow-sm space-y-3 transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <h3 className="text-xs font-bold pb-2 border-b" style={{ borderColor: colors.border, color: colors.textPrimary }}>
              Receipt Guidelines & Academy Policy
            </h3>

            <div className="space-y-2.5 text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
              <div
                className="p-2.5 rounded-lg border space-y-0.5"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <span className="font-bold text-amber-500 block text-[11px]">Dual Copy Requirement:</span>
                <p className="text-[10.5px]" style={{ color: colors.textSecondary }}>
                  Left side is filed in Academy Records; Right side is handed to student/guardian along with the instructor stamp.
                </p>
              </div>

              <div
                className="p-2.5 rounded-lg border space-y-0.5"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <span className="font-bold block text-[11px]" style={{ color: colors.primary }}>Carry-Forward Logic:</span>
                <p className="text-[10.5px]" style={{ color: colors.textSecondary }}>
                  Any unpaid Baqaya automatically accumulates into the student's next monthly billing cycle until zeroed out.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEFAULTER LIST */}
      {activeTab === 'defaulters' && (
        <div
          className="p-3.5 lg:p-4 rounded-xl border shadow-sm space-y-3 transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: colors.border }}>
            <div>
              <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Academy Defaulters & Pending Dues List</h3>
              <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>Students with unpaid or partial fees with direct 1-click WhatsApp reminders</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2" style={{ color: colors.textMuted }} />
                <input
                  type="text"
                  placeholder="Filter defaulters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div
                className="flex items-center p-0.5 rounded-lg border text-xs"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                {['ALL', 'PARTIAL', 'UNPAID'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDefaulterFilter(f)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium transition"
                    style={{
                      backgroundColor: defaulterFilter === f ? '#EF4444' : 'transparent',
                      color: defaulterFilter === f ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: defaulterFilter === f ? 'bold' : 'normal'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border w-full border-slate-300 dark:border-slate-700">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead>
                <tr
                  className="uppercase text-[11px] font-bold border-b border-slate-300 dark:border-slate-700"
                  style={{ backgroundColor: colors.bgSecondary, color: colors.textHeading }}
                >
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-2.5">Father Name</th>
                  <th className="py-2.5 px-2.5">Roll No</th>
                  <th className="py-2.5 px-2.5">Belt Rank</th>
                  <th className="py-2.5 px-2.5 text-right">Fee Billed</th>
                  <th className="py-2.5 px-2.5 text-right">Paid</th>
                  <th className="py-2.5 px-2.5 text-right">Pending Baqaya</th>
                  <th className="py-2.5 px-2.5 text-center">Status</th>
                  <th className="py-2.5 px-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans" style={{ backgroundColor: colors.bgCard }}>
                {filteredDefaulters.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No defaulters matching your filter!
                    </td>
                  </tr>
                ) : (
                  filteredDefaulters.map((d) => {
                    const st = d.student;
                    if (!st) return null;
                    return (
                      <tr key={d._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                        <td className="py-2 px-3 font-semibold text-xs" style={{ color: colors.textHeading }}>{st.fullName}</td>
                        <td className="py-2 px-2.5 text-[11.5px] font-normal" style={{ color: colors.textSecondary }}>{st.fatherName}</td>
                        <td className="py-2 px-2.5 font-mono font-medium text-[11px] text-blue-700 dark:text-blue-300">{st.registrationNo}</td>
                        <td className="py-2 px-2.5">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                          >
                            {st.currentBelt}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-medium text-xs" style={{ color: colors.textPrimary }}>PKR {d.totalDue}</td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">PKR {d.paidAmount}</td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-xs text-rose-700 dark:text-rose-400">
                          PKR {d.remainingBalance}
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              d.status === 'PARTIAL'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-400'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-400'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => sendWhatsAppReminder(d)}
                              className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                              title="Send pre-filled Urdu/English WhatsApp reminder"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedStudentId(st._id);
                                setActiveTab('collection');
                              }}
                              className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              Collect
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RECEIPTS ARCHIVE */}
      {activeTab === 'receipts' && (
        <div
          className="p-3.5 lg:p-4 rounded-xl border shadow-sm space-y-3 transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: colors.border }}>
            <div>
              <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Issued Fee Receipts Archive</h3>
              <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>Click any receipt to view or re-print the dual-part physical replica slip</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border w-full" style={{ borderColor: colors.border }}>
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead>
                <tr
                  className="uppercase text-[9.5px] border-b"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                    color: colors.textSecondary
                  }}
                >
                  <th className="py-2 px-2.5">Receipt No</th>
                  <th className="py-2 px-2.5">Date</th>
                  <th className="py-2 px-2.5">Student Name</th>
                  <th className="py-2 px-2.5">Father Name</th>
                  <th className="py-2 px-2.5 text-right">Received Amount</th>
                  <th className="py-2 px-2.5 text-right">Balance Baqaya</th>
                  <th className="py-2 px-2.5">Payment Method</th>
                  <th className="py-2 px-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y font-sans" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                {receipts.map((r) => (
                  <tr key={r._id} className="hover:opacity-90">
                    <td className="py-2 px-2.5 font-mono font-bold text-xs" style={{ color: colors.primary }}>#{r.receiptNo}</td>
                    <td className="py-2 px-2.5 font-mono text-[11px]" style={{ color: colors.textMuted }}>
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2.5 font-semibold text-xs" style={{ color: colors.textPrimary }}>{r.studentName}</td>
                    <td className="py-2 px-2.5 text-[11px]" style={{ color: colors.textSecondary }}>{r.fatherName}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-xs" style={{ color: colors.primary }}>
                      PKR {r.amountReceived !== undefined ? r.amountReceived : r.receivedAmount}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-xs text-rose-500">
                      PKR {r.remainingBalance !== undefined ? r.remainingBalance : r.balanceRemaining}
                    </td>
                    <td className="py-2 px-2.5 text-[11px]" style={{ color: colors.textSecondary }}>{r.paymentMethod}</td>
                    <td className="py-2 px-2.5 text-center">
                      <button
                        onClick={() => setActiveReceipt(r)}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium border flex items-center gap-1 mx-auto transition hover:scale-102"
                        style={{
                          backgroundColor: colors.bgSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary
                        }}
                      >
                        <Printer className="w-3 h-3 text-cyan-500" />
                        <span>Print Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DUAL SLIP PRINT PREVIEW MODAL */}
      {activeReceipt && (
        <DualSlipReceipt receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
};
