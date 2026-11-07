import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  X,
  Save,
  User,
  Phone,
  MapPin,
  Calendar,
  Award,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Power,
  GraduationCap,
  FileText,
  Activity
} from 'lucide-react';

export const EditStudentModal = ({ student, isOpen, onClose, onSaveSuccess }) => {
  const { colors, mode } = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    dob: '',
    age: '',
    gender: 'Male',
    nationalityCast: '',
    cnicFormB: '',
    phone: '',
    whatsapp: '',
    permanentAddress: '',
    education: '',
    fixedMonthlyFee: 1000,
    admissionFee: 1500,
    currentBelt: 'White',
    status: 'Active',
    admissionDate: '',
    sportsHistory: '',
    medicalCondition: '',
    photo: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.fullName || '',
        fatherName: student.fatherName || '',
        dob: student.dob ? student.dob.substring(0, 10) : '',
        age: student.age || '',
        gender: student.gender || 'Male',
        nationalityCast: student.nationalityCast || '',
        cnicFormB: student.cnicFormB || '',
        phone: student.phone || '',
        whatsapp: student.whatsapp || '',
        permanentAddress: student.permanentAddress || '',
        education: student.education || '',
        fixedMonthlyFee: student.fixedMonthlyFee !== undefined ? student.fixedMonthlyFee : 1000,
        admissionFee: student.admissionFee !== undefined ? student.admissionFee : 1500,
        currentBelt: student.currentBelt || 'White',
        status: student.status || 'Active',
        admissionDate: student.admissionDate ? student.admissionDate.substring(0, 10) : '',
        sportsHistory: student.sportsHistory || '',
        medicalCondition: student.medicalCondition || '',
        photo: student.photo || ''
      });
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto recalculate age if dob changed
      if (name === 'dob' && value) {
        const birthDate = new Date(value);
        if (!isNaN(birthDate.getTime())) {
          const diff = Date.now() - birthDate.getTime();
          const calculatedAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);
          updated.age = calculatedAge;
        }
      }
      return updated;
    });
  };

  const handleStatusToggle = (newStatus) => {
    setFormData((prev) => ({ ...prev, status: newStatus }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!formData.fatherName.trim()) {
      setErrorMsg('Father Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Contact phone number is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.updateStudent(student._id, {
        ...formData,
        fixedMonthlyFee: Number(formData.fixedMonthlyFee) || 0,
        admissionFee: Number(formData.admissionFee) || 0,
        age: Number(formData.age) || undefined
      });

      if (res.success) {
        setSuccessMsg(`Student profile for "${formData.fullName}" updated successfully!`);
        setTimeout(() => {
          if (onSaveSuccess) onSaveSuccess(res.data || { ...student, ...formData });
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message || 'Failed to update student profile.');
      }
    } catch (err) {
      console.error('Error updating student:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Server error occurred while updating student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between gap-3"
          style={{
            backgroundColor: colors.bgSecondary,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="p-2 rounded-xl border flex items-center justify-center"
              style={{
                backgroundColor: colors.badgeBg,
                borderColor: colors.border,
                color: colors.primary
              }}
            >
              <User className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] sm:text-[19px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                  Edit Student Profile
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-mono-numbers font-medium border"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                >
                  {student.registrationNo}
                </span>
              </div>
              <p className="text-[12.5px] font-normal" style={{ color: colors.textSecondary }}>
                Update personal, contact, belt rank, fee structure, and status
              </p>
            </div>
          </div>

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

        {/* Notifications */}
        {errorMsg && (
          <div className="m-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Quick Control Banner */}
          <div
            className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-xs font-bold" style={{ color: colors.textPrimary }}>
                  Enrollment Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    formData.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                      : formData.status === 'Inactive'
                      ? 'bg-red-500/20 text-red-500 border-red-500/40'
                      : 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                  }`}
                >
                  ● {formData.status}
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
                {formData.status === 'Active'
                  ? 'Active students appear in daily attendance scanning & monthly registers.'
                  : 'Inactive students are excluded from attendance marking while retaining all history.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {['Active', 'Inactive', 'On Leave'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusToggle(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    formData.status === st
                      ? 'shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      formData.status === st
                        ? st === 'Active'
                          ? colors.primary
                          : st === 'Inactive'
                          ? '#ef4444'
                          : '#f59e0b'
                        : colors.bgCard,
                    color: formData.status === st ? '#ffffff' : colors.textPrimary,
                    borderColor: formData.status === st ? 'transparent' : colors.border
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
              <User className="w-3.5 h-3.5" style={{ color: colors.primary }} />
              Personal Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Student Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Father / Guardian Name *
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  CNIC / B-Form Number
                </label>
                <input
                  type="text"
                  name="cnicFormB"
                  value={formData.cnicFormB}
                  onChange={handleChange}
                  placeholder="e.g. 14301-xxxxxxx-x"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Nationality / Cast
                </label>
                <input
                  type="text"
                  name="nationalityCast"
                  value={formData.nationalityCast}
                  onChange={handleChange}
                  placeholder="e.g. Pakistani / Bangash"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Contact & Residence */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: colors.border }}>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
              <Phone className="w-3.5 h-3.5" style={{ color: colors.primary }} />
              Contact & Residence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Phone / Mobile *
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="0335-9117230"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition font-mono"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="0335-9117230"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition font-mono"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Permanent Address
                </label>
                <input
                  type="text"
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  placeholder="Mohallah, Sector, City"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Education / School / College
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. Matric / FSc"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Photo URL
                </label>
                <input
                  type="text"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Martial Arts & Academy Record */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: colors.border }}>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
              <Award className="w-3.5 h-3.5" style={{ color: colors.primary }} />
              Martial Arts & Belt Rank
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Current Belt Rank
                </label>
                <select
                  name="currentBelt"
                  value={formData.currentBelt}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border focus:outline-none transition font-semibold"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                >
                  <option value="White">White Belt</option>
                  <option value="Yellow">Yellow Belt</option>
                  <option value="Green">Green Belt</option>
                  <option value="Blue">Blue Belt</option>
                  <option value="Red">Red Belt</option>
                  <option value="Black">Black Belt (Poom/Dan)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Admission Date
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Medical / Physical Notes
                </label>
                <input
                  type="text"
                  name="medicalCondition"
                  value={formData.medicalCondition}
                  onChange={handleChange}
                  placeholder="None / Fit / Specific"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Fee Structure */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: colors.border }}>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
              <DollarSign className="w-3.5 h-3.5" style={{ color: colors.primary }} />
              Fee Structure (PKR)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Fixed Monthly Tuition Fee (PKR)
                </label>
                <input
                  type="number"
                  name="fixedMonthlyFee"
                  value={formData.fixedMonthlyFee}
                  onChange={handleChange}
                  required
                  min="0"
                  step="50"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition font-mono font-bold"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.primary
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Admission Fee (PKR)
                </label>
                <input
                  type="number"
                  name="admissionFee"
                  value={formData.admissionFee}
                  onChange={handleChange}
                  min="0"
                  step="50"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition font-mono font-bold"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            className="pt-4 border-t flex items-center justify-end gap-2.5"
            style={{ borderColor: colors.border }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:opacity-80"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditStudentModal;