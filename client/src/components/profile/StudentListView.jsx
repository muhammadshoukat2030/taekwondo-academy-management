import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EditStudentModal } from './EditStudentModal.jsx';
import { StudentCardSkeleton } from '../common/Skeleton.jsx';
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
              : 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20'
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
              className="p-1.5 rounded-lg border flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300"
            >
              <Users className="w-4 h-4" />
            </span>
            <h1
              className="text-[20px] sm:text-[22px] font-bold tracking-tight"
              style={{ color: colors.textHeading }}
            >
              Student Directory
            </h1>
          </div>
          <p
            className="text-[12px] sm:text-[13px] font-normal mt-0.5 leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Manage active student rosters, update student details, and collect fees.
          </p>
        </div>

        <div>
          <button
            onClick={onNavigateAdmission}
            className="px-3.5 py-1.5 rounded-lg text-white text-[12.5px] font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-white" />
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
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, father name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-lg border text-[13px] font-normal bg-white dark:bg-[#142238] border-[#CBD5E1] dark:border-[#2B3B52] text-[#334155] dark:text-[#D7E0EC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto text-[12.5px]">
          {/* Status Quick Filter Pills */}
          <div
            className="flex items-center p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
          >
            {['All', 'Active', 'Inactive'].map((st) => {
              const isSelected = selectedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className="px-2.5 py-1 rounded-md text-[12px] font-medium transition cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? '#2563EB' : 'transparent',
                    color: isSelected ? '#FFFFFF' : (mode === 'dark' ? '#CBD5E1' : '#334155')
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Belt Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Belt:</span>
            <select
              value={selectedBelt}
              onChange={(e) => setSelectedBelt(e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium focus:outline-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Belts</option>
              <option value="White" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">White Belt</option>
              <option value="Yellow" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Yellow Belt</option>
              <option value="Green" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Green Belt</option>
              <option value="Blue" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Blue Belt</option>
              <option value="Red" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Red Belt</option>
              <option value="Black" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Black Belt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <StudentCardSkeleton key={i} />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div
          className="p-10 rounded-xl border text-center"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No students match your search criteria.</p>
          <button
            onClick={() => { setSearch(''); setSelectedBelt('All'); setSelectedStatus('All'); }}
            className="mt-2 text-xs font-bold underline text-blue-600 dark:text-blue-400 cursor-pointer"
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
                className="p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between shadow-xs hover:shadow group"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border
                }}
              >
                {/* Clickable Card Body to Open Student Profile */}
                <div
                  onClick={() => onOpenProfile(st._id)}
                  className="cursor-pointer group-hover:opacity-95 transition"
                  title={`Click to view profile of ${st.fullName}`}
                >
                  {/* Top card row: Student photo, Info, Belt and Status badges */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      {st.photo ? (
                        <img
                          loading="lazy"
                          src={st.photo}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-300 dark:border-slate-600 flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200"
                        >
                          {st.fullName ? st.fullName[0] : 'S'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3
                            className="text-[14px] font-semibold leading-tight tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition"
                            style={{ color: colors.textHeading }}
                          >
                            {st.fullName}
                          </h3>
                        </div>
                        <div
                          className="text-[12px] font-normal"
                          style={{ color: colors.textSecondary }}
                        >
                          S/O {st.fatherName}
                        </div>
                        <div className="text-[11px] font-mono-numbers font-medium text-blue-700 dark:text-blue-300 mt-0.5">
                          {st.registrationNo}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Status Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10.5px] font-medium border flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400'
                            : isInactive
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        {st.status || 'Active'}
                      </span>

                      {/* Belt Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10.5px] font-medium border ${
                          beltColors[st.currentBelt] || 'border-current'
                        }`}
                      >
                        {st.currentBelt} Belt
                      </span>
                    </div>
                  </div>

                  {/* Student Metadata */}
                  <div
                    className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-[12px] space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-normal" style={{ color: colors.textSecondary }}>Phone:</span>
                      <span
                        className="font-mono-numbers font-medium text-[12px]"
                        style={{ color: colors.textPrimary }}
                      >
                        {st.phone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-normal" style={{ color: colors.textSecondary }}>Monthly Fee:</span>
                      <span className="font-mono-numbers font-semibold text-[12px] text-emerald-700 dark:text-emerald-400">PKR {st.fixedMonthlyFee}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-normal" style={{ color: colors.textSecondary }}>Address:</span>
                      <span
                        className="truncate max-w-[170px] text-[11.5px] font-normal"
                        style={{ color: colors.textPrimary }}
                      >
                        {st.permanentAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* Edit Student */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingStudent(st);
                      }}
                      className="px-2 py-1 rounded-md text-[12px] font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1 transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Edit</span>
                    </button>

                    {/* Quick Active / Inactive Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(st);
                      }}
                      disabled={isUpdating}
                      title={isActive ? "Mark Inactive" : "Reactivate"}
                      className={`px-2 py-1 rounded-md text-[11.5px] font-bold border flex items-center gap-1 transition cursor-pointer ${
                        isActive
                          ? 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onCollectFee(st._id);
                      }}
                      className="px-2.5 py-1 rounded-md text-[11.5px] font-bold border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 flex items-center gap-1 transition hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Fee</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProfile(st._id);
                      }}
                      className="px-2.5 py-1 rounded-md text-[11.5px] font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1 transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3 text-blue-600 dark:text-blue-400" />
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