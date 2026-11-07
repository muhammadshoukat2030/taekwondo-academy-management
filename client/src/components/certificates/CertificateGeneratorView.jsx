import React, { useState, useEffect } from 'react';
import { api } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Award,
  Printer,
  Sparkles
} from 'lucide-react';

export const CertificateGeneratorView = ({ initialCertificate }) => {
  const { colors, theme, mode } = useTheme();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Certificate Parameters
  const [beltLevel, setBeltLevel] = useState('BLUE BELT');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [unit, setUnit] = useState('Al Murtaza Shah Taekwondo');
  const [nationality, setNationality] = useState('Pakistani');
  const [customCitation, setCustomCitation] = useState(
    'The above named person has successfully completed the PAKISTAN TAEKWONDO FEDERATION [BELT LEVEL] PAKISTAN TAEKWONDO Promotion Test.'
  );

  const [currentCert, setCurrentCert] = useState(initialCertificate || null);
  const [certificatesArchive, setCertificatesArchive] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, certsRes] = await Promise.all([
        api.getStudents({ status: 'Active' }),
        api.getCertificates()
      ]);
      if (studentsRes.success) setStudents(studentsRes.data);
      if (certsRes.success) {
        setCertificatesArchive(certsRes.data);
        if (!initialCertificate && certsRes.data.length > 0) {
          setCurrentCert(certsRes.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading certificate data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const found = students.find(s => s._id === selectedStudentId);
      if (found) {
        setSelectedStudent(found);
        setBeltLevel(`${found.currentBelt.toUpperCase()} BELT`);
        setNationality(found.nationalityCast ? found.nationalityCast.split('/')[0].trim() : 'Pakistani');
      }
    }
  }, [selectedStudentId, students]);

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Please select a student from the registry.');
      return;
    }

    try {
      setLoading(true);
      const citation = customCitation.replace('[BELT LEVEL]', beltLevel);
      const res = await api.issueCertificate({
        studentId: selectedStudentId,
        beltRank: beltLevel,
        beltLevel,
        issueDate,
        unit,
        citationText: citation,
        presidentName: 'Murtaza Hassan Bangash',
        presidentTitle: 'President KPK Taekwondo Association, 6th Dan Black Belt WTF, 7th Dan Black Belt PTF',
        secretaryName: 'Waqas Ahmad',
        secretaryTitle: 'Secretary General KPK Taekwondo Association'
      });

      if (res.success && res.data) {
        setCurrentCert(res.data);
        alert(res.message);
        loadData();
      }
    } catch (err) {
      console.error('Error generating certificate:', err);
      alert('Failed to issue certificate.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 lg:p-4 rounded-xl border shadow-sm no-print transition-all"
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
              <Award className="w-4 h-4" />
            </span>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight" style={{ color: colors.textHeading }}>
              Belt Promotion Certificates
            </h1>
          </div>
          <p className="text-[13px] font-normal mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>
            Official Pakistan Taekwondo Federation (PTF) and KPK Taekwondo Association belt awards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentCert && (
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-white text-[12px] font-medium flex items-center gap-1.5 shadow-xs transition hover:opacity-95 active:scale-95"
              style={{ backgroundColor: colors.primary }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Certificate Issue Controls */}
        <div
          className="lg:col-span-1 p-3.5 lg:p-4 rounded-xl border shadow-sm space-y-3 no-print transition-all"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }}
        >
          <h3 className="text-xs font-bold pb-2 border-b flex items-center justify-between" style={{ borderColor: colors.border, color: colors.textPrimary }}>
            <span>Issue Belt Promotion Certificate</span>
            <span className="text-[9.5px] font-mono text-amber-500">PTF FORMAT</span>
          </h3>

          <form onSubmit={handleIssueCertificate} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                Select Student for Promotion *
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-semibold transition"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              >
                <option value="">-- Choose Student --</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id} style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
                    {st.fullName} ({st.registrationNo}) - Current: {st.currentBelt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                Belt Level Certification *
              </label>
              <select
                value={beltLevel}
                onChange={(e) => setBeltLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-bold"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.primary
                }}
              >
                <option value="YELLOW BELT">YELLOW BELT</option>
                <option value="GREEN BELT">GREEN BELT</option>
                <option value="BLUE BELT">BLUE BELT</option>
                <option value="RED BELT">RED BELT</option>
                <option value="BLACK BELT (1ST DAN)">BLACK BELT (1ST DAN)</option>
                <option value="BLACK BELT (2ND DAN)">BLACK BELT (2ND DAN)</option>
                <option value="BLACK BELT (POOM)">BLACK BELT (POOM)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                Academy Unit Name
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
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
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
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
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: colors.textPrimary }}>
                Official Citation Text
              </label>
              <textarea
                rows={3}
                value={customCitation}
                onChange={(e) => setCustomCitation(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none resize-none leading-relaxed"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedStudentId}
              className="w-full py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition hover:scale-102 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate & Issue Certificate</span>
            </button>
          </form>

          {/* Archive List */}
          <div className="pt-3 border-t" style={{ borderColor: colors.border }}>
            <h4 className="text-[10.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
              Recently Issued Certificates
            </h4>
            <div className="space-y-1 max-h-44 overflow-y-auto">
              {certificatesArchive.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setCurrentCert(c)}
                  className="w-full p-1.5 rounded-lg text-left text-xs transition flex items-center justify-between border hover:scale-[1.01]"
                  style={{
                    backgroundColor: currentCert?._id === c._id ? colors.badgeBg : colors.bgSecondary,
                    borderColor: currentCert?._id === c._id ? colors.primary : colors.border
                  }}
                >
                  <div className="truncate min-w-0">
                    <div className="font-semibold text-[11px] truncate" style={{ color: colors.textPrimary }}>{c.studentName}</div>
                    <div className="text-[9.5px] font-mono" style={{ color: colors.textMuted }}>{c.certificateNo}</div>
                  </div>
                  <span
                    className="text-[9.5px] font-bold px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                      color: colors.primary
                    }}
                  >
                    {c.beltLevel || c.beltRank}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High-Resolution Landscape Certificate Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {currentCert ? (
            <div
              className="p-2 sm:p-4 rounded-xl border shadow-sm overflow-x-auto w-full"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border
              }}
            >
              <div
                id="printable-federation-certificate"
                className="certificate-print-page bg-[#fcfbfa] text-slate-900 rounded-lg shadow-2xl relative overflow-hidden border-8 border-[#1e3a8a] aspect-[1.414/1] w-full min-w-[580px] lg:min-w-0 p-4 sm:p-8 flex flex-col justify-between select-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at center, #ffffff 60%, #eff6ff 100%)',
                }}
              >
                {/* Watermark */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath fill='%231e3a8a' d='M100 20 C120 40 140 30 160 50 C140 70 120 90 100 110 C80 90 60 70 40 50 C60 30 80 40 100 20 Z'/%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' font-family='serif' font-size='32' font-weight='bold' fill='%231e3a8a'%3ETAEKWONDO%3C/text%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '50%'
                  }}
                />

                {/* Left Blue Graphic Border Strip */}
                <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-b from-[#1e3a8a] via-[#1d4ed8] to-[#1e3a8a] flex flex-col items-center justify-around py-4 text-white/50 text-[10px] select-none">
                  <span>🥋</span>
                  <span>⚡</span>
                  <span>🥋</span>
                  <span>⚡</span>
                  <span>🥋</span>
                </div>

                <div className="absolute inset-1.5 border-2 border-[#b45309]/60 pointer-events-none" />

                {/* Header */}
                <div className="relative pl-4 sm:pl-6 text-center space-y-1">
                  <div className="flex items-center justify-between px-4 pb-2 border-b-2 border-[#1e3a8a]">
                    <div className="flex items-center gap-2 text-left">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black text-xs sm:text-base border-2 border-[#b45309] shadow-md">
                        KPK
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-[10px] sm:text-xs font-black uppercase text-[#1e3a8a] leading-none">
                          KPK TAEKWONDO
                        </div>
                        <div className="text-[9px] text-slate-600 font-semibold">
                          ASSOCIATION
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs font-black tracking-widest text-[#b45309] uppercase">
                        KHYBER PAKHTUNKHWA TAEKWONDO ASSOCIATION
                      </div>
                      <h1 className="text-base sm:text-2xl font-black tracking-wider text-[#1e3a8a] uppercase font-cert-serif mt-0.5">
                        PAKISTAN TAEKWONDO FEDERATION
                      </h1>
                      <div className="text-[9px] sm:text-xs text-slate-700 font-semibold italic">
                        Affiliated with World Taekwondo (WT) & Asian Taekwondo Union (ATU)
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div className="hidden sm:block">
                        <div className="text-[10px] sm:text-xs font-black uppercase text-[#1e3a8a] leading-none">
                          PAKISTAN
                        </div>
                        <div className="text-[9px] text-slate-600 font-semibold">
                          FEDERATION
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#15803d] text-white flex items-center justify-center font-black text-xs sm:text-base border-2 border-[#b45309] shadow-md">
                        PTF
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="inline-block px-6 py-1 rounded bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#1e3a8a] text-white font-cert-serif font-black tracking-widest text-xs sm:text-sm uppercase shadow-md border-b-2 border-[#b45309]">
                      {currentCert.beltLevel || currentCert.beltRank} CERTIFICATE
                    </div>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="relative pl-4 sm:pl-6 my-2 text-center space-y-3">
                  <div className="text-xs sm:text-sm text-slate-700 font-serif italic">
                    This is to officially certify that
                  </div>

                  <div className="text-xl sm:text-3xl font-black text-[#1e3a8a] font-cert-serif tracking-wider uppercase border-b-2 border-slate-400 inline-block px-8 pb-1">
                    {currentCert.studentName}
                  </div>

                  <div className="text-xs sm:text-sm text-slate-800 font-serif">
                    Son / Daughter of <span className="font-bold font-sans text-slate-900">{currentCert.fatherName}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto pt-2 text-[10px] sm:text-xs">
                    <div className="p-1.5 bg-blue-50/80 border border-blue-200 rounded text-center">
                      <span className="text-slate-500 uppercase block text-[9px]">Certificate Serial No</span>
                      <span className="font-mono font-black text-[#1e3a8a]">{currentCert.certificateNo}</span>
                    </div>

                    <div className="p-1.5 bg-blue-50/80 border border-blue-200 rounded text-center">
                      <span className="text-slate-500 uppercase block text-[9px]">Nationality</span>
                      <span className="font-bold text-slate-900">{currentCert.nationality}</span>
                    </div>

                    <div className="p-1.5 bg-blue-50/80 border border-blue-200 rounded text-center">
                      <span className="text-slate-500 uppercase block text-[9px]">Training Unit</span>
                      <span className="font-bold text-slate-900 truncate block">{currentCert.unit}</span>
                    </div>

                    <div className="p-1.5 bg-blue-50/80 border border-blue-200 rounded text-center">
                      <span className="text-slate-500 uppercase block text-[9px]">Date of Issue</span>
                      <span className="font-mono font-bold text-slate-900">
                        {new Date(currentCert.issueDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>

                  <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-800 leading-relaxed font-serif italic pt-1">
                    "{currentCert.citationText}"
                  </p>
                </div>

                {/* Signatories */}
                <div className="relative pl-4 sm:pl-6 pt-4 border-t-2 border-slate-300">
                  <div className="flex justify-between items-end px-4 sm:px-10 text-[10px] sm:text-xs">
                    <div className="text-center w-48 sm:w-60">
                      <div className="font-serif italic font-bold text-slate-800 border-b-2 border-slate-900 pb-1 text-xs sm:text-sm">
                        {currentCert.secretarySignatory?.name || 'Waqas Ahmad'}
                      </div>
                      <div className="font-bold text-[#1e3a8a] mt-1">
                        Secretary General
                      </div>
                      <div className="text-[9px] text-slate-600">
                        KPK Taekwondo Association
                      </div>
                    </div>

                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#b45309] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex flex-col items-center justify-center shadow-lg text-amber-950 font-black text-[8px] sm:text-[9px] uppercase tracking-tighter text-center leading-none">
                      <span>OFFICIAL</span>
                      <span className="text-xs sm:text-sm font-serif">★</span>
                      <span>SEAL</span>
                    </div>

                    <div className="text-center w-56 sm:w-72">
                      <div className="font-serif font-black text-blue-950 border-b-2 border-slate-900 pb-1 text-xs sm:text-base tracking-wide">
                        {currentCert.presidentSignatory?.name || 'Murtaza Hassan Bangash'}
                      </div>
                      <div className="font-bold text-[#1e3a8a] mt-1 text-[10px] sm:text-xs">
                        President KPK Taekwondo Association
                      </div>
                      <div className="text-[9px] text-slate-700 font-semibold">
                        6th Dan Black Belt WTF • 7th Dan Black Belt PTF
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="p-12 text-center rounded-2xl border text-xs"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              Select or issue a certificate to view the official federation replica.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
