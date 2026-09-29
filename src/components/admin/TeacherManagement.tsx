import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  BookOpen,
  Calendar,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Mail,
  Phone,
  Layers,
  Award
} from 'lucide-react';
import { api } from '../../services/api.js';
import { TeacherProfile, Department, Subject, ClassSection } from '../../types.js';

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: 'dept-cse',
    designation: 'Assistant Professor',
    assignedClassIds: [] as string[],
    assignedSubjectIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, dList, sList, cList] = await Promise.all([
        api.getTeachers(),
        api.getDepartments(),
        api.getSubjects(),
        api.getClasses(),
      ]);
      setTeachers(tList);
      setDepartments(dList);
      setSubjects(sList);
      setClasses(cList);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.createTeacher(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        departmentId: 'dept-cse',
        designation: 'Assistant Professor',
        assignedClassIds: [],
        assignedSubjectIds: [],
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create faculty');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setActionLoading(true);
    try {
      await api.updateTeacher(selectedTeacher.id, selectedTeacher);
      setShowEditModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update faculty');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove faculty record for ${name}?`)) return;
    try {
      await api.deleteTeacher(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove faculty');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            <span>Faculty & Teacher Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage instructors, course assignments, sections, permissions, and credential access.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by faculty name, staff code (TCH102), or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-slate-900 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Faculty Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeachers.map(teacher => {
          const assignedSubs = subjects.filter(s => teacher.assignedSubjectIds?.includes(s.id));
          const assignedCls = classes.filter(c => teacher.assignedClassIds?.includes(c.id));

          return (
            <div key={teacher.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base border border-blue-100">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{teacher.name}</h3>
                    <div className="text-[11px] text-slate-500">{teacher.designation} · <span className="font-mono text-blue-700 font-semibold">{teacher.teacherId}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedTeacher({ ...teacher });
                      setShowEditModal(true);
                    }}
                    title="Edit Faculty"
                    className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                    title="Remove"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Department & Contact */}
              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-800">{teacher.departmentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.phone || '+91 98765 00000'}</span>
                </div>
              </div>

              {/* Assigned Subjects & Classes */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Assigned Subjects ({assignedSubs.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedSubs.length > 0 ? (
                      assignedSubs.map(s => (
                        <span key={s.id} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                          {s.name} ({s.code})
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No subjects assigned yet</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Assigned Classes ({assignedCls.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedCls.length > 0 ? (
                      assignedCls.map(c => (
                        <span key={c.id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-100">
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No classes assigned yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Add Faculty Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Gupta"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@sms.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {actionLoading ? 'Creating...' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Edit Faculty: {selectedTeacher.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedTeacher.name}
                  onChange={e => setSelectedTeacher({ ...selectedTeacher, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedTeacher.email}
                    onChange={e => setSelectedTeacher({ ...selectedTeacher, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={selectedTeacher.designation}
                    onChange={e => setSelectedTeacher({ ...selectedTeacher, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Teaching Subjects</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                  {subjects.map(s => {
                    const checked = selectedTeacher.assignedSubjectIds?.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            const current = selectedTeacher.assignedSubjectIds || [];
                            if (e.target.checked) {
                              setSelectedTeacher({ ...selectedTeacher, assignedSubjectIds: [...current, s.id] });
                            } else {
                              setSelectedTeacher({ ...selectedTeacher, assignedSubjectIds: current.filter(id => id !== s.id) });
                            }
                          }}
                        />
                        <span className="truncate">{s.name} ({s.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Classes / Sections</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                  {classes.map(c => {
                    const checked = selectedTeacher.assignedClassIds?.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            const current = selectedTeacher.assignedClassIds || [];
                            if (e.target.checked) {
                              setSelectedTeacher({ ...selectedTeacher, assignedClassIds: [...current, c.id] });
                            } else {
                              setSelectedTeacher({ ...selectedTeacher, assignedClassIds: current.filter(id => id !== c.id) });
                            }
                          }}
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {actionLoading ? 'Saving...' : 'Save Assignments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
