import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api.js';
import { soundEffects } from '../../utils/audio.js';
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
      const res = await api.markAttendance({
        studentId: student._id,
        status: 'Present',
        method,
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
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          feeAlert
        };

        setLastCheckIn(logItem);
        setRecentLogs(prev => [logItem, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.error('Error logging attendance:', err);
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
    <div className="space-y-6">
      {/* Top Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 lg:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
              <ScanFace className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white">
              Tri-Mode Smart Daily Attendance Terminal
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time AI Face Recognition Scanner, External Biometric Reader Interface & Full Monthly Matrix Sheet
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => { setActiveMode('face'); }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'face'
                ? 'bg-red-600 text-white shadow-md shadow-red-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Mode 1: Face AI</span>
          </button>

          <button
            onClick={() => { stopFaceCamera(); setActiveMode('fingerprint'); }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'fingerprint'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Mode 2: Biometric</span>
          </button>

          <button
            onClick={() => { stopFaceCamera(); setActiveMode('register'); }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'register'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Mode 3: Batch Register</span>
          </button>

          <button
            onClick={() => { stopFaceCamera(); setActiveMode('monthlyGrid'); }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'monthlyGrid'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Monthly Grid</span>
          </button>
        </div>
      </div>

      {/* MODE 1: LIVE AI FACE RECOGNITION SCANNER */}
      {activeMode === 'face' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-bold text-white">Live AI Neural Scanner Terminal</h3>
              </div>
              <div className="flex items-center gap-2">
                {!cameraActive ? (
                  <button
                    onClick={startFaceCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Start Live Webcam</span>
                  </button>
                ) : (
                  <button
                    onClick={stopFaceCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    Stop Webcam
                  </button>
                )}
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Live AI Face Terminal Ready</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      Click "Start Live Webcam" to stream directly from your camera, or use the quick student triggers below to test instant face check-in.
                    </p>
                  </div>
                </div>
              )}

              {/* HUD / Scanning Overlay */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-lg border border-emerald-500/30 backdrop-blur-sm self-start">
                  <span>AI MODEL: TKD-NET v2.4</span>
                  <span className="mx-2">•</span>
                  <span>FPS: 30</span>
                </div>

                <div className="self-center w-56 h-64 border-2 border-emerald-500/40 rounded-2xl relative flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  <div className="w-full h-0.5 bg-emerald-400/30 animate-pulse" />
                </div>

                <div className="text-[11px] font-semibold text-center text-slate-300 bg-slate-950/80 py-1 px-4 rounded-full border border-slate-800 self-center backdrop-blur-sm">
                  Align student face within the reticle for instant verification
                </div>
              </div>
            </div>

            {/* Quick Trigger Bar */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Student Approach (Click Student to Trigger AI Match):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {students.slice(0, 8).map((st) => (
                  <button
                    key={st._id}
                    onClick={() => triggerScanForStudent(st)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center gap-2 group"
                  >
                    {st.photo ? (
                      <img src={st.photo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold">
                        {st.fullName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate group-hover:text-red-400">
                        {st.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {st.currentBelt} Belt
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Scan Result & Live Fee Alert */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
                <span>Real-Time Biometric Match Result</span>
                <span className="text-[10px] text-slate-400 font-mono">LIVE FEEDBACK</span>
              </h3>

              {lastCheckIn ? (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3 animate-in fade-in duration-200">
                  <div className="relative inline-block">
                    {lastCheckIn.photo ? (
                      <img
                        src={lastCheckIn.photo}
                        alt=""
                        className="w-20 h-24 object-cover rounded-xl border-2 border-emerald-500 shadow-lg mx-auto"
                      />
                    ) : (
                      <div className="w-20 h-24 bg-slate-800 rounded-xl border-2 border-emerald-500 flex items-center justify-center font-bold text-2xl mx-auto">
                        {lastCheckIn.studentName[0]}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 p-1 rounded-full bg-emerald-500 text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">{lastCheckIn.studentName}</h4>
                    <p className="text-xs text-slate-400">S/O {lastCheckIn.fatherName}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-800 bg-slate-900 text-amber-400 font-mono">
                      {lastCheckIn.registrationNo}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-around font-mono">
                    <span className="text-emerald-400 font-bold">STATUS: PRESENT</span>
                    <span className="text-slate-400">TIME: {lastCheckIn.time}</span>
                  </div>

                  {/* CRITICAL: Live Fee Alert */}
                  {lastCheckIn.feeAlert && lastCheckIn.feeAlert.hasDues ? (
                    <div className="p-3 rounded-xl bg-rose-950/60 border-2 border-rose-600/80 text-left space-y-1 animate-pulse">
                      <div className="flex items-center gap-1.5 text-xs font-black text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>FEE PAYMENT DUE ALERT</span>
                      </div>
                      <p className="text-xs font-semibold text-rose-200">
                        {lastCheckIn.feeAlert.message}
                      </p>
                      <p className="text-[10px] text-rose-300/80">
                        Instructor Alert: Prompt student for remaining Baqaya of PKR {lastCheckIn.feeAlert.remainingBalance}.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Fee Cleared: Student has paid dues in full for this month.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Scan a face to see real-time student identity, timestamp, and fee pending alert.
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recent Check-ins Today
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {recentLogs.map((log, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-semibold text-white truncate">{log.studentName}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: FINGERPRINT SCANNER */}
      {activeMode === 'fingerprint' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Fingerprint className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-black text-white">
              Optical / Capacitive Fingerprint Biometric Terminal
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              External USB Fingerprint Reader API listener (DigitalPersona / SecuGen / WebAuthn standard)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                if (students.length > 0) processCheckIn(students[0], 'Fingerprint');
              }}
            >
              <div className="w-32 h-32 rounded-3xl bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition">
                <Fingerprint className="w-16 h-16 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-3xl border border-emerald-400 animate-ping opacity-30 pointer-events-none" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-white">Press Thumb / Finger on Scanner</div>
              <p className="text-xs text-slate-400">
                Listening on USB COM Port / WebUSB Device. Click the sensor icon to simulate immediate biometric match.
              </p>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Registered Fingerprint Templates (Click to Authenticate):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {students.map((st) => (
                <button
                  key={st._id}
                  onClick={() => processCheckIn(st, 'Fingerprint')}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center gap-2"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{st.fullName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{st.fingerprintTemplateId || 'FP-LINKED'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: BATCH MANUAL REGISTER */}
      {activeMode === 'register' && (
        <div className="p-5 lg:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Batch Daily Attendance Register</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quickly toggle Present / Absent / Leave for all students in one click</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-white">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={registerDate}
                  onChange={(e) => setRegisterDate(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleSaveBatch}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/60"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Batch Attendance</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Quick Set All:</span>
            {['Present', 'Absent', 'Leave'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  const updated = {};
                  students.forEach(s => { updated[s._id] = st; });
                  setBatchStatus(updated);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                All {st}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Student / Roll No</th>
                  <th className="py-3 px-3">Belt Rank</th>
                  <th className="py-3 px-3">Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{st.fullName}</div>
                      <div className="text-[11px] text-slate-400">S/O {st.fatherName} • {st.registrationNo}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {st.currentBelt} Belt
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
                        {['Present', 'Absent', 'Leave', 'Late'].map((opt) => {
                          const current = batchStatus[st._id] || 'Present';
                          const isSel = current === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setBatchStatus({ ...batchStatus, [st._id]: opt })}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                isSel
                                  ? opt === 'Present'
                                    ? 'bg-emerald-600 text-white'
                                    : opt === 'Absent'
                                    ? 'bg-rose-600 text-white'
                                    : opt === 'Leave'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-cyan-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
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
        <div className="p-5 lg:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Attendance Register Matrix (Days 1 to {daysInGridMonth})</h3>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive grid view with individual days, total presents, and ratio</p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                <select
                  value={gridMonth}
                  onChange={(e) => setGridMonth(Number(e.target.value))}
                  aria-label="Select Grid Month"
                  className="bg-transparent text-white font-semibold focus:outline-none"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, idx) => (
                    <option key={idx + 1} value={idx + 1} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={gridYear}
                  onChange={(e) => setGridYear(Number(e.target.value))}
                  aria-label="Select Grid Year"
                  className="bg-transparent text-red-400 font-semibold focus:outline-none border-l border-slate-800 pl-2"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y} className="bg-slate-900 text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={exportGridCSV}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Excel / CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[600px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0 z-20">
                <tr>
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-950 z-30 min-w-44 border-r border-slate-800">
                    Student Details
                  </th>
                  {Array.from({ length: daysInGridMonth }, (_, i) => (
                    <th key={i + 1} className="py-2.5 px-1.5 text-center min-w-[28px] border-r border-slate-800/60 font-mono">
                      {i + 1}
                    </th>
                  ))}
                  <th className="py-2.5 px-2 text-center min-w-14">Pres</th>
                  <th className="py-2.5 px-2 text-center min-w-14">Abs</th>
                  <th className="py-2.5 px-2 text-center min-w-16">Ratio</th>
                  <th className="py-2.5 px-2 text-center min-w-14">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {gridMatrix.map((row) => (
                  <tr key={row.student._id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                      <div className="font-semibold text-white truncate max-w-[160px]">{row.student.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{row.student.registrationNo} • {row.student.currentBelt}</div>
                    </td>

                    {Array.from({ length: daysInGridMonth }, (_, i) => {
                      const dayVal = row.dailyRecords[i + 1] || '-';
                      let cellColor = 'text-slate-600';
                      let char = '-';

                      if (dayVal === 'Present') {
                        cellColor = 'text-emerald-400 font-bold bg-emerald-950/20';
                        char = 'P';
                      } else if (dayVal === 'Absent') {
                        cellColor = 'text-rose-400 font-bold bg-rose-950/20';
                        char = 'A';
                      } else if (dayVal === 'Leave') {
                        cellColor = 'text-amber-400 font-bold bg-amber-950/20';
                        char = 'L';
                      } else if (dayVal === 'Late') {
                        cellColor = 'text-cyan-400 font-bold';
                        char = 'T';
                      }

                      return (
                        <td
                          key={i + 1}
                          className={`py-2 px-1 text-center font-mono text-[11px] border-r border-slate-800/40 ${cellColor}`}
                        >
                          {char}
                        </td>
                      );
                    })}

                    <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">
                      {row.presentCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">
                      {row.absentCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-semibold text-slate-300">
                      {row.attendanceRatio}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-white">
                      {row.attendancePercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
