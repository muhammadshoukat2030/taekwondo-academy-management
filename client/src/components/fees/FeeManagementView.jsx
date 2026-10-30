import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { DualSlipReceipt } from './DualSlipReceipt.jsx';
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
    <div className="space-y-6">
      {/* Top Banner & Automated Billing Engine Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 lg:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white">
              Fee Management & Dual-Slip Receipt Desk
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated monthly ledger billing, arrears carry-forward, instant dual-copy perforated receipt printing
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateMonthlyDues}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-950 transition"
            title="Automatically generate dues for all active students and carry over Baqaya"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Run Monthly Billing Engine</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('collection')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'collection'
              ? 'bg-red-600 text-white shadow-md shadow-red-950'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Fee Collection & Receipt Maker</span>
        </button>

        <button
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'defaulters'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Defaulter List ({defaulters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'receipts'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Receipts Archive ({receipts.length})</span>
        </button>
      </div>

      {/* TAB 1: FEE COLLECTION & DUAL-SLIP GENERATOR */}
      {activeTab === 'collection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCollectFee} className="lg:col-span-2 p-5 lg:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Collect Fee & Issue Dual-Part Receipt</span>
              <span className="text-[10px] text-emerald-400 font-mono">RECEIPT #100+ ENGINE</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Enrolled Student *
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
              >
                <option value="">-- Choose Student from Kohat Registry --</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.fullName} S/O {st.fatherName} ({st.registrationNo}) - {st.currentBelt} Belt
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Student Name:</span>
                  <div className="font-bold text-white truncate">{selectedStudent.fullName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Father Name:</span>
                  <div className="text-slate-200 truncate">{selectedStudent.fatherName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Cell / Phone:</span>
                  <div className="font-mono text-amber-400 truncate">{selectedStudent.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Address:</span>
                  <div className="text-slate-300 truncate">{selectedStudent.permanentAddress}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Academy Fee (PKR)
                </label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admission Fee (if new)
                </label>
                <input
                  type="number"
                  value={admissionFee}
                  onChange={(e) => setAdmissionFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Previous Arrears / Baqaya
                </label>
                <input
                  type="number"
                  value={previousArrears}
                  onChange={(e) => setPreviousArrears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-rose-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Total Payable Amount:</span>
                <p className="text-[10px] text-slate-500">Monthly + Admission + Carried Arrears</p>
              </div>
              <span className="text-xl font-black font-mono text-white">
                PKR {totalPayable.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">
                  Amount Received (PKR) *
                </label>
                <input
                  type="number"
                  required
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-emerald-950/30 border-2 border-emerald-600/80 text-base font-mono font-black text-emerald-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-400 mb-1 uppercase tracking-wider">
                  Calculated Remaining Baqaya (PKR)
                </label>
                <div className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base font-mono font-black text-rose-400">
                  PKR {calculatedRemainingBalance.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                >
                  <option value="Cash">Cash (نقدی)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Authorized Collector / Instructor
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Instantly prints physical dual-part perforated slip
              </span>
              <button
                type="submit"
                disabled={loading || !selectedStudentId}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>Confirm & Print Dual Receipt</span>
              </button>
            </div>
          </form>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Receipt Guidelines & Academy Policy
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block">Dual Copy Requirement:</span>
                <p className="text-[11px] text-slate-400">
                  Left side is filed in Academy Records; Right side is handed to student/guardian along with the instructor stamp.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">Carry-Forward Logic:</span>
                <p className="text-[11px] text-slate-400">
                  Any unpaid Baqaya automatically accumulates into the student's next monthly billing cycle until zeroed out.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEFAULTER LIST */}
      {activeTab === 'defaulters' && (
        <div className="p-5 lg:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Academy Defaulters & Pending Dues List</h3>
              <p className="text-xs text-slate-400 mt-0.5">Students with unpaid or partial fees with direct 1-click WhatsApp reminders</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter defaulters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['ALL', 'PARTIAL', 'UNPAID'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDefaulterFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      defaulterFilter === f ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Father Name</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Belt Rank</th>
                  <th className="py-3 px-3 text-right">Fee Billed</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Pending Baqaya</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">1-Click Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {filteredDefaulters.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No defaulters matching your filter!
                    </td>
                  </tr>
                ) : (
                  filteredDefaulters.map((d) => {
                    const st = d.student;
                    if (!st) return null;
                    return (
                      <tr key={d._id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-semibold text-white">{st.fullName}</td>
                        <td className="py-3 px-3 text-slate-300">{st.fatherName}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{st.registrationNo}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {st.currentBelt}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">PKR {d.totalDue}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400">PKR {d.paidAmount}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                          PKR {d.remainingBalance}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.status === 'PARTIAL'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => sendWhatsAppReminder(d)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 shadow-sm"
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
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700"
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
        <div className="p-5 lg:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Issued Fee Receipts Archive</h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any receipt to view or re-print the dual-part physical replica slip</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Receipt No</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Father Name</th>
                  <th className="py-3 px-3 text-right">Received Amount</th>
                  <th className="py-3 px-3 text-right">Balance Baqaya</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {receipts.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-red-400">#{r.receiptNo}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{r.studentName}</td>
                    <td className="py-3 px-3 text-slate-300">{r.fatherName}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      PKR {r.amountReceived !== undefined ? r.amountReceived : r.receivedAmount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                      PKR {r.remainingBalance !== undefined ? r.remainingBalance : r.balanceRemaining}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{r.paymentMethod}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setActiveReceipt(r)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 mx-auto"
                      >
                        <Printer className="w-3 h-3 text-cyan-400" />
                        <span>Print Dual Slip</span>
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
