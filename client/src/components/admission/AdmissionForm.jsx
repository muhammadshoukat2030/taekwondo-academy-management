import React, { useState, useRef } from 'react';
import { api } from '../../api/api.js';
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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 lg:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
              <FileCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white">
              Official Digital Admission Desk
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exact replica of the physical Urdu/English admission form with instant ledger auto-initialization & biometric readiness
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPrintPreview(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Blank Form Print</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Digital Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-8 shadow-xl">
          {/* Header of Form */}
          <div className="text-center pb-6 border-b border-slate-800">
            <h2 className="text-lg lg:text-xl font-black tracking-wide text-white uppercase">
              AL MURTAZA SHAH TAEKWONDO ACADEMY
            </h2>
            <div className="text-xs text-red-400 font-semibold font-urdu mt-0.5">
              المurtضٰی شاہ تائیکوانڈو اکیڈمی کوہاٹ
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Affiliated with Khyber Pakhtunkhwa Taekwondo Association & Pakistan Taekwondo Federation
            </p>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300">
              ADMISSION & REGISTRATION FORM • داخلہ فارم
            </div>
          </div>

          {/* Section 1: Personal Details & Photo */}
          <div className="mt-6">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <span>1. Personal Information</span>
                <span className="text-[11px] font-normal text-slate-400 font-urdu">(ذاتی کوائف)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Photo Box */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border-2 border-dashed border-slate-800 text-center">
                <div className="w-36 h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center relative shadow-inner">
                  {cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : photo ? (
                    <img src={photo} alt="Passport" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                      <Camera className="w-8 h-8 mb-1 text-slate-400" />
                      <span className="text-[10px] uppercase font-semibold">Passport Photo</span>
                      <span className="text-[9px] text-slate-400 font-urdu">پاسپورٹ سائز تصویر</span>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                <div className="flex items-center gap-2 mt-3 w-full">
                  {cameraActive ? (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Capture Snapshot
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-1/2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium flex items-center justify-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Webcam</span>
                    </button>
                  )}

                  <label className="w-1/2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer border border-slate-700">
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <span className="text-[9px] text-slate-400 mt-1">Used for AI Face Recognition</span>
              </div>

              {/* Form inputs */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Full Name <span className="font-urdu text-slate-400 font-normal">(طالبعلم کا پورا نام)</span> *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abdul Basit"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Father / Guardian Name <span className="font-urdu text-slate-400 font-normal">(والد / سرپرست کا نام)</span> *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qari Sabir"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date of Birth <span className="font-urdu text-slate-400 font-normal">(تاریخ پیدائش)</span> *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Age <span className="font-urdu text-slate-400 font-normal">(عمر)</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      placeholder="Auto"
                      value={formData.age}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono font-bold text-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gender <span className="font-urdu text-slate-400 font-normal">(جنس)</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Male">Male (مرد)</option>
                      <option value="Female">Female (خاتون)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nationality / Cast <span className="font-urdu text-slate-400 font-normal">(قومیت)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pakistani / Bangash"
                    value={formData.nationalityCast}
                    onChange={(e) => setFormData({ ...formData, nationalityCast: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CNIC / Form-B No. <span className="font-urdu text-slate-400 font-normal">(شناختی کارڈ یا ب فارم)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14301-8923412-1"
                    value={formData.cnicFormB}
                    onChange={(e) => setFormData({ ...formData, cnicFormB: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Education */}
          <div className="mt-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <span>2. Contact & Educational Profile</span>
                <span className="text-[11px] font-normal text-slate-400 font-urdu">(رابطہ و تعلیمی قابلیت)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cell / WhatsApp No. <span className="font-urdu text-slate-400 font-normal">(فون / واٹس ایپ)</span> *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0335-9117230"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="font-urdu text-slate-400 font-normal">(ای میل)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Educational Level <span className="font-urdu text-slate-400 font-normal">(تعلیمی قابلیت)</span>
                </label>
                <select
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Primary / Middle">Primary / Middle (پرائمری تا مڈل)</option>
                  <option value="Matric">Matric (میٹرک)</option>
                  <option value="FSc / FA / ICS">FSc / FA / ICS (انٹرمیڈیٹ)</option>
                  <option value="BS / Graduation">BS / Graduation (گریجویشن)</option>
                  <option value="Master / Post-Grad">Master / Post-Grad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Permanent Address <span className="font-urdu text-slate-400 font-normal">(مستقل پتہ)</span> *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohallah Mufti Shah, Kohat"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Medical & Sports History */}
          <div className="mt-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <span>3. Sports Experience & Medical Health</span>
                <span className="text-[11px] font-normal text-slate-400 font-urdu">(طبی و اسپورٹس معلومات)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="hasPlayedBefore"
                  checked={formData.hasPlayedBefore}
                  onChange={(e) => setFormData({ ...formData, hasPlayedBefore: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="hasPlayedBefore" className="text-xs cursor-pointer">
                  <span className="font-semibold text-white block">
                    Have you ever played Taekwondo or any other martial art before?
                  </span>
                  <span className="text-[11px] text-slate-400 font-urdu block mt-0.5">
                    کیا آپ نے پہلے تائیکوانڈو یا کوئی اور کھیل کھیلا ہے؟
                  </span>
                </label>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="hasIllnessInjury"
                    checked={formData.hasIllnessInjury}
                    onChange={(e) => setFormData({ ...formData, hasIllnessInjury: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="hasIllnessInjury" className="text-xs cursor-pointer">
                    <span className="font-semibold text-white block">
                      Any chronic illness, bone injury, or medical condition?
                    </span>
                    <span className="text-[11px] text-slate-400 font-urdu block mt-0.5">
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
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Fee Structure & Belt */}
          <div className="mt-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <span>4. Fee Setup & Initial Belt Rank</span>
                <span className="text-[11px] font-normal text-slate-400 font-urdu">(فیس اور بیلٹ کی تفصیل)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admission Date <span className="font-urdu text-slate-400 font-normal">(تاریخ داخلہ)</span>
                </label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fixed Monthly Fee (PKR) <span className="font-urdu text-slate-400 font-normal">(ماہانہ فیس)</span>
                </label>
                <input
                  type="number"
                  value={formData.fixedMonthlyFee}
                  onChange={(e) => setFormData({ ...formData, fixedMonthlyFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  One-time Admission Fee (PKR) <span className="font-urdu text-slate-400 font-normal">(داخلہ فیس)</span>
                </label>
                <input
                  type="number"
                  value={formData.admissionFee}
                  onChange={(e) => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Belt Rank <span className="font-urdu text-slate-400 font-normal">(بیلٹ رینک)</span>
                </label>
                <select
                  value={formData.currentBelt}
                  onChange={(e) => setFormData({ ...formData, currentBelt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none font-semibold"
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
          <div className="mt-8 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-2">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.guardianConsent}
                  onChange={(e) => setFormData({ ...formData, guardianConsent: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="consent" className="cursor-pointer">
                  <span className="font-bold text-white">Declaration & Academy Rules Consent / حلف نامہ:</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    I hereby certify that all information submitted is accurate. The student will abide by all academy discipline, sparring guidelines, and timely monthly fee dues. The academy is not responsible for injuries sustained during standard martial arts sparring.
                  </p>
                  <p className="text-[10px] text-slate-400 font-urdu mt-0.5">
                    میں اقرار کرتا ہوں کہ مندرجہ بالا کوائف درست ہیں اور میں اکیڈمی کے جملہ قواعد و ضوابط اور ماہانہ فیس کی بروقت ادائیگی کا پابند رہوں گا۔
                  </p>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Guardian / Parent Signature <span className="font-urdu text-slate-400 font-normal">(دستخط والد یا سرپرست)</span>
                </label>
                <input
                  type="text"
                  placeholder="Type Full Name to Sign e.g. Qari Sabir"
                  value={formData.guardianSignature}
                  onChange={(e) => setFormData({ ...formData, guardianSignature: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-cursive text-amber-300 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Head Instructor Approval <span className="font-urdu text-slate-400 font-normal">(دستخط ہیڈ انسٹرکٹر)</span>
                </label>
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-red-400 flex items-center justify-between">
                  <span>Murtaza Hassan Bangash</span>
                  <span className="text-[10px] text-slate-400">6th Dan WTF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Submitting auto-initializes Registration No, Fee Ledger & Biometric Desk.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSuccessModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">
                Student Registered Successfully!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Official Registration No: <span className="font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">{successModal.registrationNo}</span>
              </p>
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-semibold text-white">{successModal.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Father's Name:</span>
                <span className="text-white">{successModal.fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Monthly Fee:</span>
                <span className="font-mono text-emerald-400 font-bold">PKR {successModal.fixedMonthlyFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Admission Fee:</span>
                <span className="font-mono text-amber-400 font-bold">PKR {successModal.admissionFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Ledger Status:</span>
                <span className="text-rose-400 font-semibold">Initialized (PKR {successModal.fixedMonthlyFee + successModal.admissionFee} Total Due)</span>
              </div>
            </div>

            {/* Prompt for Biometric Registration */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSuccessModal(null);
                  if (onNavigateToBiometrics) onNavigateToBiometrics(successModal._id);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-950"
              >
                <Camera className="w-4 h-4" />
                <span>Enroll Biometrics / Face ID Now</span>
              </button>
              <button
                type="button"
                onClick={() => setSuccessModal(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
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
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
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
