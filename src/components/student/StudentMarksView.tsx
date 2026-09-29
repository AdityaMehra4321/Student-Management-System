import React, { useState, useEffect } from 'react';
import { Award, Lock, Download, Printer, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { MarkRecord } from '../../types.js';
import { useAuth } from '../../context/AuthContext.js';

export const StudentMarksView: React.FC = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const student = user?.studentProfile;

  useEffect(() => {
    loadMarks();
  }, []);

  const loadMarks = async () => {
    setLoading(true);
    try {
      const data = await api.getMarks();
      setMarks(data);
    } catch (err) {
      console.error('Failed to load marks:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalObtained = marks.reduce((acc, m) => acc + m.marksObtained, 0);
  const totalMax = marks.reduce((acc, m) => acc + m.maxMarks, 0);
  const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '85.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Academic Performance & Grade Transcript</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified institutional evaluation records for Semester {student?.semester || 5}.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Grade Sheet</span>
        </button>
      </div>

      {/* Transcript Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Semester GPA (SGPA)</span>
          <span className="text-3xl font-bold font-mono text-emerald-700 mt-1 block tabular-nums">8.45</span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">First Class with Distinction</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Cumulative GPA (CGPA)</span>
          <span className="text-3xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            {student?.cgpa.toFixed(2) || '8.12'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Through Semesters 1–5</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Aggregate Percentage</span>
          <span className="text-3xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            {overallPercentage}%
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
            {totalObtained} / {totalMax} Marks
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Registry Status</span>
          <span className="text-sm font-bold text-slate-900 mt-2 block flex items-center gap-1.5 text-purple-700">
            <Lock className="w-4 h-4" />
            <span>SUBMITTED 🔒 (LOCKED)</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Official Examination Record</span>
        </div>
      </div>

      {/* Subject Grades Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Semester 5 Examination Results · B.Tech Computer Science
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Academic Session 2026–27</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
              <th className="py-3 px-4">Subject Code</th>
              <th className="py-3 px-4">Subject Title</th>
              <th className="py-3 px-4">Evaluation Event</th>
              <th className="py-3 px-4 text-center">Marks Obtained</th>
              <th className="py-3 px-4 text-center">Max Marks</th>
              <th className="py-3 px-4 text-center">Letter Grade</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {marks.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-semibold text-slate-900">{item.subjectCode}</td>
                <td className="py-3 px-4 font-medium text-slate-800">{item.subjectName}</td>
                <td className="py-3 px-4 text-slate-500 text-[11px]">{item.examTitle}</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                  {item.marksObtained}
                </td>
                <td className="py-3 px-4 text-center font-mono text-slate-500 tabular-nums">
                  {item.maxMarks}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    item.grade === 'A+' || item.grade === 'A'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.grade}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
