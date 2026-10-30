import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EditStudentModal } from './EditStudentModal.jsx';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ExternalLink,
  CreditCard,
  Edit2,
  Power,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

export const StudentListView = ({
  onOpenProfile,
  onNavigateAdmission,
  onCollectFee
}) => {
  const { colors, theme, mode } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBelt, setSelectedBelt] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents({
        search,
        belt: selectedBelt,
        status: selectedStatus
      });
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedBelt, selectedStatus]);

  // Handle Quick Toggle Active / Inactive
  const handleToggleStatus = async (student) => {
    const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    const confirmText = newStatus === 'Inactive'
      ? `Mark ${student.fullName} as INACTIVE?\n\n• Student will be excluded from attendance marking.\n• All previous attendance and fee records remain preserved.`
      : `Reactivate ${student.fullName}?\n\n• Student will be immediately eligible for attendance scanning.`;

    if (!window.confirm(confirmText)) return;

    try {
      setStatusUpdatingId(student._id);
      const res = await api.updateStudent(student._id, { status: newStatus });
      if (res.success) {
        setStudents((prev) =>
          prev.map((s) => (s._id === student._id ? { ...s, status: newStatus } : s))
        );
        showToast(`${student.fullName} marked ${newStatus}`);
      } else {
        showToast(res.message || 'Failed to update status', true);
      }
    } catch (err) {
      console.error('Error toggling student status:', err);
      showToast(err.response?.data?.message || err.message || 'Error updating status', true);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleEditSaved = (updatedStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
    );
    showToast(`Updated ${updatedStudent.fullName}`);
  };

  const beltColors = {
    White: mode === 'dark' ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-100 text-slate-800 border-slate-300',
    Yellow: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/40',
    Green: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
    Blue: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40',
    Red: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40',
    Black: 'bg-slate-900 text-amber-400 border-amber-500/80'
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in ${
            toastMessage.isError
              ? 'bg-red-500 text-white border-red-600'
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}
        >
          {toastMessage.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border shadow-sm transition-all"
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
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Student Directory
            </h1>
          </div>
          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
            Manage active student rosters, update student details, and collect fees.
          </p>
        </div>

        <div>
          <button
            onClick={onNavigateAdmission}
            className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-3 rounded-xl border flex flex-col lg:flex-row items-center justify-between gap-3 transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        {/* Search input with clear button */}
        <div className="relative w-full lg:w-96">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5" style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder="Search by student name, father name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-lg border text-xs focus:outline-none transition"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.textPrimary
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded hover:opacity-80"
              style={{ color: colors.textMuted }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto text-xs">
          {/* Status Quick Filter Pills */}
          <div
            className="flex items-center p-0.5 rounded-lg border"
            style={{
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border
            }}
          >
            {['All', 'Active', 'Inactive'].map((st) => {
              const isSelected = selectedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold transition"
                  style={{
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    color: isSelected ? '#FFFFFF' : colors.textSecondary
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Belt Dropdown */}
          <div className="flex items-center gap-1.5">
            <span style={{ color: colors.textSecondary }}>Belt:</span>
            <select
              value={selectedBelt}
              onChange={(e) => setSelectedBelt(e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none border transition"
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.textPrimary
              }}
            >
              <option value="All">All Belts</option>
              <option value="White">White Belt</option>
              <option value="Yellow">Yellow Belt</option>
              <option value="Green">Green Belt</option>
              <option value="Blue">Blue Belt</option>
              <option value="Red">Red Belt</option>
              <option value="Black">Black Belt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div
          className="p-10 rounded-xl border text-center flex flex-col items-center justify-center gap-2"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            color: colors.textSecondary
          }}
        >
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.primary }} />
          <span className="text-xs">Loading students...</span>
        </div>
      ) : students.length === 0 ? (
        <div
          className="p-10 rounded-xl border text-center"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            color: colors.textSecondary
          }}
        >
          <p className="text-xs font-medium">No students match your search criteria.</p>
          <button
            onClick={() => { setSearch(''); setSelectedBelt('All'); setSelectedStatus('All'); }}
            className="mt-2 text-xs font-bold underline"
            style={{ color: colors.primary }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map((st) => {
            const isActive = st.status === 'Active';
            const isInactive = st.status === 'Inactive';
            const isUpdating = statusUpdatingId === st._id;

            return (
              <div
                key={st._id}
                className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between shadow-sm hover:shadow group relative ${
                  isInactive ? 'opacity-85' : ''
                }`}
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: isInactive ? (mode === 'dark' ? '#334155' : '#cbd5e1') : colors.border
                }}
              >
                <div>
                  {/* Top card row: Student photo, Info, Belt and Status badges */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      {st.photo ? (
                        <img
                          src={st.photo}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border flex-shrink-0"
                          style={{ borderColor: colors.border }}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{
                            backgroundColor: colors.bgSecondary,
                            color: colors.textPrimary
                          }}
                        >
                          {st.fullName ? st.fullName[0] : 'S'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold leading-tight" style={{ color: colors.textPrimary }}>
                            {st.fullName}
                          </h3>
                        </div>
                        <div className="text-[11px]" style={{ color: colors.textSecondary }}>
                          S/O {st.fatherName}
                        </div>
                        <div className="text-[10px] font-mono mt-0.5" style={{ color: colors.textMuted }}>
                          {st.registrationNo}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Status Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : isInactive
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : isInactive ? 'bg-red-500' : 'bg-amber-500'}`} />
                        {st.status || 'Active'}
                      </span>

                      {/* Belt Badge */}
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold border ${
                          beltColors[st.currentBelt] || 'border-current'
                        }`}
                      >
                        {st.currentBelt} Belt
                      </span>
                    </div>
                  </div>

                  {/* Student Metadata */}
                  <div
                    className="mt-3 pt-2.5 border-t text-[11px] space-y-1"
                    style={{
                      borderColor: colors.border,
                      color: colors.textSecondary
                    }}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: colors.textMuted }}>Phone:</span>
                      <span className="font-mono font-medium" style={{ color: colors.textPrimary }}>{st.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textMuted }}>Monthly Fee:</span>
                      <span className="font-mono font-bold" style={{ color: colors.primary }}>PKR {st.fixedMonthlyFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textMuted }}>Address:</span>
                      <span className="truncate max-w-[170px]" style={{ color: colors.textPrimary }}>{st.permanentAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2 border-t flex items-center justify-between gap-1.5" style={{ borderColor: colors.border }}>
                  <div className="flex items-center gap-1.5">
                    {/* Edit Student */}
                    <button
                      onClick={() => setEditingStudent(st)}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition hover:opacity-80"
                      style={{
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary
                      }}
                    >
                      <Edit2 className="w-3 h-3" style={{ color: colors.primary }} />
                      <span>Edit</span>
                    </button>

                    {/* Quick Active / Inactive Toggle */}
                    <button
                      onClick={() => handleToggleStatus(st)}
                      disabled={isUpdating}
                      title={isActive ? "Mark Inactive" : "Reactivate"}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition ${
                        isActive
                          ? 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                          : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Power className="w-3 h-3" />
                      )}
                      <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onCollectFee(st._id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition hover:scale-105"
                      style={{
                        backgroundColor: colors.badgeBg,
                        borderColor: colors.border,
                        color: colors.primary
                      }}
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Fee</span>
                    </button>

                    <button
                      onClick={() => onOpenProfile(st._id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition hover:scale-105"
                      style={{
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary
                      }}
                    >
                      <ExternalLink className="w-3 h-3 text-cyan-500" />
                      <span>Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          onSaveSuccess={handleEditSaved}
        />
      )}
    </div>
  );
};
export default StudentListView;