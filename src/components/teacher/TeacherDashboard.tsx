import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { TimetableSlot, Subject, ClassSection } from '../../types.js';

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tt, subs, cls] = await Promise.all([
        api.getTimetable(),
        api.getSubjects(),
        api.getClasses(),
      ]);
      setSchedule(tt);
      setSubjects(subs);
      setClasses(cls);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const teacher = user?.teacherProfile;
  const assignedSubjectCount = teacher?.assignedSubjectIds?.length || 3;
  const assignedClassCount = teacher?.assignedClassIds?.length || 4;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>FACULTY PORTAL · {teacher?.departmentName || 'Computer Science & Engineering'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Welcome back, {user?.name || 'Mr. Rajesh Sharma'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your instructional cohorts, enter coursework marks with locking protocols, and record daily attendance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Take Today's Attendance</span>
          </button>
          <button
            onClick={() => onNavigate('marks')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>Enter Marks</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Assigned Classes</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {assignedClassCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">B.Tech 3A, 3B, 2A</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Assigned Subjects</span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {assignedSubjectCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">DBMS, Java, SQL</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Students</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            180
          </div>
          <div className="text-[10px] text-slate-500 mt-1">In your sections</div>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-900 flex items-center justify-between">
            <span>Pending Marks</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-2 tabular-nums">
            2
          </div>
          <div className="text-[10px] text-amber-700 mt-1 font-medium">Internal Assessment 1</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Today's Classes</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            3
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">Next: 10:00 AM DBMS</div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Quick Marks Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Lecture Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm text-slate-900">Today's Academic Schedule</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Monday, 29 September 2026</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg font-mono font-bold text-xs">
                  10:00 AM
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Database Management Systems (DBMS)</div>
                  <div className="text-[11px] text-slate-500">Cohort: B.Tech 3A · Room: Lab 302 · Practical & Theory</div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-50"
              >
                Take Attendance
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-800 text-white rounded-lg font-mono font-bold text-xs">
                  12:00 PM
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Java & Object Oriented Systems</div>
                  <div className="text-[11px] text-slate-500">Cohort: B.Tech 3B · Room: Lab 201 · Hands-on Coding</div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Upcoming</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-800 text-white rounded-lg font-mono font-bold text-xs">
                  02:00 PM
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Relational Database SQL</div>
                  <div className="text-[11px] text-slate-500">Cohort: B.Tech 2A · Room: Hall 105 · Lecture</div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Marks Locking System Overview Card */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Lock className="w-4 h-4" />
              <span>MARKS LOCKING PROTOCOL 🔒</span>
            </div>
            <h3 className="font-bold text-base mt-2">Server-Authoritative Evaluation</h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              Faculty can draft marks iteratively. Once you click <strong>Submit Final Marks</strong>, the status shifts to <code>SUBMITTED 🔒</code> and backend mutation permissions are locked.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              To rectify submitted grades, instructors must submit a <strong>Marks Correction Request</strong> to the Administrator detailing the score delta and recount rationale.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => onNavigate('marks')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Open Marks Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('leaves')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Review Student Leaves
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
