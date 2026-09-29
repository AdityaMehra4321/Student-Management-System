import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileCheck2,
  DollarSign,
  FileText,
  Bell,
  Activity,
  Award,
  Clock,
  Send,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingApprovalsCount = 0,
}) => {
  const { role, user } = useAuth();

  // Navigation configurations based on role
  const adminNav = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'teachers', label: 'Teacher Directory', icon: Briefcase },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'academics', label: 'Courses & Subjects', icon: BookOpen },
    { id: 'approvals', label: 'Correction Requests', icon: FileCheck2, badge: pendingApprovalsCount },
    { id: 'exams_timetable', label: 'Exams & Timetable', icon: Calendar },
    { id: 'fees_documents', label: 'Fees & Documents', icon: DollarSign },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'audit_logs', label: 'System Audit Log', icon: Activity },
    { id: 'security_inspector', label: 'RBAC Enforcement', icon: ShieldAlert },
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'My Students & Classes', icon: Users },
    { id: 'marks', label: 'Marks Entry & Lock 🔒', icon: Award },
    { id: 'attendance', label: 'Take Attendance', icon: ClipboardCheck },
    { id: 'leaves', label: 'Student Leave Requests', icon: Clock },
    { id: 'timetable', label: 'My Class Schedule', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const studentNav = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile & Edits 🔒', icon: User },
    { id: 'marks', label: 'Results & Report Card', icon: Award },
    { id: 'attendance', label: 'My Attendance Logs', icon: ClipboardCheck },
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    { id: 'leaves', label: 'Apply for Leave', icon: Send },
    { id: 'fees', label: 'Fee Payments', icon: DollarSign },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'announcements', label: 'Notices', icon: Bell },
  ];

  const staffNav = [
    { id: 'dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Records', icon: Users },
    { id: 'fees_documents', label: 'Fees & Documents', icon: DollarSign },
    { id: 'approvals', label: 'Document Verifications', icon: FileCheck2 },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  let navItems = adminNav;
  if (role === 'TEACHER') navItems = teacherNav;
  if (role === 'STUDENT') navItems = studentNav;
  if (role === 'STAFF') navItems = staffNav;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* User Card mini */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {user?.name.charAt(0) || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {user?.name}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {role === 'STUDENT'
                ? user?.studentProfile?.studentId || 'STU'
                : role === 'TEACHER'
                ? user?.teacherProfile?.teacherId || 'TCH'
                : role}
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="px-2.5 pb-2 text-[10px] font-bold text-slate-400 tracking-wider">
            PORTAL NAVIGATION
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Institutional Footer note */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        <div>Academic Session 2026–27</div>
        <div className="text-[10px] text-slate-300 mt-0.5">Encrypted RBAC Security</div>
      </div>
    </aside>
  );
};
