import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Award,
  ClipboardCheck,
  DollarSign,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileCheck2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { MarkRecord, Exam, TimetableSlot } from '../../types.js';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalClasses: 100,
    present: 87,
    absent: 13,
    percentage: 87,
  });
  const [loading, setLoading] = useState(true);

  const student = user?.studentProfile;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, ex, tt, att] = await Promise.all([
        api.getMarks(),
        api.getExams(),
        api.getTimetable(),
        api.getAttendance(),
      ]);
      setMarks(m);
      setExams(ex);
      setSchedule(tt);
      if (att?.summary) {
        setAttendanceSummary(att.summary);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wide">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>STUDENT ACADEMIC PORTAL</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Welcome, {student?.name || 'Rahul Sharma'}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
            <span>Reg No: <strong className="text-slate-800">{student?.studentId || 'STU20260045'}</strong></span>
            <span>·</span>
            <span>Course: <strong className="text-slate-800 font-sans">{student?.courseName || 'B.Tech in Computer Science'}</strong></span>
            <span>·</span>
            <span>Semester: <strong className="text-slate-800">{student?.semester || 5}</strong></span>
            <span>·</span>
            <span>Section: <strong className="text-slate-800">{student?.section || 'A'}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('profile')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>View Profile & Requests</span>
          </button>
          <button
            onClick={() => onNavigate('marks')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Report Card</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Overall Attendance</span>
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-700 mt-2 tabular-nums">
            {attendanceSummary.percentage}%
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">
            {attendanceSummary.present} Present / {attendanceSummary.absent} Absent
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Current CGPA</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {student?.cgpa.toFixed(2) || '8.12'}
          </div>
          <div className="text-[10px] text-purple-700 mt-1 font-medium">Top 5% Cohort Standing</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Tuition Status</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-2 tabular-nums">
            ₹20,000 Due
          </div>
          <div className="text-[10px] text-slate-500 mt-1">₹60,000 Paid of ₹80,000</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Upcoming Exams</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-blue-700 mt-2 tabular-nums">
            3
          </div>
          <div className="text-[10px] text-blue-600 mt-1 font-medium">Starts 15th October</div>
        </div>
      </div>

      {/* Main Grid: Upcoming Exams & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm text-slate-900">Upcoming Mid Semester Examinations</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">October 2026</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-md font-mono font-bold text-xs">
                  15 OCT
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Database Management Systems (DBMS)</div>
                  <div className="text-[11px] text-slate-500">Subject Code: CS501 · 10:00 AM - 01:00 PM</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-600 font-semibold bg-white px-2 py-1 rounded border">
                Hall A
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-md font-mono font-bold text-xs">
                  18 OCT
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Data Structures & Algorithms</div>
                  <div className="text-[11px] text-slate-500">Subject Code: CS503 · 10:00 AM - 01:00 PM</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-600 font-semibold bg-white px-2 py-1 rounded border">
                Hall B
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-md font-mono font-bold text-xs">
                  22 OCT
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Java Programming & Systems</div>
                  <div className="text-[11px] text-slate-500">Subject Code: CS502 · 10:00 AM - 01:00 PM</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-600 font-semibold bg-white px-2 py-1 rounded border">
                Lab 201
              </span>
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-sm text-slate-900">Recent Assessment Results</h3>
            </div>
            <button
              onClick={() => onNavigate('marks')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Full Report Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {marks.slice(0, 4).map(mark => (
              <div key={mark.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{mark.subjectName}</div>
                  <div className="text-[11px] text-slate-500">{mark.examTitle} · Instructor: {mark.teacherName}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">{mark.marksObtained}</span>
                    <span className="text-[11px] text-slate-400">/100</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    mark.grade === 'A+' || mark.grade === 'A'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {mark.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
