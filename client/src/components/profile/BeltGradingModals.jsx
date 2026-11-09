import React, { useState } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  X,
  Award,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const BeltPromotionModal = ({ student, isOpen, onClose, onPromoted }) => {
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    previousBelt: student?.currentBelt || 'White',
    beltPromotedTo: 'Yellow',
    examDate: new Date().toISOString().split('T')[0],
    marks: '85/100',
    result: 'Pass',
    examiner: 'Murtaza Hassan Bangash (6th Dan WTF)',
    venue: 'Al Murtaza Shah TKD Dojang / Kohat Sports Complex',
    remarks: 'Demonstrated excellent Poomsye (form), sparring drills, and physical stamina.'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.beltPromotedTo) {
      setErrorMsg('Please select a belt to promote to.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.createAchievement({
        studentId: student._id,
        category: 'BeltPromotion',
        title: `Promotion Exam: ${formData.beltPromotedTo} Belt`,
        previousBelt: student.currentBelt,
        beltPromotedTo: formData.beltPromotedTo,
        marks: formData.marks,
        result: formData.result,
        examiner: formData.examiner,
        venue: formData.venue,
        date: formData.examDate,
        remarks: formData.remarks
      });

      if (res.success) {
        setSuccessMsg(`Congratulations! Student successfully promoted to ${formData.beltPromotedTo} Belt!`);
        if (onPromoted) onPromoted(res.data, formData.beltPromotedTo);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Failed to record belt promotion.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error recording belt promotion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div
        className="border rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: colors.badgeBg, color: colors.primary }}>
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                Record Official Belt Promotion Exam
              </h3>
              <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                Candidate: {student.fullName} (Current: {student.currentBelt} Belt)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg border hover:opacity-75" style={{ borderColor: colors.border }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Current Belt Rank
              </label>
              <input
                type="text"
                disabled
                value={`${student.currentBelt} Belt`}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold opacity-75"
                style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Promoted Belt Rank *
              </label>
              <select
                name="beltPromotedTo"
                value={formData.beltPromotedTo}
                onChange={handleChange}
                required
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.primary }}
              >
                <option value="Yellow">Yellow Belt</option>
                <option value="Green">Green Belt</option>
                <option value="Blue">Blue Belt</option>
                <option value="Red">Red Belt</option>
                <option value="Black">Black Belt (1st Dan)</option>
                <option value="2nd Dan">Black Belt (2nd Dan)</option>
                <option value="3rd Dan">Black Belt (3rd Dan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Exam Date
              </label>
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Marks / Score
              </label>
              <input
                type="text"
                name="marks"
                placeholder="e.g. 85/100"
                value={formData.marks}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Grading Result
              </label>
              <select
                name="result"
                value={formData.result}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
              >
                <option value="Pass">Pass (کامیاب)</option>
                <option value="Distinction">Distinction (امتیازی)</option>
                <option value="Honors">Honors (اعزازی)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
              Lead Official Examiner
            </label>
            <input
              type="text"
              name="examiner"
              value={formData.examiner}
              onChange={handleChange}
              className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
              Examination Venue
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
              Examiner Remarks & Assessment
            </label>
            <textarea
              name="remarks"
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Form execution, sparring control, power breaking performance..."
              className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
            />
          </div>

          <div className="pt-2 border-t flex justify-end gap-2" style={{ borderColor: colors.border }}>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border"
              style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
              <span>Save Belt Promotion</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const MedalAwardModal = ({ student, isOpen, onClose, onAwarded }) => {
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    title: 'KP Provincial Taekwondo Championship 2026',
    category: 'Tournament',
    medal: 'Gold',
    date: new Date().toISOString().split('T')[0],
    venue: 'Qayyum Stadium, Peshawar / Kohat Sports Complex',
    remarks: 'Won Gold Medal in Junior Sparring (Under 55kg Division).'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Title is required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.createAchievement({
        studentId: student._id,
        category: formData.category,
        title: formData.title.trim(),
        medal: formData.medal,
        date: formData.date,
        venue: formData.venue,
        remarks: formData.remarks
      });

      if (res.success) {
        setSuccessMsg('Honor / Medal recorded successfully!');
        if (onAwarded) onAwarded(res.data);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Failed to record medal/award.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error recording honor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div
        className="border rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                Award Tournament Medal / Special Honor
              </h3>
              <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                Student: {student.fullName} ({student.registrationNo})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg border hover:opacity-75" style={{ borderColor: colors.border }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
              Tournament Title / Event Name *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Honor Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
              >
                <option value="Tournament">Tournament</option>
                <option value="Medal">Medal Award</option>
                <option value="SpecialAward">Special Academy Award</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Medal Won
              </label>
              <select
                name="medal"
                value={formData.medal}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold text-amber-500 focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border }}
              >
                <option value="Gold">🥇 Gold Medal</option>
                <option value="Silver">🥈 Silver Medal</option>
                <option value="Bronze">🥉 Bronze Medal</option>
                <option value="None">None / Trophy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Award Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
                Championship Venue
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textSecondary }}>
              Remarks / Match Details
            </label>
            <textarea
              name="remarks"
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Category, score, competitor division, etc."
              className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
              style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }}
            />
          </div>

          <div className="pt-2 border-t flex justify-end gap-2" style={{ borderColor: colors.border }}>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border"
              style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
              <span>Award Medal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
