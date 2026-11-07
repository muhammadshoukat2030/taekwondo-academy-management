import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AcademyProvider } from './context/AcademyContext.jsx';
import { LoginView } from './components/auth/LoginView.jsx';
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
import { AcademySettingsView } from './components/settings/AcademySettingsView.jsx';
import { api } from './api/api.js';

const AppContent = () => {
  const { colors } = useTheme();
  const { isAuthenticated, authLoading } = useAuth();
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
    if (!isAuthenticated) return;
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
    if (isAuthenticated) {
      fetchDefaultersCount();
    }
  }, [isAuthenticated]);

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

  // 1. Loading splash while verifying administrator session
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors"
        style={{ backgroundColor: colors.bgMain }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl animate-pulse">🥋</span>
          <span className="font-bold text-base tracking-tight" style={{ color: colors.textPrimary }}>
            AL MURTAZA SHAH TAEKWONDO
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
          <span
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}
          />
          <span>Verifying administrator authentication...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render Secure Admin Login View
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // 3. Authenticated: Render Full Protected Admin Dashboard & Management Suite
  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-row font-sans transition-colors duration-150"
      style={{
        backgroundColor: colors.bgMain,
        color: colors.textPrimary
      }}
    >
      {/* 1. Desktop Fixed Full-Height Sidebar & Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        defaulterCount={defaulterCount}
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />

      {/* 2. Main Workspace Column: Header at top, scrollable main content below */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header
          onNavigate={handleNavigate}
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebarCollapse}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
          defaulterCount={defaulterCount}
        />

        <main className="flex-1 p-3.5 lg:p-5 overflow-y-auto w-full min-w-0">
          <div className="max-w-7xl mx-auto space-y-4">
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
              <AcademySettingsView />
            )}
          </div>
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
      <AuthProvider>
        <AcademyProvider>
          <AppContent />
        </AcademyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
