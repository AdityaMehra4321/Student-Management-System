import React, { useState } from 'react';
import {
  ShieldAlert,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types.js';

interface HeaderProps {
  onOpenSecurityInspector: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSecurityInspector,
  onOpenNotifications,
  unreadCount = 3,
}) => {
  const { user, role, quickSwitch, logout } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
    ADMIN: { label: 'Admin Portal', icon: Layers, color: 'text-purple-600 bg-purple-50', desc: 'Full institutional control & approvals' },
    TEACHER: { label: 'Teacher Portal', icon: Briefcase, color: 'text-blue-600 bg-blue-50', desc: 'Marks entry, locking & attendance' },
    STUDENT: { label: 'Student Portal', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50', desc: 'Grades, attendance, leave & corrections' },
    STAFF: { label: 'Staff Portal', icon: UserCheck, color: 'text-amber-600 bg-amber-50', desc: 'Registrar, fees & document verification' },
  };

  const currentRoleInfo = role ? roleLabels[role] : roleLabels.ADMIN;
  const RoleIcon = currentRoleInfo.icon;

  const handleSwitch = (newRole: UserRole, username?: string) => {
    quickSwitch(newRole, username);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              A
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                AcademiaOS
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Role-Based Student Management System
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${currentRoleInfo.color}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{currentRoleInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Zone 2 & 3: Controls & Account */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Pill Bar for 1-Click Evaluation */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
            >
              <span className="text-slate-400">Switch Role:</span>
              <span className="font-semibold text-slate-900">{user?.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 tracking-wider">
                  INSTANT ROLE SWITCHER
                </div>
                <button
                  onClick={() => handleSwitch('ADMIN')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-start gap-2 hover:bg-slate-50 transition-colors ${role === 'ADMIN' ? 'bg-purple-50/60 font-semibold' : ''}`}
                >
                  <Layers className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-slate-900">Admin (Dr. Rahul Verma)</div>
                    <div className="text-[11px] text-slate-500">Full institutional CRUD & approvals</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSwitch('TEACHER', 'teacher_sharma')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-start gap-2 hover:bg-slate-50 transition-colors ${role === 'TEACHER' && user?.username === 'teacher_sharma' ? 'bg-blue-50/60 font-semibold' : ''}`}
                >
                  <Briefcase className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-slate-900">Teacher (Mr. Rajesh Sharma)</div>
                    <div className="text-[11px] text-slate-500">DBMS & Java · Marks locking & attendance</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSwitch('STUDENT', 'student_rahul')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-start gap-2 hover:bg-slate-50 transition-colors ${role === 'STUDENT' ? 'bg-emerald-50/60 font-semibold' : ''}`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-slate-900">Student (Rahul Sharma)</div>
                    <div className="text-[11px] text-slate-500">B.Tech 5A · Locked fields & results</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSwitch('STAFF', 'staff_vikram')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-start gap-2 hover:bg-slate-50 transition-colors ${role === 'STAFF' ? 'bg-amber-50/60 font-semibold' : ''}`}
                >
                  <UserCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-slate-900">Staff (Vikram Joshi)</div>
                    <div className="text-[11px] text-slate-500">Academic registrar & fee tracking</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Backend Security Inspector Button */}
          <button
            onClick={onOpenSecurityInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
            title="Demonstrate real backend 403 Forbidden enforcement"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Security Inspector</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Announcements"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            )}
          </button>

          {/* User profile avatar & logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
                {user?.name.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                {user?.name}
              </div>
              <div className="text-[10px] text-slate-500">
                {user?.username}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
