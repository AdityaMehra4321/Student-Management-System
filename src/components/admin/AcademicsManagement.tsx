import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Layers, GraduationCap, Users, X } from 'lucide-react';
import { api } from '../../services/api.js';
import { Department, Course, Subject, ClassSection, TeacherProfile } from '../../types.js';

export const AcademicsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'courses' | 'subjects' | 'classes'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);

  // Forms
  const [deptForm, setDeptForm] = useState({ name: '', code: '', headOfDepartment: '' });
  const [courseForm, setCourseForm] = useState({ name: '', code: '', departmentId: '', durationYears: 4, totalSemesters: 8 });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', departmentId: '', semester: 5, credits: 4, primaryTeacherId: '' });
  const [classForm, setClassForm] = useState({ name: '', courseId: '', departmentId: '', semester: 5, section: 'A', academicYear: '2026-27', classTeacherId: '' });

  useEffect(() => {
    loadAcademics();
  }, []);

  const loadAcademics = async () => {
    setLoading(true);
    try {
      const [d, c, s, cls, t] = await Promise.all([
        api.getDepartments(),
        api.getCourses(),
        api.getSubjects(),
        api.getClasses(),
        api.getTeachers(),
      ]);
      setDepartments(d);
      setCourses(c);
      setSubjects(s);
      setClasses(cls);
      setTeachers(t);
      if (d.length > 0) {
        setCourseForm(prev => ({ ...prev, departmentId: d[0].id }));
        setSubjectForm(prev => ({ ...prev, departmentId: d[0].id }));
        setClassForm(prev => ({ ...prev, departmentId: d[0].id }));
      }
      if (c.length > 0) {
        setClassForm(prev => ({ ...prev, courseId: c[0].id }));
      }
      if (t.length > 0) {
        setSubjectForm(prev => ({ ...prev, primaryTeacherId: t[0].id }));
        setClassForm(prev => ({ ...prev, classTeacherId: t[0].id }));
      }
    } catch (err) {
      console.error('Failed to load academic records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDepartment(deptForm);
      setShowAddDept(false);
      setDeptForm({ name: '', code: '', headOfDepartment: '' });
      await loadAcademics();
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCourse(courseForm);
      setShowAddCourse(false);
      await loadAcademics();
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSubject(subjectForm);
      setShowAddSubject(false);
      await loadAcademics();
    } catch (err: any) {
      alert(err.message || 'Failed to create subject');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClass(classForm);
      setShowAddClass(false);
      await loadAcademics();
    } catch (err: any) {
      alert(err.message || 'Failed to create class');
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Academic Curriculum & Hierarchy</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional departments, degree programs, subjects, and cohort sections.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${activeTab === 'departments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${activeTab === 'courses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${activeTab === 'subjects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${activeTab === 'classes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Classes & Sections ({classes.length})
          </button>
        </div>
      </div>

      {/* Departments view */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddDept(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded border border-purple-100">
                    {dept.code}
                  </span>
                  <span className="text-[11px] text-slate-400">Head: {dept.headOfDepartment}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Enrolled Students</span>
                    <span className="font-mono font-bold text-slate-900">{dept.totalStudents}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Active Faculty</span>
                    <span className="font-mono font-bold text-slate-900">{dept.totalTeachers}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses view */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddCourse(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course Program</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{course.name}</h3>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">{course.code}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Duration: <strong className="text-slate-800">{course.durationYears} Years</strong> · Total Semesters: <strong className="text-slate-800">{course.totalSemesters} Semesters</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjects view */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddSubject(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Academic Subject</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
                  <th className="py-2.5 px-4">Subject Code</th>
                  <th className="py-2.5 px-4">Subject Name</th>
                  <th className="py-2.5 px-4">Semester</th>
                  <th className="py-2.5 px-4 text-center">Credits</th>
                  <th className="py-2.5 px-4">Primary Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{s.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{s.name}</td>
                    <td className="py-3 px-4 text-slate-600">Semester {s.semester}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{s.credits}</td>
                    <td className="py-3 px-4 text-slate-700">{s.primaryTeacherName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Classes view */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddClass(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Class Cohort</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map(cls => (
              <div key={cls.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{cls.name}</h3>
                  <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold">{cls.academicYear}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Semester {cls.semester} · Section {cls.section}
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  Class Teacher: <strong className="text-slate-800">{cls.classTeacherName}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Department */}
      {showAddDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="ME"
                    value={deptForm.code}
                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Head of Dept</label>
                  <input
                    type="text"
                    placeholder="Dr. Verma"
                    value={deptForm.headOfDepartment}
                    onChange={e => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddDept(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Course */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Course Program</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master of Computer Applications"
                  value={courseForm.name}
                  onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="MCA"
                    value={courseForm.code}
                    onChange={e => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={courseForm.departmentId}
                    onChange={e => setCourseForm({ ...courseForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddCourse(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Subject */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Academic Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={subjectForm.name}
                  onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CS506"
                    value={subjectForm.code}
                    onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    value={subjectForm.credits}
                    onChange={e => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Teacher</label>
                <select
                  value={subjectForm.primaryTeacherId}
                  onChange={e => setSubjectForm({ ...subjectForm, primaryTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.teacherId})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddSubject(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Class */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-3">Create Class Section</h3>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cohort Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech 3C (Sem 5)"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={classForm.semester}
                    onChange={e => setClassForm({ ...classForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={classForm.section}
                    onChange={e => setClassForm({ ...classForm, section: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Teacher</label>
                <select
                  value={classForm.classTeacherId}
                  onChange={e => setClassForm({ ...classForm, classTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.teacherId})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddClass(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
