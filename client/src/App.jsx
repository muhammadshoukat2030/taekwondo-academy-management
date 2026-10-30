import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import { Header } from './components/common/Header.jsx';
import { Sidebar } from './components/common/Sidebar.jsx';
import { DashboardView } from './components/dashboard/DashboardView.jsx';
import { EndOfMonthAuditWidget } from './components/dashboard/EndOfMonthAuditWidget.jsx';
import { AdmissionForm } from './components/admission/AdmissionForm.jsx';
import { StudentListView } from './components/profile/StudentListView.jsx';
import { StudentProfileModal } from './components/profile/StudentProfileModal.jsx';
import { SmartAttendanceTerminal } from './components/attendance/SmartAttendanceTerminal.jsx';
import { FeeManagementView } from './components/fees/FeeManagementView.jsx';
import { CertificateGeneratorView } from './components/certificates/CertificateGeneratorView.jsx';
import { ThemeSettingsView } from './components/settings/ThemeSettingsView.jsx';
import { api } from './api/api.js';

const AppContent = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [feeDeskStudentId, setFeeDeskStudentId] = useState(undefined);
  const [printCert, setPrintCert] = useState(null);
  const [defaulterCount, setDefaulterCount] = useState(0);

  const fetchDefaultersCount = async () => {
    try {
      const res = await api.getDefaulters();
      if (res.success && res.data) {
        setDefaulterCount(res.data.length);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchDefaultersCount();
  }, []);

  const handleOpenStudentProfile = (id) => {
    setSelectedStudentId(id);
  };

  const handleCollectFeeForStudent = (id) => {
    setFeeDeskStudentId(id);
    setActiveTab('fees');
  };

  const handlePrintCertificateFromProfile = (cert) => {
    setSelectedStudentId(null);
    setPrintCert(cert);
    setActiveTab('certificates');
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-200"
      style={{
        backgroundColor: colors.bgMain,
        color: colors.textPrimary
      }}
    >
      <Header onNavigate={setActiveTab} activeTab={activeTab} />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          defaulterCount={defaulterCount}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenStudent={handleOpenStudentProfile}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <EndOfMonthAuditWidget onOpenStudent={handleOpenStudentProfile} />
            </div>
          )}

          {activeTab === 'admission' && (
            <AdmissionForm
              onSuccess={() => {
                fetchDefaultersCount();
                setActiveTab('students');
              }}
              onNavigateToBiometrics={() => {
                setActiveTab('terminal');
              }}
            />
          )}

          {activeTab === 'students' && (
            <StudentListView
              onOpenProfile={handleOpenStudentProfile}
              onNavigateAdmission={() => setActiveTab('admission')}
              onCollectFee={handleCollectFeeForStudent}
            />
          )}

          {activeTab === 'terminal' && (
            <SmartAttendanceTerminal />
          )}

          {activeTab === 'fees' && (
            <FeeManagementView
              initialStudentId={feeDeskStudentId}
              onOpenStudentProfile={handleOpenStudentProfile}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificateGeneratorView initialCertificate={printCert} />
          )}

          {activeTab === 'settings' && (
            <ThemeSettingsView />
          )}
        </main>
      </div>

      {selectedStudentId && (
        <StudentProfileModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onPrintCertificate={handlePrintCertificateFromProfile}
          onOpenReceipt={() => {
            setSelectedStudentId(null);
            setActiveTab('fees');
          }}
        />
      )}
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
