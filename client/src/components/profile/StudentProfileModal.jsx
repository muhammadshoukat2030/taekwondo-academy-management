import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EditStudentModal } from './EditStudentModal.jsx';
import { ProfileModalSkeleton } from '../common/Skeleton.jsx';
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
  Clock,
  Edit2,
  Power,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const StudentProfileModal = ({
  studentId,
  onClose,
  onPrintCertificate,
  onOpenReceipt,
  onStudentUpdated
}) => {
  const { colors, theme, mode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [feeLedgers, setFeeLedgers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);

  // Edit Modal & Status State
  const [isEditing, setIsEditing] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

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

  const handleToggleStatus = async () => {
    if (!student) return;
    const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    const confirmText = newStatus === 'Inactive'
      ? `Mark ${student.fullName} as INACTIVE?\n\n• Student will be excluded from attendance marking.\n• All previous attendance & fee records remain safe.`
      : `Reactivate ${student.fullName}?\n\n• Student will be immediately eligible for attendance scanning.`;
    if (!window.confirm(confirmText)) return;

    try {
      setStatusUpdating(true);
      const res = await api.updateStudent(student._id, { status: newStatus });
      if (res.success) {
        const updated = { ...student, status: newStatus };
        setStudent(updated);
        if (onStudentUpdated) onStudentUpdated(updated);
      } else {
        alert(res.message || 'Failed to update student status');
      }
    } catch (err) {
      console.error('Error toggling student status:', err);
      alert(err.response?.data?.message || err.message || 'Error updating status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleEditSuccess = (updatedData) => {
    setStudent(prev => ({ ...prev, ...updatedData }));
    setIsEditing(false);
    if (onStudentUpdated) onStudentUpdated(updatedData);
    fetchStudentData();
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  if (!student && loading) {
    return <ProfileModalSkeleton onClose={onClose} />;
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
    White: mode === 'dark' ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-100 text-slate-800 border-slate-300',
    Yellow: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/40',
    Green: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
    Blue: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40',
    Red: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40',
    Black: 'bg-slate-900 text-amber-400 border-amber-500/80 shadow-md'
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className="border rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        {/* Modal Top Bar */}
        <div
          className="p-3 sm:p-3.5 border-b flex flex-wrap items-center justify-between gap-2.5"
          style={{
            backgroundColor: colors.bgSecondary,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center gap-2.5">
            {student.photo ? (
              <img
                src={student.photo}
                alt=""
                className="w-10 h-10 rounded-xl object-cover border-2 shadow-sm"
                style={{ borderColor: colors.primary }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-base"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.primary,
                  color: colors.textPrimary
                }}
              >
                {student.fullName[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] sm:text-[19px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                  {student.fullName}
                </h2>
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${
                    beltColors[student.currentBelt] || 'border-current'
                  }`}
                >
                  {student.currentBelt} Belt
                </span>
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded border font-mono-numbers font-medium"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  {student.registrationNo}
                </span>

                {/* Status Badge */}
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center gap-1 ${
                    student.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {student.status || 'Active'}
                </span>
              </div>
              <div className="text-[12.5px] font-normal flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5" style={{ color: colors.textSecondary }}>
                <span>S/O {student.fatherName}</span>
                <span>•</span>
                <span className="truncate max-w-[180px] sm:max-w-none">{student.permanentAddress}</span>
                <span>•</span>
                <span className="font-mono-numbers text-amber-500 font-medium">{student.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Status Toggle */}
            <button
              onClick={handleToggleStatus}
              disabled={statusUpdating}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition ${
                student.status === 'Active'
                  ? 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                  : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
              }`}
            >
              {statusUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
              <span>{student.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
            </button>

            {/* Edit Student Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition hover:scale-105"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
                color: colors.textPrimary
              }}
            >
              <Edit2 className="w-3 h-3" style={{ color: colors.primary }} />
              <span>Edit Details</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border transition hover:opacity-80"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div
          className="flex items-center gap-1 px-3 border-b overflow-x-auto text-xs"
          style={{
            backgroundColor: colors.bgSecondary,
            borderColor: colors.border
          }}
        >
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
                className="py-2.5 px-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap text-[11.5px]"
                style={{
                  borderBottomColor: isActive ? colors.primary : 'transparent',
                  color: isActive ? colors.primary : colors.textSecondary,
                  backgroundColor: isActive ? colors.badgeBg : 'transparent'
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? colors.primary : colors.textMuted }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="p-3.5 lg:p-4 overflow-y-auto flex-1 space-y-4" style={{ backgroundColor: colors.bgCard }}>
          {/* TAB 1: PROFILE & BIOMETRICS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* ID Card Preview */}
              <div
                className="lg:col-span-1 p-4 rounded-xl border shadow-sm flex flex-col justify-between"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: colors.border }}>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                        AL MURTAZA SHAH TAEKWONDO
                      </div>
                      <div className="text-[9px]" style={{ color: colors.primary }}>Student Identity Card • Kohat</div>
                    </div>
                    <span className="text-base">🥋</span>
                  </div>

                  <div className="flex flex-col items-center text-center mt-3">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt=""
                        className="w-20 h-24 object-cover rounded-lg border-2 shadow-sm"
                        style={{ borderColor: colors.primary }}
                      />
                    ) : (
                      <div
                        className="w-20 h-24 rounded-lg border-2 flex items-center justify-center font-bold text-xl"
                        style={{ backgroundColor: colors.bgCard, borderColor: colors.primary, color: colors.textPrimary }}
                      >
                        {student.fullName[0]}
                      </div>
                    )}
                    <div className="font-bold text-sm mt-1.5" style={{ color: colors.textPrimary }}>{student.fullName}</div>
                    <div className="text-[11px]" style={{ color: colors.textSecondary }}>S/O {student.fatherName}</div>
                    <div
                      className="mt-1 inline-block px-2.5 py-0.2 rounded-full text-[10px] font-bold border font-mono"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderColor: colors.border,
                        color: colors.primary
                      }}
                    >
                      {student.registrationNo}
                    </div>
                  </div>

                  <div
                    className="mt-3 pt-2.5 border-t text-[11px] space-y-1"
                    style={{
                      borderColor: colors.border,
                      color: colors.textSecondary
                    }}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: colors.textMuted }}>Belt Rank:</span>
                      <span className="font-bold" style={{ color: colors.textPrimary }}>{student.currentBelt} Belt</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textMuted }}>DOB:</span>
                      <span style={{ color: colors.textPrimary }}>{new Date(student.dob).toLocaleDateString()} (Age: {student.age})</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textMuted }}>Contact:</span>
                      <span className="font-mono" style={{ color: colors.textPrimary }}>{student.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textMuted }}>Admission:</span>
                      <span style={{ color: colors.textPrimary }}>{new Date(student.admissionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-3 pt-2 border-t flex items-center justify-between text-[9.5px]"
                  style={{
                    borderColor: colors.border,
                    color: colors.textMuted
                  }}
                >
                  <span>Instructor: M. H. Bangash</span>
                  <span className="font-semibold" style={{ color: colors.primary }}>Valid 2026/27</span>
                </div>
              </div>

              {/* Admission Record & Biometrics Status */}
              <div className="lg:col-span-2 space-y-3">
                <div
                  className="p-3.5 rounded-xl border"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border
                  }}
                >
                  <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: colors.textPrimary }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                    <span>Biometric Authentication Security Status</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div
                      className="p-2.5 rounded-lg border flex items-center justify-between"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderColor: colors.border
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-indigo-500/15 text-indigo-500">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold" style={{ color: colors.textPrimary }}>Face AI</div>
                          <div className="text-[9.5px]" style={{ color: colors.textMuted }}>Neural Match</div>
                        </div>
                      </div>
                      <span
                        className="text-[9.5px] font-bold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: student.isFaceEnrolled ? colors.badgeBg : 'rgba(239, 68, 68, 0.1)',
                          borderColor: student.isFaceEnrolled ? colors.border : 'rgba(239, 68, 68, 0.3)',
                          color: student.isFaceEnrolled ? colors.primary : '#EF4444'
                        }}
                      >
                        {student.isFaceEnrolled ? 'Enrolled' : 'Pending'}
                      </span>
                    </div>

                    <div
                      className="p-2.5 rounded-lg border flex items-center justify-between"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderColor: colors.border
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md" style={{ backgroundColor: colors.badgeBg, color: colors.primary }}>
                          <Fingerprint className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold" style={{ color: colors.textPrimary }}>Fingerprint</div>
                          <div className="text-[9.5px] font-mono" style={{ color: colors.textMuted }}>
                            {student.fingerprintTemplateId || 'FP-LINKED'}
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-[9.5px] font-bold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: student.isFingerprintEnrolled ? colors.badgeBg : 'rgba(245, 158, 11, 0.1)',
                          borderColor: student.isFingerprintEnrolled ? colors.border : 'rgba(245, 158, 11, 0.3)',
                          color: student.isFingerprintEnrolled ? colors.primary : '#F59E0B'
                        }}
                      >
                        {student.isFingerprintEnrolled ? 'Linked' : 'Standby'}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-xl border text-[11px] space-y-2.5"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border
                  }}
                >
                  <h3 className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textPrimary }}>
                    Complete Admission Dossier
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                      <div className="text-[9.5px] uppercase" style={{ color: colors.textMuted }}>Nationality</div>
                      <div className="font-semibold mt-0.5 truncate" style={{ color: colors.textPrimary }}>{student.nationalityCast || 'Pakistani'}</div>
                    </div>
                    <div className="p-2 rounded-lg border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                      <div className="text-[9.5px] uppercase" style={{ color: colors.textMuted }}>CNIC / Form-B</div>
                      <div className="font-mono font-semibold mt-0.5 truncate" style={{ color: colors.textPrimary }}>{student.cnicFormB || 'N/A'}</div>
                    </div>
                    <div className="p-2 rounded-lg border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                      <div className="text-[9.5px] uppercase" style={{ color: colors.textMuted }}>Education</div>
                      <div className="font-semibold mt-0.5 truncate" style={{ color: colors.textPrimary }}>{student.education || 'Matric'}</div>
                    </div>
                    <div className="p-2 rounded-lg border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                      <div className="text-[9.5px] uppercase" style={{ color: colors.textMuted }}>Monthly Fee</div>
                      <div className="font-mono font-bold mt-0.5" style={{ color: colors.primary }}>PKR {student.fixedMonthlyFee}</div>
                    </div>
                    <div className="p-2 rounded-lg border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                      <div className="text-[9.5px] uppercase" style={{ color: colors.textMuted }}>Admission Fee</div>
                      <div className="font-mono font-bold mt-0.5 text-amber-500">PKR {student.admissionFee}</div>
                    </div>
                    <div className="p-2 rounded-lg border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                      <div className="text-[9.5px] uppercase" style={{ color: colors.textMuted }}>Prior Sports</div>
                      <div className="font-semibold mt-0.5" style={{ color: colors.textPrimary }}>{student.hasPlayedBefore ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border flex items-center justify-between" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                    <div>
                      <div className="text-[9.5px] uppercase" style={{ color: colors.textMuted }}>Medical & Health</div>
                      <div className="mt-0.5" style={{ color: colors.textPrimary }}>
                        {student.hasIllnessInjury ? (
                          <span className="text-amber-500">{student.medicalNotes || 'Medical condition reported.'}</span>
                        ) : (
                          <span style={{ color: colors.primary }}>No illness or injury reported.</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9.5px] uppercase" style={{ color: colors.textMuted }}>Guardian Sign</div>
                      <div className="text-amber-500 font-serif italic">{student.guardianSignature || 'Verified'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE HISTORY & CALENDAR */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b" style={{ borderColor: colors.border }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                    <div>
                      <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Interactive Attendance Calendar</h3>
                      <p className="text-[10px]" style={{ color: colors.textSecondary }}>Green = Present, Red = Absent, Yellow = Leave, Cyan = Late</p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs"
                    style={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border
                    }}
                  >
                    <button
                      onClick={() => changeCalendarMonth(-1)}
                      className="p-0.5 rounded hover:opacity-80"
                      style={{ color: colors.textPrimary }}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold min-w-28 text-center" style={{ color: colors.textPrimary }}>
                      {monthNames[calendarMonth]} {calendarYear}
                    </span>
                    <button
                      onClick={() => changeCalendarMonth(1)}
                      className="p-0.5 rounded hover:opacity-80"
                      style={{ color: colors.textPrimary }}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold mb-1.5" style={{ color: colors.textMuted }}>
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="h-11 rounded-lg opacity-30 border"
                        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                      />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                      const status = attendanceDateMap.get(dateStr);

                      let borderCol = colors.border;
                      let textCol = colors.textSecondary;
                      let label = null;

                      if (status === 'Present') {
                        borderCol = colors.primary;
                        textCol = colors.primary;
                        label = 'P';
                      } else if (status === 'Absent') {
                        borderCol = '#EF4444';
                        textCol = '#EF4444';
                        label = 'A';
                      } else if (status === 'Leave') {
                        borderCol = '#F59E0B';
                        textCol = '#F59E0B';
                        label = 'L';
                      } else if (status === 'Late') {
                        borderCol = '#06B6D4';
                        textCol = '#06B6D4';
                        label = 'LT';
                      }

                      return (
                        <div
                          key={`day-${dayNum}`}
                          className="h-11 p-1 rounded-lg border flex flex-col justify-between transition-all"
                          style={{
                            backgroundColor: status === 'Present' ? colors.badgeBg : colors.bgCard,
                            borderColor: borderCol,
                            color: textCol
                          }}
                        >
                          <span className="text-[10px] font-bold leading-none">{dayNum}</span>
                          {label ? (
                            <span
                              className="text-[9px] font-black uppercase text-center py-0.2 rounded"
                              style={{ backgroundColor: colors.bgSecondary }}
                            >
                              {status}
                            </span>
                          ) : (
                            <span className="text-[8px] opacity-40 text-center">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: colors.textPrimary }}>
                  Lifetime Month-by-Month Attendance Audit
                </h3>

                <div className="overflow-x-auto rounded-lg border w-full" style={{ borderColor: colors.border }}>
                  <table className="w-full text-left text-[11px] min-w-[640px]">
                    <thead>
                      <tr
                        className="uppercase text-[9.5px] border-b"
                        style={{
                          backgroundColor: colors.bgCard,
                          borderColor: colors.border,
                          color: colors.textSecondary
                        }}
                      >
                        <th className="py-2 px-2.5">Month</th>
                        <th className="py-2 px-2 text-center">Present</th>
                        <th className="py-2 px-2 text-center">Absent</th>
                        <th className="py-2 px-2 text-center">Leave</th>
                        <th className="py-2 px-2 text-center">%</th>
                        <th className="py-2 px-2 text-center">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                      {Array.from(new Set(attendances.map(a => a.monthYear))).map((mYear) => {
                        const recs = attendances.filter(a => a.monthYear === mYear);
                        const p = recs.filter(a => a.status === 'Present').length;
                        const a = recs.filter(a => a.status === 'Absent').length;
                        const l = recs.filter(a => a.status === 'Leave').length;
                        const total = recs.length;
                        const pct = total > 0 ? Math.round((p / total) * 100) : 0;

                        return (
                          <tr key={mYear} className="hover:opacity-90">
                            <td className="py-1.5 px-2.5 font-semibold font-mono" style={{ color: colors.textPrimary }}>{mYear}</td>
                            <td className="py-1.5 px-2 text-center font-mono font-bold" style={{ color: colors.primary }}>{p}</td>
                            <td className="py-1.5 px-2 text-center font-mono text-rose-500">{a}</td>
                            <td className="py-1.5 px-2 text-center font-mono text-amber-500">{l}</td>
                            <td className="py-1.5 px-2 text-center font-mono font-bold">
                              <span style={{ color: pct >= 75 ? colors.primary : '#F59E0B' }}>
                                {pct}%
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span
                                className="text-[9.5px] px-1.5 py-0.2 rounded border"
                                style={{
                                  backgroundColor: colors.bgSecondary,
                                  borderColor: colors.border,
                                  color: colors.textSecondary
                                }}
                              >
                                Closed ({p}/{total}d)
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
            <div className="space-y-4">
              {financialSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    className="p-3 rounded-xl border"
                    style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}
                  >
                    <span className="text-[10px] uppercase font-medium" style={{ color: colors.textSecondary }}>Lifetime Total Billed</span>
                    <div className="text-lg font-bold font-mono mt-0.5" style={{ color: colors.textPrimary }}>
                      PKR {financialSummary.totalBilled.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30"
                  >
                    <span className="text-[10px] uppercase font-medium text-emerald-600 dark:text-emerald-400">Lifetime Total Paid</span>
                    <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-300 mt-0.5">
                      PKR {financialSummary.totalPaid.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/30"
                  >
                    <span className="text-[10px] uppercase font-medium text-rose-500">Remaining Baqaya</span>
                    <div className="text-lg font-bold font-mono text-rose-500 dark:text-rose-300 mt-0.5">
                      PKR {financialSummary.totalRemaining.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Lifetime Monthly Fee Ledger</h3>
                    <p className="text-[10px]" style={{ color: colors.textSecondary }}>Complete record of every month's dues, payments, and balance carry-over</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border w-full" style={{ borderColor: colors.border }}>
                  <table className="w-full text-left text-[11px] min-w-[640px]">
                    <thead>
                      <tr
                        className="uppercase text-[9.5px] border-b"
                        style={{
                          backgroundColor: colors.bgCard,
                          borderColor: colors.border,
                          color: colors.textSecondary
                        }}
                      >
                        <th className="py-2 px-2.5">Month</th>
                        <th className="py-2 px-2 text-right">Fee</th>
                        <th className="py-2 px-2 text-right">Admission</th>
                        <th className="py-2 px-2 text-right">Arrears</th>
                        <th className="py-2 px-2 text-right">Total Due</th>
                        <th className="py-2 px-2 text-right">Paid</th>
                        <th className="py-2 px-2 text-right">Baqaya</th>
                        <th className="py-2 px-2 text-center">Status</th>
                        <th className="py-2 px-2 text-center">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-sans" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                      {feeLedgers.map((l) => (
                        <tr key={l._id} className="hover:opacity-90">
                          <td className="py-2 px-2.5 font-semibold font-mono" style={{ color: colors.textPrimary }}>
                            {l.monthName || l.monthYear}
                          </td>
                          <td className="py-2 px-2 text-right font-mono" style={{ color: colors.textSecondary }}>
                            PKR {l.monthlyFee}
                          </td>
                          <td className="py-2 px-2 text-right font-mono" style={{ color: colors.textSecondary }}>
                            PKR {l.admissionFee || 0}
                          </td>
                          <td className="py-2 px-2 text-right font-mono" style={{ color: colors.textMuted }}>
                            PKR {l.previousBalance || 0}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold" style={{ color: colors.textPrimary }}>
                            PKR {l.totalDue}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold" style={{ color: colors.primary }}>
                            PKR {l.paidAmount}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold">
                            {l.remainingBalance > 0 ? (
                              <span className="text-rose-500">PKR {l.remainingBalance}</span>
                            ) : (
                              <span style={{ color: colors.primary }}>0</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {l.status === 'PAID' ? (
                              <span
                                className="px-1.5 py-0.2 rounded text-[9.5px] font-bold border"
                                style={{
                                  backgroundColor: colors.badgeBg,
                                  borderColor: colors.border,
                                  color: colors.primary
                                }}
                              >
                                PAID
                              </span>
                            ) : l.status === 'PARTIAL' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                                PART
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                                UNPAID
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-[10px]" style={{ color: colors.textSecondary }}>
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
            <div className="space-y-4">
              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Belt Promotion History & Tournament Honors</h3>
                    <p className="text-[10px]" style={{ color: colors.textSecondary }}>Official timeline accredited by Khyber Pakhtunkhwa Taekwondo Association</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300 dark:before:bg-slate-700">
                  {achievements.map((ach) => (
                    <div key={ach._id} className="relative group">
                      <div
                        className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2 transition"
                        style={{ backgroundColor: colors.primary, borderColor: colors.bgCard }}
                      />
                      <div
                        className="p-3 rounded-lg border space-y-1"
                        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: colors.textPrimary }}>{ach.title}</span>
                          <span className="text-[10px] font-mono" style={{ color: colors.textSecondary }}>
                            {new Date(ach.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {ach.beltPromotedTo && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/15 border border-blue-500/30 text-blue-500 text-[9.5px] font-semibold">
                              Promoted to: {ach.beltPromotedTo}
                            </span>
                          )}
                          {ach.medal && ach.medal !== 'None' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[9.5px] font-bold flex items-center gap-1">
                              🏅 {ach.medal} Medal
                            </span>
                          )}
                        </div>
                        {ach.remarks && (
                          <p className="text-[11px] mt-1.5 leading-snug" style={{ color: colors.textSecondary }}>
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
            <div className="space-y-4">
              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Federation Official Issued Certificates</h3>
                    <p className="text-[10px]" style={{ color: colors.textSecondary }}>Signed certificates ready for 1-click re-print or landscape download</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {certificates.length === 0 ? (
                    <div className="col-span-2 py-6 text-center text-xs" style={{ color: colors.textSecondary }}>
                      No certificates issued yet for this student. Use the Federation Certificate module to issue one.
                    </div>
                  ) : (
                    certificates.map((cert) => (
                      <div
                        key={cert._id}
                        className="p-3 rounded-lg border flex flex-col justify-between space-y-2.5"
                        style={{
                          backgroundColor: colors.bgCard,
                          borderColor: colors.border
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold font-mono" style={{ color: colors.primary }}>
                              {cert.certificateNo}
                            </span>
                            <span
                              className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold border"
                              style={{
                                backgroundColor: colors.badgeBg,
                                borderColor: colors.border,
                                color: colors.primary
                              }}
                            >
                              {cert.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold mt-1.5" style={{ color: colors.textPrimary }}>
                            {cert.beltLevel || cert.beltRank} Certification
                          </h4>
                          <p className="text-[11px] line-clamp-2 mt-0.5" style={{ color: colors.textSecondary }}>
                            {cert.citationText}
                          </p>
                          <div className="text-[9.5px] mt-1.5" style={{ color: colors.textMuted }}>
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: colors.border }}>
                          <span className="text-[9.5px]" style={{ color: colors.textMuted }}>Signatory: Murtaza Hassan Bangash</span>
                          <button
                            onClick={() => onPrintCertificate && onPrintCertificate(cert)}
                            className="px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1 transition hover:scale-105"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print Certificate</span>
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

      {/* Edit Student Modal */}
      {isEditing && student && (
        <EditStudentModal
          student={student}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSaveSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};
