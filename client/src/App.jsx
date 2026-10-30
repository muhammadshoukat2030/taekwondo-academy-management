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

  // Desktop sidebar collapse & Mobile slide-in drawer states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('tkd_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tkd_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    closeMobileMenu();
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-200"
      style={{
        backgroundColor: colors.bgMain,
        color: colors.textPrimary
      }}
    >
      <Header
        onNavigate={handleNavigate}
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebarCollapse}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          defaulterCount={defaulterCount}
          isCollapsed={sidebarCollapsed}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={closeMobileMenu}
        />

        <main className="flex-1 p-3.5 lg:p-5 overflow-y-auto max-w-7xl mx-auto w-full min-w-0">
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
