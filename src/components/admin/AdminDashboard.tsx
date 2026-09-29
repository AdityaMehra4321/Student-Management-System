import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  UserCheck,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  FileCheck2,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { api } from '../../services/api.js';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sData, aData] = await Promise.all([
        api.getDashboardStats(),
        api.getAnalytics(),
      ]);
      setStats(sData);
      setAnalytics(aData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        Loading institutional intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 tracking-wide">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            ADMINISTRATIVE COMMAND CENTER
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Institutional Operations & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Full-stack role-based management: Student lifecycle, faculty rosters, locked marks, and approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('approvals')}
            className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 transition-colors"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review Pending Requests ({stats?.pendingRequests || 0})</span>
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Students</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {stats?.totalStudents ? '2,450' : '2,450'}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">98% Active Enrollments</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Teachers</span>
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            120
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Across 4 Departments</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Staff</span>
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            45
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Registrar & Admin</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Courses</span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            35
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Degree & Diploma</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Attendance Today</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-2 tabular-nums">
            {stats?.attendanceToday || 92}%
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">+2.4% vs last week</div>
        </div>

        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs bg-purple-50/20">
          <div className="text-[11px] font-semibold text-purple-900 flex items-center justify-between">
            <span>Pending Requests</span>
            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-700 mt-2 tabular-nums">
            18
          </div>
          <div className="text-[10px] text-purple-600 mt-1 font-medium">Corrections & leaves</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Upcoming Exams</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            6
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Mid Sem starts Oct 15</div>
        </div>
      </div>

      {/* Main Grid: Pending Approval Queues & Analytics Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Institutional Analytics and Approvals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analytics Visuals */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-sm text-slate-900">Academic Analytics & Performance</h3>
              </div>
              <span className="text-xs text-slate-400">Current Semester Distribution</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">Students by Department</div>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Computer Science & Engineering</span>
                      <span className="font-mono font-medium text-slate-900">1,240 (50.6%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '50.6%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Information Technology</span>
                      <span className="font-mono font-medium text-slate-900">620 (25.3%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '25.3%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Electronics & Communication</span>
                      <span className="font-mono font-medium text-slate-900">590 (24.1%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '24.1%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Marks Distribution */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">Marks & Grade Distribution</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <span className="text-xs font-bold text-emerald-700 block">A+ / A (80-100%)</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">68%</span>
                    <span className="text-[10px] text-slate-400">Distinction</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <span className="text-xs font-bold text-blue-700 block">B+ / B (60-79%)</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">26%</span>
                    <span className="text-[10px] text-slate-400">First Class</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <span className="text-xs font-bold text-slate-700 block">Pass Rate</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">97.8%</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Institutional High</span>
                  </div>
                </div>

                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-purple-900">Average CGPA across enrolled cohorts:</span>
                  <span className="font-bold font-mono text-purple-700 text-sm">8.14</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approval Requests preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-sm text-slate-900">Pending Administrative Workflow Approvals</h3>
              </div>
              <button
                onClick={() => onNavigate('approvals')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>View All 18</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Sample Profile Correction item */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Rahul Sharma (STU20260045)</span>
                    <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium">Profile Correction Request</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Field: <strong className="text-slate-800">Date of Birth</strong> · Current: <span className="line-through text-slate-400">12/08/2004</span> → Requested: <strong className="text-emerald-700">12/08/2005</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    "Incorrect date entered during registration. Verified against attached Aadhaar."
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('approvals')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 shrink-0"
                >
                  Review
                </button>
              </div>

              {/* Sample Marks Correction item */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Mr. Rajesh Sharma (Faculty)</span>
                    <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-medium">Submitted Marks Correction</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Subject: <strong className="text-slate-800">DBMS (CS501)</strong> · Student: <strong>Aman Gupta</strong> · Marks: <span className="line-through text-slate-400">76</span> → <strong className="text-emerald-700">82</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    "Recounting error in Question 4 schema normalization section."
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('approvals')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 shrink-0"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Live System Audit Activity Log */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-sm text-slate-900">Recent Institutional Activities</h3>
              </div>
              <button
                onClick={() => onNavigate('audit_logs')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                Full Log
              </button>
            </div>

            <div className="space-y-3.5">
              {stats?.recentActivities?.map((act: any) => (
                <div key={act.id} className="text-xs space-y-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">{act.actorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{act.details}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{act.action}</span>
                    <span>·</span>
                    <span>Role: {act.actorRole}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Administrative Quick Actions</span>
            </h4>
            <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
              <button
                onClick={() => onNavigate('students')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between"
              >
                <span>Register New Student & Generate ID</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('teachers')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between"
              >
                <span>Assign Faculty to Classes & Subjects</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('fees_documents')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between"
              >
                <span>Fee Collection & Document Verification</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('security_inspector')}
                className="w-full text-left p-2.5 rounded-lg bg-rose-950/50 border border-rose-900/50 hover:bg-rose-900/60 transition-colors flex items-center justify-between text-rose-200"
              >
                <span>Live RBAC Enforcement Tester</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
