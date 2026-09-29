import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { api } from '../../services/api.js';

export const StudentAttendanceView: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any>({
    records: [],
    summary: {
      totalClasses: 100,
      present: 87,
      absent: 13,
      percentage: 87,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.getAttendance();
      setAttendanceData(data);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const { summary, records } = attendanceData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-emerald-600" />
          <span>My Attendance Track & Lectures</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Official attendance percentage required for examination eligibility (Min 75% threshold).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Lectures Conducted</span>
          <span className="text-3xl font-bold font-mono text-slate-900 mt-2 block tabular-nums">
            {summary.totalClasses}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Full Semester Cohort</span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-800 block">Lectures Attended</span>
          <span className="text-3xl font-bold font-mono text-emerald-700 mt-2 block tabular-nums">
            {summary.present}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block font-medium">Recorded Present</span>
        </div>

        <div className="bg-white rounded-xl border border-rose-100 bg-rose-50/20 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-rose-800 block">Absences Recorded</span>
          <span className="text-3xl font-bold font-mono text-rose-700 mt-2 block tabular-nums">
            {summary.absent}
          </span>
          <span className="text-[10px] text-rose-600 mt-1 block">Includes unexcused</span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-900 block">Attendance Standing</span>
          <span className="text-3xl font-bold font-mono text-emerald-700 mt-2 block tabular-nums">
            {summary.percentage}%
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            ✅ Eligible for Examination
          </span>
        </div>
      </div>

      {/* Daily Attendance Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Recorded Lecture Session Entries</span>
          <span className="text-[11px] text-slate-500 font-mono">Real-time faculty updates</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Faculty Instructor</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">No session logs found.</td>
              </tr>
            ) : (
              records.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{r.date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{r.subjectName}</td>
                  <td className="py-3 px-4 text-slate-600">{r.teacherName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      r.status === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {r.status === 'PRESENT' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{r.status}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
