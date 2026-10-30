import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  X,
  User,
  Calendar,
  CreditCard,
  Award,
  FileText,
  Printer,
  Camera,
  Fingerprint,
  ShieldCheck,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

export const StudentProfileModal = ({
  studentId,
  onClose,
  onPrintCertificate
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [feeLedgers, setFeeLedgers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);

  // Attendance calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentById(studentId);
      if (res.success && res.data) {
        setStudent(res.data.student);
        setFeeLedgers(res.data.feeLedgers || []);
        setAttendances(res.data.attendances || []);
        setAchievements(res.data.achievements || []);
        setCertificates(res.data.certificates || []);
        setFinancialSummary(res.data.financialSummary || null);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  if (!student && loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center gap-3 text-white">
          <Clock className="w-5 h-5 text-red-500 animate-spin" />
          <span>Loading 360° Student Dossier...</span>
        </div>
      </div>
    );
  }

  if (!student) return null;

  // Calendar helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthKey = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}`;
  const monthAttendances = attendances.filter(a => a.date && a.date.startsWith(currentMonthKey));
  const attendanceDateMap = new Map();
  monthAttendances.forEach(a => attendanceDateMap.set(a.date, a.status));

  const changeCalendarMonth = (offset) => {
    let newM = calendarMonth + offset;
    let newY = calendarYear;
    if (newM > 11) {
      newM = 0;
      newY++;
    } else if (newM < 0) {
      newM = 11;
      newY--;
    }
    setCalendarMonth(newM);
    setCalendarYear(newY);
  };

  const beltColors = {
    White: 'bg-slate-200 text-slate-900 border-slate-300',
    Yellow: 'bg-yellow-400 text-yellow-950 border-yellow-500',
    Green: 'bg-emerald-600 text-white border-emerald-500',
    Blue: 'bg-blue-600 text-white border-blue-500',
    Red: 'bg-red-600 text-white border-red-500',
    Black: 'bg-slate-950 text-amber-400 border-amber-500/80 shadow-md'
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="p-4 lg:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {student.photo ? (
              <img
                src={student.photo}
                alt=""
                className="w-12 h-12 rounded-2xl object-cover border-2 border-red-600 shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-red-600 flex items-center justify-center font-bold text-white text-lg">
                {student.fullName[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg lg:text-xl font-black text-white">
                  {student.fullName}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                    beltColors[student.currentBelt] || 'bg-slate-800 text-white'
                  }`}
                >
                  {student.currentBelt} Belt
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-semibold">
                  {student.registrationNo}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>S/O {student.fatherName}</span>
                <span>•</span>
                <span>{student.permanentAddress}</span>
                <span>•</span>
                <span className="font-mono text-amber-400">{student.phone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 px-4 lg:px-6 bg-slate-900 border-b border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'profile', label: '1. Profile & Biometrics', icon: User },
            { id: 'attendance', label: '2. Attendance History & Calendar', icon: Calendar },
            { id: 'ledger', label: '3. Financial Ledger & Baqaya', icon: CreditCard },
            { id: 'achievements', label: '4. Belt Grading & Medals', icon: Award },
            { id: 'certificates', label: '5. Issued Certificates', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-3 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-red-600 text-white bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="p-4 lg:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PROFILE & BIOMETRICS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ID Card Preview */}
              <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 border border-slate-700 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="text-[11px] font-black text-white uppercase tracking-wider">
                        AL MURTAZA SHAH TAEKWONDO
                      </div>
                      <div className="text-[9px] text-red-400">Student Identity Card • Kohat</div>
                    </div>
                    <span className="text-xl">🥋</span>
                  </div>

                  <div className="flex flex-col items-center text-center mt-4">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt=""
                        className="w-24 h-28 object-cover rounded-xl border-2 border-red-500 shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-28 bg-slate-800 rounded-xl border-2 border-red-500 flex items-center justify-center font-bold text-2xl">
                        {student.fullName[0]}
                      </div>
                    )}
                    <div className="font-bold text-white text-base mt-2">{student.fullName}</div>
                    <div className="text-xs text-slate-300">S/O {student.fatherName}</div>
                    <div className="mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-bold border border-slate-700 bg-slate-900 font-mono text-amber-400">
                      {student.registrationNo}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Belt Rank:</span>
                      <span className="font-bold text-white">{student.currentBelt} Belt</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date of Birth:</span>
                      <span>{new Date(student.dob).toLocaleDateString()} (Age: {student.age})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact:</span>
                      <span className="font-mono text-white">{student.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Admission:</span>
                      <span>{new Date(student.admissionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Instructor: M. H. Bangash</span>
                  <span className="text-red-400 font-semibold">Valid 2026/27</span>
                </div>
              </div>

              {/* Admission Record & Biometrics Status */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Biometric Authentication Security Status</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">AI Face Recognition</div>
                          <div className="text-[10px] text-slate-400">Webcam Neural Match</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          student.isFaceEnrolled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {student.isFaceEnrolled ? 'Enrolled' : 'Not Enrolled'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Fingerprint className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Fingerprint Biometrics</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {student.fingerprintTemplateId || 'FP-LINKED'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          student.isFingerprintEnrolled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {student.isFingerprintEnrolled ? 'Device Linked' : 'Standby'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Complete Admission Dossier
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase">Nationality / Cast</div>
                      <div className="font-semibold text-white mt-0.5">{student.nationalityCast || 'Pakistani'}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase">CNIC / Form-B</div>
                      <div className="font-mono font-semibold text-white mt-0.5">{student.cnicFormB || 'N/A'}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase">Education Level</div>
                      <div className="font-semibold text-white mt-0.5">{student.education || 'Matric'}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase">Monthly Fee Setting</div>
                      <div className="font-mono font-bold text-emerald-400 mt-0.5">PKR {student.fixedMonthlyFee}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase">Initial Admission Fee</div>
                      <div className="font-mono font-bold text-amber-400 mt-0.5">PKR {student.admissionFee}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase">Prior Sports Played</div>
                      <div className="font-semibold text-white mt-0.5">{student.hasPlayedBefore ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Medical & Health Notes</div>
                      <div className="text-white mt-0.5">
                        {student.hasIllnessInjury ? (
                          <span className="text-amber-400">{student.medicalNotes || 'Medical condition reported.'}</span>
                        ) : (
                          <span className="text-emerald-400">No known illness or injury. Medically cleared.</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">Guardian Signature</div>
                      <div className="text-amber-300 font-serif italic">{student.guardianSignature || 'Verified'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE HISTORY & CALENDAR */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Interactive Attendance Calendar</h3>
                      <p className="text-[11px] text-slate-400">Green = Present, Red = Absent, Yellow = Leave, Cyan = Late</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <button
                      onClick={() => changeCalendarMonth(-1)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-white min-w-32 text-center">
                      {monthNames[calendarMonth]} {calendarYear}
                    </span>
                    <button
                      onClick={() => changeCalendarMonth(1)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-14 rounded-xl bg-slate-900/30 border border-slate-900" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                      const status = attendanceDateMap.get(dateStr);

                      let bgClass = 'bg-slate-900/60 border-slate-800/80 text-slate-400';
                      let label = null;

                      if (status === 'Present') {
                        bgClass = 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950';
                        label = 'P';
                      } else if (status === 'Absent') {
                        bgClass = 'bg-rose-950/50 border-rose-500/50 text-rose-300';
                        label = 'A';
                      } else if (status === 'Leave') {
                        bgClass = 'bg-amber-950/50 border-amber-500/50 text-amber-300';
                        label = 'L';
                      } else if (status === 'Late') {
                        bgClass = 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300';
                        label = 'LT';
                      }

                      return (
                        <div
                          key={`day-${dayNum}`}
                          className={`h-14 p-1.5 rounded-xl border flex flex-col justify-between transition-all ${bgClass}`}
                        >
                          <span className="text-xs font-bold leading-none">{dayNum}</span>
                          {label ? (
                            <span className="text-[10px] font-black uppercase text-center py-0.5 rounded bg-black/40">
                              {status}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-600 text-center">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Lifetime Month-by-Month Attendance Audit
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Month / Year</th>
                        <th className="py-2.5 px-3 text-center">Days Present</th>
                        <th className="py-2.5 px-3 text-center">Days Absent</th>
                        <th className="py-2.5 px-3 text-center">Days Leave</th>
                        <th className="py-2.5 px-3 text-center">Attendance %</th>
                        <th className="py-2.5 px-3 text-center">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {Array.from(new Set(attendances.map(a => a.monthYear))).map((mYear) => {
                        const recs = attendances.filter(a => a.monthYear === mYear);
                        const p = recs.filter(a => a.status === 'Present').length;
                        const a = recs.filter(a => a.status === 'Absent').length;
                        const l = recs.filter(a => a.status === 'Leave').length;
                        const total = recs.length;
                        const pct = total > 0 ? Math.round((p / total) * 100) : 0;

                        return (
                          <tr key={mYear} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-semibold text-white font-mono">{mYear}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">{p}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-rose-400">{a}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-amber-400">{l}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold">
                              <span className={pct >= 75 ? 'text-emerald-400' : 'text-amber-400'}>
                                {pct}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                Closed ({p}/{total} Days)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETE FINANCIAL LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-6">
              {financialSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase">Lifetime Total Billed</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      PKR {financialSummary.totalBilled.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                    <span className="text-[11px] text-emerald-400 uppercase">Lifetime Total Paid</span>
                    <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                      PKR {financialSummary.totalPaid.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40">
                    <span className="text-[11px] text-rose-400 uppercase">Total Remaining Baqaya</span>
                    <div className="text-xl font-bold font-mono text-rose-300 mt-1">
                      PKR {financialSummary.totalRemaining.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Lifetime Monthly Fee Ledger</h3>
                    <p className="text-[11px] text-slate-400">Complete record of every month's dues, payments, and balance carry-over</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-3">Billing Month</th>
                        <th className="py-3 px-3 text-right">Monthly Fee</th>
                        <th className="py-3 px-3 text-right">Admission Fee</th>
                        <th className="py-3 px-3 text-right">Previous Arrears</th>
                        <th className="py-3 px-3 text-right">Total Payable</th>
                        <th className="py-3 px-3 text-right">Paid Amount</th>
                        <th className="py-3 px-3 text-right">Remaining Baqaya</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-center">Last Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-sans">
                      {feeLedgers.map((l) => (
                        <tr key={l._id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3 font-semibold text-white font-mono">
                            {l.monthName || l.monthYear}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            PKR {l.monthlyFee}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            PKR {l.admissionFee || 0}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-400">
                            PKR {l.previousBalance || 0}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">
                            PKR {l.totalDue}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                            PKR {l.paidAmount}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            {l.remainingBalance > 0 ? (
                              <span className="text-rose-400">PKR {l.remainingBalance}</span>
                            ) : (
                              <span className="text-emerald-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {l.status === 'PAID' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                PAID
                              </span>
                            ) : l.status === 'PARTIAL' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                PARTIAL
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                UNPAID
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                            {l.lastPaymentDate ? new Date(l.lastPaymentDate).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BELT GRADING & ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Belt Promotion History & Tournament Honors</h3>
                    <p className="text-[11px] text-slate-400">Official timeline accredited by Khyber Pakhtunkhwa Taekwondo Association</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {achievements.map((ach) => (
                    <div key={ach._id} className="relative group">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-slate-950 group-hover:scale-125 transition" />
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{ach.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(ach.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {ach.beltPromotedTo && (
                            <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-blue-300 text-[10px] font-semibold">
                              Promoted to: {ach.beltPromotedTo}
                            </span>
                          )}
                          {ach.medal && ach.medal !== 'None' && (
                            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                              🏅 {ach.medal} Medal
                            </span>
                          )}
                        </div>
                        {ach.remarks && (
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {ach.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ISSUED CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Federation Official Issued Certificates</h3>
                    <p className="text-[11px] text-slate-400">Signed certificates ready for 1-click re-print or landscape download</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-slate-400">
                      No certificates issued yet for this student. Use the Federation Certificate module to issue one.
                    </div>
                  ) : (
                    certificates.map((cert) => (
                      <div
                        key={cert._id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold font-mono text-red-400">
                              {cert.certificateNo}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {cert.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-2">
                            {cert.beltLevel || cert.beltRank} Certification
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {cert.citationText}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-2">
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Signatory: Murtaza Hassan Bangash</span>
                          <button
                            onClick={() => onPrintCertificate && onPrintCertificate(cert)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Re-print Certificate</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
