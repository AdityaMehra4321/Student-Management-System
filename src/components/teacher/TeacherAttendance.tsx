import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Save, Calendar, Users } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Subject, ClassSection, StudentProfile, AttendanceRecord } from '../../types.js';

export const TeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-btech-5a');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-dbms');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-29');

  // Attendance state for current session
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cls, subs, stu, att] = await Promise.all([
        api.getClasses(),
        api.getSubjects(),
        api.getStudents(),
        api.getAttendance(),
      ]);
      setClasses(cls);
      setSubjects(subs);
      setStudents(stu);
      setAttendanceHistory(att);

      if (cls.length > 0) setSelectedClassId(cls[0].id);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Initialize all students as PRESENT by default
  useEffect(() => {
    const initial: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    classStudents.forEach(s => {
      initial[s.id] = 'PRESENT';
    });
    setAttendanceEntries(initial);
  }, [selectedClassId, students]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    classStudents.forEach(s => {
      updated[s.id] = 'PRESENT';
    });
    setAttendanceEntries(updated);
  };

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceEntries(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const entries = classStudents.map(s => ({
        studentId: s.id,
        studentRegNo: s.studentId,
        studentName: s.name,
        status: attendanceEntries[s.id] || 'PRESENT',
      }));

      await api.recordAttendance({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        date: selectedDate,
        entries,
      });

      const updatedHistory = await api.getAttendance();
      setAttendanceHistory(updatedHistory);
      alert(`Attendance recorded successfully for ${selectedDate}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = classStudents.filter(s => attendanceEntries[s.id] === 'PRESENT').length;
  const absentCount = classStudents.filter(s => attendanceEntries[s.id] === 'ABSENT').length;
  const lateCount = classStudents.filter(s => attendanceEntries[s.id] === 'LATE').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <span>Classroom Attendance Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Take roll-call attendance per subject lecture and monitor institutional threshold compliance.
          </p>
        </div>

        <button
          onClick={handleMarkAllPresent}
          className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center gap-1.5 self-start md:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark All Present</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Class Cohort</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Session Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          />
        </div>
      </div>

      {/* Session Summary Counts */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-emerald-100 bg-emerald-50/20 p-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800">Present</span>
          <span className="text-xl font-bold font-mono text-emerald-700">{presentCount}</span>
        </div>
        <div className="bg-white rounded-xl border border-rose-100 bg-rose-50/20 p-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-800">Absent</span>
          <span className="text-xl font-bold font-mono text-rose-700">{absentCount}</span>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 bg-amber-50/20 p-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800">Late Arrivals</span>
          <span className="text-xl font-bold font-mono text-amber-700">{lateCount}</span>
        </div>
      </div>

      {/* Roster Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Historical Rate</th>
              <th className="py-3 px-4 text-center">Session Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classStudents.map(student => {
              const currentStatus = attendanceEntries[student.id] || 'PRESENT';

              return (
                <tr key={student.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{student.studentId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{student.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                    {student.attendancePercentage}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 ${
                          currentStatus === 'LATE'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Late</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Recording for {selectedDate} · {classes.find(c => c.id === selectedClassId)?.name || 'Class'}
          </span>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance Record'}</span>
          </button>
        </div>
      </div>

      {/* Historical logs for this subject */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Historical Lecture Logs for this Class</span>
          <span className="text-[11px] text-slate-500">{attendanceHistory.length} previous sessions</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {attendanceHistory.map(record => {
            const pres = record.entries.filter(e => e.status === 'PRESENT').length;
            const abs = record.entries.filter(e => e.status === 'ABSENT').length;

            return (
              <div key={record.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{record.subjectName} · {record.className}</div>
                  <div className="text-slate-500 text-[11px]">Instructor: {record.teacherName}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">{pres} Present</span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="font-bold text-rose-700">{abs} Absent</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] bg-slate-100 px-2 py-1 rounded">
                    {record.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
