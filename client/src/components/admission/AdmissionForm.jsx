import React, { useState, useRef } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Camera,
  Upload,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
  FileCheck
} from 'lucide-react';

export const AdmissionForm = ({ onSuccess, onNavigateToBiometrics }) => {
  const { colors, theme, mode } = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    dob: '',
    age: '',
    gender: 'Male',
    nationalityCast: 'Pakistani / Bangash',
    cnicFormB: '',
    phone: '',
    whatsapp: '',
    email: '',
    permanentAddress: 'Kohat, KPK',
    education: 'Matric',
    hasPlayedBefore: false,
    hasIllnessInjury: false,
    medicalNotes: '',
    admissionDate: new Date().toISOString().split('T')[0],
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'White',
    guardianConsent: true,
    guardianSignature: '',
    instructorSignature: 'Murtaza Hassan Bangash'
  });

  const [photo, setPhoto] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [printPreview, setPrintPreview] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto calculate age from DOB
  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    let calculatedAge = '';
    if (dobVal) {
      const birthDate = new Date(dobVal);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
    }
    setFormData(prev => ({ ...prev, dob: dobVal, age: calculatedAge }));
  };

  // Webcam live photo capture
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam not accessible:', err);
      alert('Could not access webcam. You can upload an image file instead.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = 300;
        canvasRef.current.height = 300;
        context.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.fatherName || !formData.phone) {
      alert('Please fill all mandatory fields (Full Name, Father Name, Contact Phone).');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        age: Number(formData.age) || 16,
        photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        fixedMonthlyFee: Number(formData.fixedMonthlyFee),
        admissionFee: Number(formData.admissionFee)
      };

      const res = await api.createStudent(payload);
      if (res.success) {
        setSuccessModal(res.data);
        if (onSuccess) onSuccess(res.data);
      } else {
        alert('Error: ' + res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to register student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
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
              <FileCheck className="w-4 h-4" />
            </span>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight" style={{ color: colors.textHeading }}>
              Official Digital Admission Desk
            </h1>
          </div>
          <p className="text-[13px] font-normal mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>
            Official Urdu/English admission form with ledger auto-initialization & biometric readiness for Kohat Academy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPrintPreview(true)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 border transition hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderColor: colors.border
            }}
          >
            <Printer className="w-3.5 h-3.5 text-cyan-500" />
            <span>Blank Form Print</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Digital Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="rounded-xl p-4 lg:p-6 border shadow-sm transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          {/* Header of Form */}
          <div className="text-center pb-4 border-b" style={{ borderColor: colors.border }}>
            <h2 className="text-base lg:text-lg font-bold tracking-wide uppercase" style={{ color: colors.textPrimary }}>
              AL MURTAZA SHAH TAEKWONDO ACADEMY
            </h2>
            <div className="text-xs font-semibold font-urdu mt-0.5" style={{ color: colors.primary }}>
              المurtضٰی شاہ تائیکوانڈو اکیڈمی کوہاٹ
            </div>
            <p className="text-[10.5px] mt-0.5" style={{ color: colors.textSecondary }}>
              Affiliated with Khyber Pakhtunkhwa Taekwondo Association & Pakistan Taekwondo Federation
            </p>
            <div
              className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full border text-[10.5px] font-semibold"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textPrimary
              }}
            >
              ADMISSION & REGISTRATION FORM • داخلہ فارم
            </div>
          </div>

          {/* Section 1: Personal Details & Photo */}
          <div className="mt-4">
            <div className="flex items-center justify-between pb-1.5 mb-3 border-b" style={{ borderColor: colors.border }}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: colors.primary }}>
                <span>1. Personal Information</span>
                <span className="text-[10px] font-normal font-urdu" style={{ color: colors.textMuted }}>(ذاتی کوائف)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Photo Box */}
              <div
                className="lg:col-span-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed text-center"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div
                  className="w-32 h-40 rounded-lg overflow-hidden border flex items-center justify-center relative shadow-inner"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border
                  }}
                >
                  {cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : photo ? (
                    <img src={photo} alt="Passport" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2" style={{ color: colors.textMuted }}>
                      <Camera className="w-7 h-7 mb-1" />
                      <span className="text-[9.5px] uppercase font-semibold">Passport Photo</span>
                      <span className="text-[8.5px] font-urdu">پاسپورٹ سائز تصویر</span>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                <div className="flex items-center gap-1.5 mt-2.5 w-full">
                  {cameraActive ? (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full py-1 rounded-md text-white text-xs font-semibold"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Capture Snapshot
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-1/2 py-1 rounded-md text-white text-[10.5px] font-medium flex items-center justify-center gap-1 shadow-sm"
                      style={{ backgroundColor: '#4F46E5' }}
                    >
                      <Camera className="w-3 h-3" />
                      <span>Webcam</span>
                    </button>
                  )}

                  <label
                    className="w-1/2 py-1 rounded-md text-[10.5px] font-medium flex items-center justify-center gap-1 cursor-pointer border"
                    style={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <span className="text-[8.5px] mt-1" style={{ color: colors.textMuted }}>Used for AI Face Recognition</span>
              </div>

              {/* Form inputs */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                    Student Full Name <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(طالبعلم کا پورا نام)</span> *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abdul Basit"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                    Father / Guardian Name <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(والد / سرپرست کا نام)</span> *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qari Sabir"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                    Date of Birth <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(تاریخ پیدائش)</span> *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                      Age <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(عمر)</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      placeholder="Auto"
                      value={formData.age}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold"
                      style={{
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border,
                        color: colors.primary
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                      Gender <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(جنس)</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition"
                      style={{
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                        color: colors.textPrimary
                      }}
                    >
                      <option value="Male">Male (مرد)</option>
                      <option value="Female">Female (خاتون)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                    Nationality / Cast <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(قومیت)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pakistani / Bangash"
                    value={formData.nationalityCast}
                    onChange={(e) => setFormData({ ...formData, nationalityCast: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                    CNIC / Form-B No. <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(شناختی کارڈ یا ب فارم)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14301-8923412-1"
                    value={formData.cnicFormB}
                    onChange={(e) => setFormData({ ...formData, cnicFormB: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Education */}
          <div className="mt-5">
            <div className="flex items-center justify-between pb-1.5 mb-3 border-b" style={{ borderColor: colors.border }}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: colors.primary }}>
                <span>2. Contact & Educational Profile</span>
                <span className="text-[10px] font-normal font-urdu" style={{ color: colors.textMuted }}>(رابطہ و تعلیمی قابلیت)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Cell / WhatsApp No. <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(فون / واٹس ایپ)</span> *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0335-9117230"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Email Address <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(ای میل)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Educational Level <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(تعلیمی قابلیت)</span>
                </label>
                <select
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                >
                  <option value="Primary / Middle">Primary / Middle (پرائمری تا مڈل)</option>
                  <option value="Matric">Matric (میٹرک)</option>
                  <option value="FSc / FA / ICS">FSc / FA / ICS (انٹرمیڈیٹ)</option>
                  <option value="BS / Graduation">BS / Graduation (گریجویشن)</option>
                  <option value="Master / Post-Grad">Master / Post-Grad</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Permanent Address <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(مستقل پتہ)</span> *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohallah Mufti Shah, Kohat"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Medical & Sports History */}
          <div className="mt-5">
            <div className="flex items-center justify-between pb-1.5 mb-3 border-b" style={{ borderColor: colors.border }}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: colors.primary }}>
                <span>3. Sports Experience & Medical Health</span>
                <span className="text-[10px] font-normal font-urdu" style={{ color: colors.textMuted }}>(طبی و اسپورٹس معلومات)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="p-3 rounded-lg border flex items-start gap-2.5"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <input
                  type="checkbox"
                  id="hasPlayedBefore"
                  checked={formData.hasPlayedBefore}
                  onChange={(e) => setFormData({ ...formData, hasPlayedBefore: e.target.checked })}
                  className="mt-0.5 w-3.5 h-3.5 rounded cursor-pointer"
                  style={{ accentColor: colors.primary }}
                />
                <label htmlFor="hasPlayedBefore" className="text-xs cursor-pointer">
                  <span className="font-semibold block text-[11px]" style={{ color: colors.textPrimary }}>
                    Have you ever played Taekwondo or any other martial art before?
                  </span>
                  <span className="text-[10px] font-urdu block mt-0.5" style={{ color: colors.textMuted }}>
                    کیا آپ نے پہلے تائیکوانڈو یا کوئی اور کھیل کھیلا ہے؟
                  </span>
                </label>
              </div>

              <div
                className="p-3 rounded-lg border space-y-2"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="hasIllnessInjury"
                    checked={formData.hasIllnessInjury}
                    onChange={(e) => setFormData({ ...formData, hasIllnessInjury: e.target.checked })}
                    className="mt-0.5 w-3.5 h-3.5 rounded cursor-pointer"
                    style={{ accentColor: colors.primary }}
                  />
                  <label htmlFor="hasIllnessInjury" className="text-xs cursor-pointer">
                    <span className="font-semibold block text-[11px]" style={{ color: colors.textPrimary }}>
                      Any chronic illness, bone injury, or medical condition?
                    </span>
                    <span className="text-[10px] font-urdu block mt-0.5" style={{ color: colors.textMuted }}>
                      کیا آپ کو کوئی جسمانی بیماری یا پرانی چوٹ ہے؟
                    </span>
                  </label>
                </div>
                {formData.hasIllnessInjury && (
                  <input
                    type="text"
                    placeholder="Enter medical / injury remarks..."
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    className="w-full px-2.5 py-1 rounded-md border text-xs focus:outline-none"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Fee Structure & Belt */}
          <div className="mt-5">
            <div className="flex items-center justify-between pb-1.5 mb-3 border-b" style={{ borderColor: colors.border }}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: colors.primary }}>
                <span>4. Fee Setup & Initial Belt Rank</span>
                <span className="text-[10px] font-normal font-urdu" style={{ color: colors.textMuted }}>(فیس اور بیلٹ کی تفصیل)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Admission Date <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(تاریخ داخلہ)</span>
                </label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Fixed Monthly Fee (PKR) <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(ماہانہ فیس)</span>
                </label>
                <input
                  type="number"
                  value={formData.fixedMonthlyFee}
                  onChange={(e) => setFormData({ ...formData, fixedMonthlyFee: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  One-time Admission Fee (PKR) <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(داخلہ فیس)</span>
                </label>
                <input
                  type="number"
                  value={formData.admissionFee}
                  onChange={(e) => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold text-amber-500 focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Initial Belt Rank <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(بیلٹ رینک)</span>
                </label>
                <select
                  value={formData.currentBelt}
                  onChange={(e) => setFormData({ ...formData, currentBelt: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                >
                  <option value="White">White Belt (سفید بیلٹ)</option>
                  <option value="Yellow">Yellow Belt (پیلا بیلٹ)</option>
                  <option value="Green">Green Belt (سبز بیلٹ)</option>
                  <option value="Blue">Blue Belt (نیلا بیلٹ)</option>
                  <option value="Red">Red Belt (سرخ بیلٹ)</option>
                  <option value="Black">Black Belt (سیاہ بیلٹ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Declaration & Signatures */}
          <div className="mt-5 pt-3 border-t" style={{ borderColor: colors.border }}>
            <div
              className="p-3 rounded-lg border text-xs leading-relaxed space-y-1.5"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.guardianConsent}
                  onChange={(e) => setFormData({ ...formData, guardianConsent: e.target.checked })}
                  className="mt-0.5 w-3.5 h-3.5 rounded cursor-pointer"
                  style={{ accentColor: colors.primary }}
                />
                <label htmlFor="consent" className="cursor-pointer">
                  <span className="font-bold text-xs" style={{ color: colors.textPrimary }}>
                    Declaration & Academy Rules Consent / حلف نامہ:
                  </span>
                  <p className="text-[10.5px] mt-0.5" style={{ color: colors.textSecondary }}>
                    I hereby certify that all information submitted is accurate. The student will abide by all academy discipline, sparring guidelines, and timely monthly fee dues. The academy is not responsible for injuries sustained during standard martial arts sparring.
                  </p>
                  <p className="text-[9.5px] font-urdu mt-0.5" style={{ color: colors.textMuted }}>
                    میں اقرار کرتا ہوں کہ مندرجہ بالا کوائف درست ہیں اور میں اکیڈمی کے جملہ قواعد و ضوابط اور ماہانہ فیس کی بروقت ادائیگی کا پابند رہوں گا۔
                  </p>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Guardian / Parent Signature <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(دستخط والد یا سرپرست)</span>
                </label>
                <input
                  type="text"
                  placeholder="Type Full Name to Sign e.g. Qari Sabir"
                  value={formData.guardianSignature}
                  onChange={(e) => setFormData({ ...formData, guardianSignature: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border text-xs text-amber-500 focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border
                  }}
                />
              </div>

              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border
                }}
              >
                <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Head Instructor Approval <span className="font-urdu font-normal" style={{ color: colors.textMuted }}>(دستخط ہیڈ انسٹرکٹر)</span>
                </label>
                <div
                  className="px-2.5 py-1.5 rounded-md border text-xs font-bold flex items-center justify-between"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  <span>Murtaza Hassan Bangash</span>
                  <span className="text-[9.5px]" style={{ color: colors.textMuted }}>6th Dan WTF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="mt-5 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.textSecondary }}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px]">Submitting auto-initializes Registration No, Fee Ledger & Biometric Desk.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2 rounded-lg text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50 hover:scale-102 active:scale-95"
                style={{ backgroundColor: colors.primary }}
              >
                {loading ? (
                  <span>Registering Student...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Admission & Initialize Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* SUCCESS MODAL & BIOMETRIC PROMPT */}
      {successModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 lg:p-4">
          <div
            className="border rounded-xl max-w-md w-full p-4 lg:p-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-200"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border
            }}
          >
            <button
              onClick={() => setSuccessModal(null)}
              className="absolute top-3 right-3 p-1 rounded-md border"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="text-center">
              <div
                className="w-11 h-11 rounded-full border flex items-center justify-center mx-auto mb-2"
                style={{
                  backgroundColor: colors.badgeBg,
                  borderColor: colors.border,
                  color: colors.primary
                }}
              >
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold" style={{ color: colors.textPrimary }}>
                Student Registered Successfully!
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>
                Official Registration No: <span className="font-mono font-bold px-1.5 py-0.2 rounded border" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.primary }}>{successModal.registrationNo}</span>
              </p>
            </div>

            <div
              className="mt-3 p-2.5 rounded-lg border text-xs space-y-1.5"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border
              }}
            >
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Student Name:</span>
                <span className="font-semibold text-xs" style={{ color: colors.textPrimary }}>{successModal.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Father's Name:</span>
                <span style={{ color: colors.textPrimary }}>{successModal.fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Initial Monthly Fee:</span>
                <span className="font-mono font-bold" style={{ color: colors.primary }}>PKR {successModal.fixedMonthlyFee}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Initial Admission Fee:</span>
                <span className="font-mono font-bold text-amber-500">PKR {successModal.admissionFee}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Monthly Ledger Status:</span>
                <span className="text-rose-500 font-semibold text-[11px]">Initialized (PKR {successModal.fixedMonthlyFee + successModal.admissionFee} Total Due)</span>
              </div>
            </div>

            {/* Prompt for Biometric Registration */}
            <div className="mt-3.5 pt-3 border-t flex flex-col sm:flex-row gap-2" style={{ borderColor: colors.border }}>
              <button
                type="button"
                onClick={() => {
                  setSuccessModal(null);
                  if (onNavigateToBiometrics) onNavigateToBiometrics(successModal._id);
                }}
                className="w-full py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:scale-102"
                style={{ backgroundColor: colors.primary }}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Enroll Biometrics / Face ID Now</span>
              </button>
              <button
                type="button"
                onClick={() => setSuccessModal(null)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg border text-xs font-medium"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHYSICAL REPLICA PRINT PREVIEW MODAL */}
      {printPreview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 lg:p-6 overflow-y-auto">
          <div className="bg-white text-black max-w-4xl w-full p-8 rounded-lg shadow-2xl relative my-auto">
            {/* Modal Controls (Not printed) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-300 no-print">
              <span className="text-sm font-bold text-gray-800">
                Print Preview: Al Murtaza Shah Taekwondo Official Admission Form
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintPreview(false)}
                  className="p-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PHYSICAL FORM EXACT PRINTABLE LAYOUT */}
            <div className="border-4 border-double border-gray-900 p-6 space-y-4">
              <div className="text-center border-b-2 border-gray-900 pb-3">
                <div className="text-xl font-black tracking-wider uppercase font-serif">
                  AL MURTAZA SHAH TAEKWONDO ACADEMY
                </div>
                <div className="text-base font-bold font-urdu">
                  المurtضٰی شاہ تائیکوانڈو اکیڈمی کوہاٹ
                </div>
                <p className="text-xs font-sans text-gray-700">
                  Abdur Rehman Plaza, Markaz Road, Chogi No. 7, Kohat • Contact: 0335-9117230
                </p>
                <p className="text-[11px] font-sans font-medium text-gray-600">
                  Affiliated with Pakistan Taekwondo Federation & KPK Taekwondo Association
                </p>
                <div className="mt-2 inline-block px-4 py-1 border border-gray-800 text-xs font-bold uppercase tracking-widest bg-gray-100">
                  OFFICIAL ADMISSION FORM • داخلہ فارم
                </div>
              </div>

              {/* Photo & Basic Details Grid */}
              <div className="flex justify-between gap-6 pt-2">
                <div className="flex-1 space-y-3 text-xs">
                  <div className="flex items-center border-b border-gray-400 pb-1">
                    <span className="w-44 font-bold">Registration / Roll No:</span>
                    <span className="font-mono font-bold text-gray-800">________________________</span>
                  </div>
                  <div className="flex items-center border-b border-gray-400 pb-1">
                    <span className="w-44 font-bold">Student Name (طالبعلم کا نام):</span>
                    <span className="font-semibold text-gray-900">{formData.fullName || '________________________'}</span>
                  </div>
                  <div className="flex items-center border-b border-gray-400 pb-1">
                    <span className="w-44 font-bold">Father's Name (والد کا نام):</span>
                    <span className="font-semibold text-gray-900">{formData.fatherName || '________________________'}</span>
                  </div>
                  <div className="flex items-center border-b border-gray-400 pb-1">
                    <span className="w-44 font-bold">Date of Birth (تاریخ پیدائش):</span>
                    <span>{formData.dob || '____ / ____ / ________'} (Age: {formData.age || '____'})</span>
                  </div>
                  <div className="flex items-center border-b border-gray-400 pb-1">
                    <span className="w-44 font-bold">Nationality / Cast (قومیت):</span>
                    <span>{formData.nationalityCast || 'Pakistani / Bangash'}</span>
                  </div>
                  <div className="flex items-center border-b border-gray-400 pb-1">
                    <span className="w-44 font-bold">CNIC / Form-B (شناختی کارڈ):</span>
                    <span className="font-mono">{formData.cnicFormB || '_____-_______-_'}</span>
                  </div>
                </div>

                <div className="w-32 h-40 border-2 border-gray-800 flex flex-col items-center justify-center p-1 text-center">
                  {photo ? (
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[10px] text-gray-500">
                      Passport Size Photo<br />پاسپورٹ سائز تصویر
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & Education Details */}
              <div className="space-y-3 text-xs pt-2">
                <div className="flex items-center border-b border-gray-400 pb-1">
                  <span className="w-44 font-bold">Contact No (فون نمبر):</span>
                  <span className="font-mono font-bold">{formData.phone || '0335-_________'}</span>
                  <span className="ml-8 font-bold">WhatsApp:</span>
                  <span className="ml-2 font-mono">{formData.whatsapp || '0335-_________'}</span>
                </div>
                <div className="flex items-center border-b border-gray-400 pb-1">
                  <span className="w-44 font-bold">Address (مستقل پتہ):</span>
                  <span>{formData.permanentAddress || 'Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat'}</span>
                </div>
                <div className="flex items-center border-b border-gray-400 pb-1">
                  <span className="w-44 font-bold">Education (تعلیمی قابلیت):</span>
                  <span>{formData.education}</span>
                  <span className="ml-8 font-bold">Initial Belt Rank:</span>
                  <span className="ml-2 font-bold">{formData.currentBelt} Belt</span>
                </div>
                <div className="flex items-center border-b border-gray-400 pb-1">
                  <span className="w-44 font-bold">Monthly Fee:</span>
                  <span className="font-bold">PKR {formData.fixedMonthlyFee}</span>
                  <span className="ml-8 font-bold">Admission Fee:</span>
                  <span className="ml-2 font-bold">PKR {formData.admissionFee}</span>
                </div>
              </div>

              {/* Physical Rules & Undertaking */}
              <div className="border border-gray-400 p-3 text-[11px] leading-tight space-y-1 bg-gray-50">
                <p className="font-bold">Undertaking & Agreement / اقرار نامہ:</p>
                <p>
                  1. The student will strictly follow academy martial arts discipline and respect instructors and peers.<br />
                  2. Monthly academy fees must be paid on or before the 10th of every calendar month.<br />
                  3. In case of any sports injury during regular training, the academy will provide first aid; instructors are not liable for accidental sports injuries.
                </p>
                <p className="font-urdu text-right text-[10px] pt-1">
                  میں اقرار کرتا ہوں کہ مندرجہ بالا تمام کوائف درست ہیں اور میں اکیڈمی کے تمام اصولوں کی مکمل پابندی کروں گا۔
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="flex justify-between items-end pt-8 text-xs font-bold">
                <div className="text-center w-52">
                  <div className="border-b-2 border-gray-900 pb-1">
                    {formData.guardianSignature || '________________________'}
                  </div>
                  <div className="mt-1">Signature of Guardian / والد یا سرپرست</div>
                </div>

                <div className="text-center w-56">
                  <div className="border-b-2 border-gray-900 pb-1 font-serif text-blue-900 font-bold">
                    Murtaza Hassan Bangash
                  </div>
                  <div className="mt-1">
                    Head Instructor / President KPK TKD<br />
                    <span className="text-[10px] font-normal">6th Dan WTF, 7th Dan PTF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
