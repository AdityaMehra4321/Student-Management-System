import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, BookOpen, MapPin, X } from 'lucide-react';
import { api } from '../../services/api.js';
import { Exam, TimetableSlot, ClassSection, Subject, TeacherProfile, Department } from '../../types.js';

export const ExamsTimetable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exams' | 'timetable'>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddExam, setShowAddExam] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);

  // Forms
  const [examForm, setExamForm] = useState({
    title: '',
    academicYear: '2026-27',
    semester: 5,
    departmentId: 'dept-cse',
    startDate: '2026-10-15',
    endDate: '2026-10-25',
  });

  const [slotForm, setSlotForm] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: 'Monday' as any,
    timeSlot: '10:00 AM - 11:00 AM',
    room: 'Lab 302',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ex, tt, cls, sub, tch, d] = await Promise.all([
        api.getExams(),
        api.getTimetable(),
        api.getClasses(),
        api.getSubjects(),
        api.getTeachers(),
        api.getDepartments(),
      ]);
      setExams(ex);
      setTimetable(tt);
      setClasses(cls);
      setSubjects(sub);
      setTeachers(tch);
      setDepartments(d);
      if (cls.length > 0) setSlotForm(prev => ({ ...prev, classId: cls[0].id }));
      if (sub.length > 0) setSlotForm(prev => ({ ...prev, subjectId: sub[0].id }));
      if (tch.length > 0) setSlotForm(prev => ({ ...prev, teacherId: tch[0].id }));
    } catch (err) {
      console.error('Failed to load exams & timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExam(examForm);
      setShowAddExam(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create exam');
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addTimetableSlot(slotForm);
      setShowAddSlot(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule class');
    }
  };

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Exams & Master Timetable Scheduling</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional exam schedules, evaluation calendars, and weekly classroom timetable matrices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${activeTab === 'exams' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Examination Schedules
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${activeTab === 'timetable' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Master Timetable Matrix
            </button>
          </div>

          {activeTab === 'exams' ? (
            <button
              onClick={() => setShowAddExam(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Exam</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddSlot(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Slot</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'exams' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{exam.title}</h3>
                  <div className="text-[11px] text-slate-500">Semester {exam.semester} · {exam.academicYear}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  exam.status === 'UPCOMING'
                    ? 'bg-blue-50 text-blue-700'
                    : exam.status === 'ONGOING'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {exam.status}
                </span>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                <div>Department: <strong className="text-slate-800">{exam.departmentName}</strong></div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Timeline: {exam.startDate} to {exam.endDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                <th className="py-2.5 px-4">Day of Week</th>
                <th className="py-2.5 px-4">Time Slot</th>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Instructor</th>
                <th className="py-2.5 px-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timetable.map(slot => (
                <tr key={slot.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{slot.dayOfWeek}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{slot.timeSlot}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{slot.className}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-purple-700">{slot.subjectName}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-1">({slot.subjectCode})</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{slot.teacherName}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{slot.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add Exam */}
      {showAddExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-3">Create Examination</h3>
            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End Semester Theory Examination"
                  value={examForm.title}
                  onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={examForm.academicYear}
                    onChange={e => setExamForm({ ...examForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={examForm.semester}
                    onChange={e => setExamForm({ ...examForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={examForm.startDate}
                    onChange={e => setExamForm({ ...examForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={examForm.endDate}
                    onChange={e => setExamForm({ ...examForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddExam(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">Publish Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Timetable Slot */}
      {showAddSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-3">Schedule Class Period</h3>
            <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={slotForm.classId}
                    onChange={e => setSlotForm({ ...slotForm, classId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={slotForm.dayOfWeek}
                    onChange={e => setSlotForm({ ...slotForm, dayOfWeek: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={slotForm.subjectId}
                  onChange={e => setSlotForm({ ...slotForm, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                <select
                  value={slotForm.teacherId}
                  onChange={e => setSlotForm({ ...slotForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={slotForm.timeSlot}
                    onChange={e => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    value={slotForm.room}
                    onChange={e => setSlotForm({ ...slotForm, room: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddSlot(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">Save Period</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
