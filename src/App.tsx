import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/common/Header.js';
import { Sidebar } from './components/common/Sidebar.js';
import { SecurityTesterModal } from './components/common/SecurityTesterModal.js';
import { NotificationDrawer } from './components/common/NotificationDrawer.js';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { StudentManagement } from './components/admin/StudentManagement.js';
import { TeacherManagement } from './components/admin/TeacherManagement.js';
import { StaffManagement } from './components/admin/StaffManagement.js';
import { AcademicsManagement } from './components/admin/AcademicsManagement.js';
import { ApprovalsManagement } from './components/admin/ApprovalsManagement.js';
import { ExamsTimetable } from './components/admin/ExamsTimetable.js';
import { FeeManagement } from './components/admin/FeeManagement.js';
import { AuditLogViewer } from './components/admin/AuditLogViewer.js';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard.js';
import { TeacherMarksEntry } from './components/teacher/TeacherMarksEntry.js';
import { TeacherAttendance } from './components/teacher/TeacherAttendance.js';
import { TeacherLeaveReview } from './components/teacher/TeacherLeaveReview.js';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard.js';
import { StudentProfileView } from './components/student/StudentProfileView.js';
import { StudentMarksView } from './components/student/StudentMarksView.js';
import { StudentAttendanceView } from './components/student/StudentAttendanceView.js';
import { StudentLeaveView } from './components/student/StudentLeaveView.js';
import { StudentFeesView } from './components/student/StudentFeesView.js';
import { StudentDocumentsView } from './components/student/StudentDocumentsView.js';

import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

function MainLayout() {
  const { role, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Reset tab when role changes
  useEffect(() => {
    setActiveTab('dashboard');
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-600">Initializing Role-Based System...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // 1. ADMIN PORTAL
    if (role === 'ADMIN') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setActiveTab} />;
        case 'students':
          return <StudentManagement />;
        case 'teachers':
          return <TeacherManagement />;
        case 'staff':
          return <StaffManagement />;
        case 'academics':
          return <AcademicsManagement />;
        case 'approvals':
          return <ApprovalsManagement />;
        case 'exams_timetable':
          return <ExamsTimetable />;
        case 'fees_documents':
          return <FeeManagement />;
        case 'audit_logs':
          return <AuditLogViewer />;
        case 'security_inspector':
          return (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Backend Role-Based Access Control (RBAC) Inspector</span>
              </h2>
              <p className="text-xs text-slate-600">
                The Express backend enforces permission barriers across all endpoints. To test real-time interception, click the button below.
              </p>
              <button
                onClick={() => setSecurityModalOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Launch Security Threat Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        default:
          return <AdminDashboard onNavigate={setActiveTab} />;
      }
    }

    // 2. TEACHER PORTAL
    if (role === 'TEACHER') {
      switch (activeTab) {
        case 'dashboard':
          return <TeacherDashboard onNavigate={setActiveTab} />;
        case 'students':
          return <StudentManagement />;
        case 'marks':
          return <TeacherMarksEntry />;
        case 'attendance':
          return <TeacherAttendance />;
        case 'leaves':
          return <TeacherLeaveReview />;
        case 'timetable':
          return <ExamsTimetable />;
        default:
          return <TeacherDashboard onNavigate={setActiveTab} />;
      }
    }

    // 3. STUDENT PORTAL
    if (role === 'STUDENT') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard onNavigate={setActiveTab} />;
        case 'profile':
          return <StudentProfileView />;
        case 'marks':
          return <StudentMarksView />;
        case 'attendance':
          return <StudentAttendanceView />;
        case 'timetable':
          return <ExamsTimetable />;
        case 'leaves':
          return <StudentLeaveView />;
        case 'fees':
          return <StudentFeesView />;
        case 'documents':
          return <StudentDocumentsView />;
        default:
          return <StudentDashboard onNavigate={setActiveTab} />;
      }
    }

    // 4. STAFF PORTAL
    if (role === 'STAFF') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setActiveTab} />;
        case 'students':
          return <StudentManagement />;
        case 'fees_documents':
          return <FeeManagement />;
        case 'approvals':
          return <ApprovalsManagement />;
        default:
          return <AdminDashboard onNavigate={setActiveTab} />;
      }
    }

    return <AdminDashboard onNavigate={setActiveTab} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* Top Header Contract */}
      <Header
        onOpenSecurityInspector={() => setSecurityModalOpen(true)}
        onOpenNotifications={() => setNotificationOpen(true)}
        unreadCount={3}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={tab => {
            if (tab === 'announcements') {
              setNotificationOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          pendingApprovalsCount={18}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals */}
      <SecurityTesterModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
