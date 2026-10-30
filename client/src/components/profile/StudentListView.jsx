import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ExternalLink,
  CreditCard
} from 'lucide-react';

export const StudentListView = ({
  onOpenProfile,
  onNavigateAdmission,
  onCollectFee
}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBelt, setSelectedBelt] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

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

  const beltColors = {
    White: 'bg-slate-200 text-slate-900 border-slate-300',
    Yellow: 'bg-yellow-400 text-yellow-950 border-yellow-500',
    Green: 'bg-emerald-600 text-white border-emerald-500',
    Blue: 'bg-blue-600 text-white border-blue-500',
    Red: 'bg-red-600 text-white border-red-500',
    Black: 'bg-slate-950 text-amber-400 border-amber-500/80'
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 lg:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white">
              Student Master Command & Registry
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete lifecycle registry with 360° dossiers, biometric readiness, and real-time ledger audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateAdmission}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Student Admission</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, father name, roll no, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Belt:</span>
            <select
              value={selectedBelt}
              onChange={(e) => setSelectedBelt(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((st) => (
          <div
            key={st._id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-lg group relative"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {st.photo ? (
                    <img
                      src={st.photo}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 group-hover:border-red-500 transition"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-base">
                      {st.fullName[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition">
                      {st.fullName}
                    </h3>
                    <div className="text-xs text-slate-400">
                      S/O {st.fatherName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {st.registrationNo}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    beltColors[st.currentBelt] || 'bg-slate-800 text-white'
                  }`}
                >
                  {st.currentBelt}
                </span>
              </div>

              {/* Student Metadata Pill */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact / Phone:</span>
                  <span className="font-mono text-white">{st.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="truncate max-w-[180px]">{st.permanentAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Fee:</span>
                  <span className="font-mono text-emerald-400 font-bold">PKR {st.fixedMonthlyFee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Biometrics:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        st.isFaceEnrolled ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      Face AI
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        st.isFingerprintEnrolled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      Fingerprint
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onCollectFee(st._id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Collect Fee</span>
              </button>

              <button
                onClick={() => onOpenProfile(st._id)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>360° Profile</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
