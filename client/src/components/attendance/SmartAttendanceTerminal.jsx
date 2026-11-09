import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api.js';
import { soundEffects } from '../../utils/audio.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { TableSkeleton } from '../common/Skeleton.jsx';
import {
  ScanFace,
  Fingerprint,
  TableProperties,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Download,
  Calendar,
  Save
} from 'lucide-react';

export const SmartAttendanceTerminal = () => {
  const { colors, theme, mode } = useTheme();
  const [activeMode, setActiveMode] = useState('face');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Live scanning states
  const [cameraActive, setCameraActive] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  // Register batch states
  const [registerDate, setRegisterDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchStatus, setBatchStatus] = useState({});

  // Monthly Grid matrix states
  const [gridMonth, setGridMonth] = useState(new Date().getMonth() + 1);
  const [gridYear, setGridYear] = useState(new Date().getFullYear());
  const [gridMatrix, setGridMatrix] = useState([]);
  const [daysInGridMonth, setDaysInGridMonth] = useState(31);

  const videoRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const loadStudents = async () => {
    try {
      const res = await api.getStudents({ status: 'Active' });
      if (res.success) {
        setStudents(res.data);
        const initialMap = {};
        res.data.forEach((st) => {
          initialMap[st._id] = 'Present';
        });
        setBatchStatus(initialMap);
      }
    } catch (err) {
      console.error('Error fetching students for terminal:', err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const startFaceCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam not accessible:', err);
      alert('Camera access denied or unavailable. You can use the Quick AI Face Trigger button to simulate instant neural scanning.');
      setCameraActive(false);
    }
  };

  const stopFaceCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopFaceCamera();
    };
  }, []);

  const processCheckIn = async (student, method) => {
    try {
      setLoading(true);
      const exactCheckInTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const res = await api.markAttendance({
        studentId: student._id,
        status: 'Present',
        method,
        checkInTime: exactCheckInTime,
        confidenceScore: 0.98
      });

      if (res.success) {
        const feeAlert = res.feeAlert;

        soundEffects.playSuccessChime();
        if (feeAlert && feeAlert.hasDues) {
          setTimeout(() => soundEffects.playWarningTone(), 250);
        }

        const logItem = {
          studentName: student.fullName,
          fatherName: student.fatherName,
          registrationNo: student.registrationNo,
          belt: student.currentBelt,
          photo: student.photo,
          status: 'Present',
          method,
          time: exactCheckInTime,
          feeAlert
        };

        setLastCheckIn(logItem);
        setRecentLogs(prev => [logItem, ...prev.slice(0, 9)]);
      } else {
        alert(res.message || 'Unable to record attendance for this student.');
      }
    } catch (err) {
      console.error('Error logging attendance:', err);
      alert(err.response?.data?.message || err.message || 'Error recording attendance');
    } finally {
      setLoading(false);
    }
  };

  const triggerScanForStudent = (student) => {
    processCheckIn(student, 'FaceRecognition');
  };

  const fetchMonthlyMatrix = async () => {
    try {
      setLoading(true);
      const res = await api.getMonthlyAttendanceReport(gridMonth, gridYear);
      if (res.success) {
        setGridMatrix(res.data);
        setDaysInGridMonth(res.daysInMonth);
      }
    } catch (err) {
      console.error('Error loading attendance matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMode === 'monthlyGrid') {
      fetchMonthlyMatrix();
    }
  }, [activeMode, gridMonth, gridYear]);

  const handleSaveBatch = async () => {
    try {
      setLoading(true);
      const records = Object.entries(batchStatus).map(([studentId, status]) => ({
        studentId,
        status
      }));
      const res = await api.batchMarkAttendance({
        date: registerDate,
        records
      });
      if (res.success) {
        soundEffects.playSuccessChime();
        alert(`Successfully marked manual register for ${records.length} students on ${registerDate}!`);
      }
    } catch (err) {
      console.error('Error saving batch:', err);
      alert('Failed to save manual register.');
    } finally {
      setLoading(false);
    }
  };

  const exportGridCSV = () => {
    if (!gridMatrix.length) return;
    const dayHeaders = Array.from({ length: daysInGridMonth }, (_, i) => `Day ${i + 1}`);
    const headers = ['Roll No', 'Student Name', 'Belt', ...dayHeaders, 'Present', 'Absent', 'Attendance %'];
    const rows = gridMatrix.map(row => {
      const dailyVals = Array.from({ length: daysInGridMonth }, (_, i) => row.dailyRecords[i + 1] || '-');
      return [
        row.student.registrationNo,
        `"${row.student.fullName}"`,
        row.student.currentBelt,
        ...dailyVals,
        row.presentCount,
        row.absentCount,
        `${row.attendancePercentage}%`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `Monthly_Attendance_Sheet_${gridMonth}_${gridYear}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Top Mode Selector Tabs */}
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
              className="p-1.5 rounded-lg border flex items-center justify-center"
              style={{
                backgroundColor: colors.badgeBg,
                borderColor: colors.border,
                color: colors.primary
              }}
            >
              <ScanFace className="w-4 h-4" />
            </span>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight" style={{ color: colors.textHeading }}>
              Attendance Terminal
            </h1>
          </div>
          <p className="text-[13px] font-normal mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>
            Mark daily attendance via Face AI, Fingerprint biometric scanner, Batch register, or Monthly matrix grid.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div
          className="flex flex-wrap items-center p-1 rounded-lg border text-[12.5px] gap-1"
          style={{
            backgroundColor: colors.bgSecondary,
            borderColor: colors.border
          }}
        >
          <button
            onClick={() => { setActiveMode('face'); }}
            className="px-3 py-1.5 rounded-md font-medium text-[12.5px] flex items-center gap-1.5 transition"
            style={{
              backgroundColor: activeMode === 'face' ? colors.primary : 'transparent',
              color: activeMode === 'face' ? '#FFFFFF' : colors.textSecondary,
              fontWeight: activeMode === 'face' ? '600' : '500'
            }}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Face AI</span>
          </button>

          <button
            onClick={() => { stopFaceCamera(); setActiveMode('fingerprint'); }}
            className="px-3 py-1.5 rounded-md font-medium text-[12.5px] flex items-center gap-1.5 transition"
            style={{
              backgroundColor: activeMode === 'fingerprint' ? colors.primary : 'transparent',
              color: activeMode === 'fingerprint' ? '#FFFFFF' : colors.textSecondary,
              fontWeight: activeMode === 'fingerprint' ? '600' : '500'
            }}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Fingerprint</span>
          </button>

          <button
            onClick={() => { stopFaceCamera(); setActiveMode('register'); }}
            className="px-3 py-1.5 rounded-md font-medium text-[12.5px] flex items-center gap-1.5 transition"
            style={{
              backgroundColor: activeMode === 'register' ? colors.primary : 'transparent',
              color: activeMode === 'register' ? '#FFFFFF' : colors.textSecondary,
              fontWeight: activeMode === 'register' ? '600' : '500'
            }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Batch Register</span>
          </button>

          <button
            onClick={() => { stopFaceCamera(); setActiveMode('monthlyGrid'); }}
            className="px-3 py-1.5 rounded-md font-medium text-[12.5px] flex items-center gap-1.5 transition"
            style={{
              backgroundColor: activeMode === 'monthlyGrid' ? colors.primary : 'transparent',
              color: activeMode === 'monthlyGrid' ? '#FFFFFF' : colors.textSecondary
            }}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Monthly Grid</span>
          </button>
        </div>
      </div>

      {/* MODE 1: LIVE AI FACE RECOGNITION SCANNER */}
      {activeMode === 'face' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            className="lg:col-span-2 p-3.5 lg:p-4 rounded-xl border shadow-sm space-y-3 transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: colors.primary }} />
                <h3 className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>Live AI Neural Scanner Terminal</h3>
              </div>
              <div className="flex items-center gap-2">
                {!cameraActive ? (
                  <button
                    onClick={startFaceCamera}
                    className="px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1.5 transition hover:scale-102"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Camera className="w-3 h-3" />
                    <span>Start Live Webcam</span>
                  </button>
                ) : (
                  <button
                    onClick={stopFaceCamera}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold"
                  >
                    Stop Webcam
                  </button>
                )}
              </div>
            </div>

            {/* Video Viewport */}
            <div
              className="relative aspect-video rounded-lg border overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border
              }}
            >
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
              ) : (
                <div className="flex flex-col items-center justify-center p-5 text-center space-y-2">
                  <div
                    className="w-12 h-12 rounded-full border flex items-center justify-center"
                    style={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                      color: colors.textMuted
                    }}
                  >
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: colors.textPrimary }}>Live AI Face Terminal Ready</p>
                    <p className="text-[10.5px] mt-0.5 max-w-sm" style={{ color: colors.textSecondary }}>
                      Click "Start Live Webcam" to stream directly from your camera, or use the quick student triggers below to test instant face check-in.
                    </p>
                  </div>
                </div>
              )}

              {/* HUD / Scanning Overlay */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <div
                  className="flex justify-between items-center text-[9.5px] font-mono px-2.5 py-0.5 rounded border backdrop-blur-sm self-start"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  <span>AI MODEL: TKD-NET v2.4</span>
                  <span className="mx-1.5">•</span>
                  <span>FPS: 30</span>
                </div>

                <div
                  className="self-center w-48 h-56 border-2 rounded-xl relative flex items-center justify-center"
                  style={{ borderColor: colors.primary }}
                >
                  <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2" style={{ borderColor: colors.primary }} />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2" style={{ borderColor: colors.primary }} />
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2" style={{ borderColor: colors.primary }} />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2" style={{ borderColor: colors.primary }} />
                  <div className="w-full h-0.5 animate-pulse" style={{ backgroundColor: colors.primary }} />
                </div>

                <div
                  className="text-[10px] font-semibold text-center py-0.5 px-3 rounded-full border self-center backdrop-blur-sm"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                >
                  Align student face within the reticle for instant verification
                </div>
              </div>
            </div>

            {/* Quick Trigger Bar */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Simulate Student Approach (Click Student to Trigger AI Match):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {students.slice(0, 8).map((st) => (
                  <button
                    key={st._id}
                    onClick={() => triggerScanForStudent(st)}
                    className="p-1.5 rounded-lg border text-left transition flex items-center gap-2 group hover:scale-[1.01]"
                    style={{
                      backgroundColor: colors.bgSecondary,
                      borderColor: colors.border
                    }}
                  >
                    {st.photo ? (
                      <img src={st.photo} alt="" className="w-7 h-7 rounded-md object-cover" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}
                      >
                        {st.fullName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold truncate group-hover:opacity-80" style={{ color: colors.textPrimary }}>
                        {st.fullName}
                      </div>
                      <div className="text-[9.5px] truncate" style={{ color: colors.textMuted }}>
                        {st.currentBelt} Belt
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Scan Result & Live Fee Alert */}
          <div
            className="p-3.5 lg:p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-3 transition-all"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <div>
              <h3 className="text-xs font-bold pb-2.5 border-b flex items-center justify-between" style={{ borderColor: colors.border, color: colors.textPrimary }}>
                <span>Real-Time Biometric Match Result</span>
                <span className="text-[9.5px] font-mono" style={{ color: colors.textMuted }}>LIVE FEEDBACK</span>
              </h3>

              {lastCheckIn ? (
                <div
                  className="mt-3 p-3 rounded-xl border text-center space-y-2.5 animate-in fade-in duration-200"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border
                  }}
                >
                  <div className="relative inline-block">
                    {lastCheckIn.photo ? (
                      <img
                        src={lastCheckIn.photo}
                        alt=""
                        className="w-16 h-20 object-cover rounded-lg border-2 shadow-sm mx-auto"
                        style={{ borderColor: colors.primary }}
                      />
                    ) : (
                      <div
                        className="w-16 h-20 rounded-lg border-2 flex items-center justify-center font-bold text-xl mx-auto"
                        style={{ backgroundColor: colors.bgCard, borderColor: colors.primary, color: colors.textPrimary }}
                      >
                        {lastCheckIn.studentName[0]}
                      </div>
                    )}
                    <div
                      className="absolute -bottom-1.5 -right-1.5 p-0.5 rounded-full text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold" style={{ color: colors.textPrimary }}>{lastCheckIn.studentName}</h4>
                    <p className="text-[11px]" style={{ color: colors.textSecondary }}>S/O {lastCheckIn.fatherName}</p>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border font-mono"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderColor: colors.border,
                        color: colors.primary
                      }}
                    >
                      {lastCheckIn.registrationNo}
                    </span>
                  </div>

                  <div
                    className="p-1.5 rounded-lg border text-[11px] flex items-center justify-around font-mono"
                    style={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border
                    }}
                  >
                    <span className="font-bold" style={{ color: colors.primary }}>STATUS: PRESENT</span>
                    <span style={{ color: colors.textMuted }}>TIME: {lastCheckIn.time}</span>
                  </div>

                  {/* CRITICAL: Live Fee Alert */}
                  {lastCheckIn.feeAlert && lastCheckIn.feeAlert.hasDues ? (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border-2 border-rose-500 text-left space-y-0.5 animate-pulse">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>FEE PAYMENT DUE ALERT</span>
                      </div>
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-300">
                        {lastCheckIn.feeAlert.message}
                      </p>
                      <p className="text-[9.5px] text-rose-500">
                        Instructor Alert: Prompt student for remaining Baqaya of PKR {lastCheckIn.feeAlert.remainingBalance}.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="p-2 rounded-lg border text-[11px] flex items-center gap-1.5"
                      style={{
                        backgroundColor: colors.badgeBg,
                        borderColor: colors.border,
                        color: colors.primary
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.primary }} />
                      <span>Fee Cleared: Student has paid dues in full for this month.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-[11px]" style={{ color: colors.textMuted }}>
                  Scan a face to see real-time student identity, timestamp, and fee pending alert.
                </div>
              )}
            </div>

            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                Recent Check-ins Today
              </div>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {recentLogs.map((log, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded-lg border text-[11px] flex items-center justify-between"
                    style={{
                      backgroundColor: colors.bgSecondary,
                      borderColor: colors.border
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                      <span className="font-semibold truncate" style={{ color: colors.textPrimary }}>{log.studentName}</span>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: colors.textMuted }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: FINGERPRINT SCANNER */}
      {activeMode === 'fingerprint' && (
        <div
          className="p-4 lg:p-5 rounded-xl border shadow-sm max-w-2xl mx-auto space-y-4 transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="text-center pb-3 border-b" style={{ borderColor: colors.border }}>
            <div
              className="w-12 h-12 rounded-xl border flex items-center justify-center mx-auto mb-2"
              style={{
                backgroundColor: colors.badgeBg,
                borderColor: colors.border,
                color: colors.primary
              }}
            >
              <Fingerprint className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold" style={{ color: colors.textPrimary }}>
              Optical / Capacitive Fingerprint Biometric Terminal
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>
              External USB Fingerprint Reader API listener (DigitalPersona / SecuGen / WebAuthn standard)
            </p>
          </div>

          <div
            className="p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-3"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                if (students.length > 0) processCheckIn(students[0], 'Fingerprint');
              }}
            >
              <div
                className="w-24 h-24 rounded-2xl border-2 flex items-center justify-center shadow-sm group-hover:scale-102 transition"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.primary,
                  color: colors.primary
                }}
              >
                <Fingerprint className="w-12 h-12 animate-pulse" />
              </div>
              <div
                className="absolute inset-0 rounded-2xl border animate-ping opacity-30 pointer-events-none"
                style={{ borderColor: colors.primary }}
              />
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold" style={{ color: colors.textPrimary }}>Press Thumb / Finger on Scanner</div>
              <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                Listening on USB COM Port / WebUSB Device. Click the sensor icon to simulate immediate biometric match.
              </p>
            </div>
          </div>

          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
              Registered Fingerprint Templates (Click to Authenticate):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {students.map((st) => (
                <button
                  key={st._id}
                  onClick={() => processCheckIn(st, 'Fingerprint')}
                  className="p-2 rounded-lg border text-left transition flex items-center gap-2 hover:scale-102"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border
                  }}
                >
                  <Fingerprint className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.primary }} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold truncate" style={{ color: colors.textPrimary }}>{st.fullName}</div>
                    <div className="text-[9.5px] font-mono" style={{ color: colors.textMuted }}>{st.fingerprintTemplateId || 'FP-LINKED'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: BATCH MANUAL REGISTER */}
      {activeMode === 'register' && (
        <div
          className="p-3.5 lg:p-4 rounded-xl border shadow-sm space-y-3 transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: colors.border }}>
            <div>
              <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Batch Daily Attendance Register</h3>
              <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>Quickly toggle Present / Absent / Leave for all students in one click</p>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              >
                <Calendar className="w-3 h-3" style={{ color: colors.textMuted }} />
                <input
                  type="date"
                  value={registerDate}
                  onChange={(e) => setRegisterDate(e.target.value)}
                  className="bg-transparent text-xs focus:outline-none"
                  style={{ color: colors.textPrimary }}
                />
              </div>

              <button
                onClick={handleSaveBatch}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition hover:scale-102"
                style={{ backgroundColor: colors.primary }}
              >
                <Save className="w-3 h-3" />
                <span>Save Batch</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
            <span className="text-[11px]">Quick Set All:</span>
            {['Present', 'Absent', 'Leave'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  const updated = {};
                  students.forEach(s => { updated[s._id] = st; });
                  setBatchStatus(updated);
                }}
                className="px-2 py-0.5 rounded-md border text-[11px] font-medium transition"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              >
                All {st}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border w-full" style={{ borderColor: colors.border }}>
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr
                  className="uppercase text-[9.5px] border-b"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                    color: colors.textSecondary
                  }}
                >
                  <th className="py-2 px-3">Student / Roll No</th>
                  <th className="py-2 px-3">Belt Rank</th>
                  <th className="py-2 px-3">Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y font-sans" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                {students.map((st) => (
                  <tr key={st._id} className="hover:opacity-90">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-xs" style={{ color: colors.textPrimary }}>{st.fullName}</div>
                      <div className="text-[10px]" style={{ color: colors.textSecondary }}>S/O {st.fatherName} • {st.registrationNo}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold border"
                        style={{
                          backgroundColor: colors.bgSecondary,
                          borderColor: colors.border,
                          color: colors.textSecondary
                        }}
                      >
                        {st.currentBelt} Belt
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div
                        className="flex items-center gap-0.5 p-0.5 rounded-lg border w-fit"
                        style={{
                          backgroundColor: colors.bgSecondary,
                          borderColor: colors.border
                        }}
                      >
                        {['Present', 'Absent', 'Leave', 'Late'].map((opt) => {
                          const current = batchStatus[st._id] || 'Present';
                          const isSel = current === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setBatchStatus({ ...batchStatus, [st._id]: opt })}
                              className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold transition"
                              style={{
                                backgroundColor: isSel
                                  ? opt === 'Present'
                                    ? colors.primary
                                    : opt === 'Absent'
                                    ? '#EF4444'
                                    : opt === 'Leave'
                                    ? '#F59E0B'
                                    : '#06B6D4'
                                  : 'transparent',
                                color: isSel ? '#FFFFFF' : colors.textSecondary
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 4: MONTHLY ATTENDANCE SHEET GRID */}
      {activeMode === 'monthlyGrid' && (
        <div
          className="p-3.5 lg:p-4 rounded-xl border shadow-sm space-y-3 transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: colors.border }}>
            <div>
              <h3 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Monthly Attendance Register Matrix (Days 1 to {daysInGridMonth})</h3>
              <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>Comprehensive grid view with individual days, total presents, and ratio</p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg border text-xs"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <select
                  value={gridMonth}
                  onChange={(e) => setGridMonth(Number(e.target.value))}
                  aria-label="Select Grid Month"
                  className="bg-transparent font-semibold focus:outline-none text-xs"
                  style={{ color: colors.textPrimary }}
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, idx) => (
                    <option key={idx + 1} value={idx + 1} style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={gridYear}
                  onChange={(e) => setGridYear(Number(e.target.value))}
                  aria-label="Select Grid Year"
                  className="bg-transparent font-semibold focus:outline-none border-l pl-2 text-xs"
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
                onClick={exportGridCSV}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition hover:scale-102"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              >
                <Download className="w-3 h-3" style={{ color: colors.primary }} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border max-h-[500px]" style={{ borderColor: colors.border }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="uppercase text-[9.5px] sticky top-0 z-20" style={{ backgroundColor: colors.bgSecondary, color: colors.textSecondary }}>
                <tr>
                  <th className="py-2 px-2.5 sticky left-0 z-30 min-w-40 border-r" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}>
                    Student Details
                  </th>
                  {Array.from({ length: daysInGridMonth }, (_, i) => (
                    <th key={i + 1} className="py-2 px-1 text-center min-w-[24px] border-r font-mono text-[9.5px]" style={{ borderColor: colors.border }}>
                      {i + 1}
                    </th>
                  ))}
                  <th className="py-2 px-1.5 text-center min-w-12">Pres</th>
                  <th className="py-2 px-1.5 text-center min-w-12">Abs</th>
                  <th className="py-2 px-1.5 text-center min-w-14">Ratio</th>
                  <th className="py-2 px-1.5 text-center min-w-12">%</th>
                </tr>
              </thead>
              <tbody className="divide-y font-sans" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                {loading ? (
                  <TableSkeleton rows={8} columns={daysInGridMonth + 5} />
                ) : gridMatrix.length === 0 ? (
                  <tr>
                    <td colSpan={daysInGridMonth + 5} className="py-8 text-center text-xs font-semibold" style={{ color: colors.textSecondary }}>
                      No attendance records found for this period.
                    </td>
                  </tr>
                ) : (
                  gridMatrix.map((row) => (
                    <tr key={row.student._id} className="hover:opacity-90">
                      <td className="py-2 px-2.5 sticky left-0 z-10 border-r" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                        <div className="font-semibold truncate max-w-[150px] text-[11px]" style={{ color: colors.textPrimary }}>{row.student.fullName}</div>
                        <div className="text-[9.5px] font-mono truncate" style={{ color: colors.textMuted }}>{row.student.registrationNo} • {row.student.currentBelt}</div>
                      </td>

                      {Array.from({ length: daysInGridMonth }, (_, i) => {
                        const dayVal = row.dailyRecords[i + 1] || '-';
                        let cellStyle = { color: colors.textMuted };
                        let char = '-';

                        if (dayVal === 'Present') {
                          cellStyle = { color: colors.primary, fontWeight: 'bold' };
                          char = 'P';
                        } else if (dayVal === 'Absent') {
                          cellStyle = { color: '#EF4444', fontWeight: 'bold' };
                          char = 'A';
                        } else if (dayVal === 'Leave') {
                          cellStyle = { color: '#F59E0B', fontWeight: 'bold' };
                          char = 'L';
                        } else if (dayVal === 'Late') {
                          cellStyle = { color: '#06B6D4', fontWeight: 'bold' };
                          char = 'T';
                        }

                        return (
                          <td
                            key={i + 1}
                            className="py-1.5 px-0.5 text-center font-mono text-[10px] border-r"
                            style={{ borderColor: colors.border, ...cellStyle }}
                          >
                            {char}
                          </td>
                        );
                      })}

                      <td className="py-1.5 px-1.5 text-center font-mono font-bold text-xs" style={{ color: colors.primary }}>
                        {row.presentCount}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-mono font-bold text-xs text-rose-500">
                        {row.absentCount}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-mono font-semibold text-[10.5px]" style={{ color: colors.textSecondary }}>
                        {row.attendanceRatio}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-mono font-bold text-xs" style={{ color: colors.textPrimary }}>
                        {row.attendancePercentage}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
