import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Lock
} from 'lucide-react';
import { api } from '../../services/api.js';
import { StudentProfile, Department, Course, ClassSection } from '../../types.js';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    dob: '2005-05-15',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    departmentId: 'dept-cse',
    courseId: 'crs-btech-cse',
    semester: 5,
    section: 'A',
    admissionYear: '2024',
    classId: 'cls-btech-5a',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stu, depts, crs, cls] = await Promise.all([
        api.getStudents(),
        api.getDepartments(),
        api.getCourses(),
        api.getClasses(),
      ]);
      setStudents(stu);
      setDepartments(depts);
      setCourses(crs);
      setClasses(cls);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.createStudent(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        emergencyContact: '',
        dob: '2005-05-15',
        address: '',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
        departmentId: 'dept-cse',
        courseId: 'crs-btech-cse',
        semester: 5,
        section: 'A',
        admissionYear: '2024',
        classId: 'cls-btech-5a',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setActionLoading(true);
    try {
      await api.updateStudent(selectedStudent.id, selectedStudent);
      setShowEditModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate and remove student record for ${name}?`)) return;
    try {
      await api.deleteStudent(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    const newPwd = prompt(`Enter new password for ${name}:`, 'student123');
    if (!newPwd) return;
    try {
      await api.resetStudentPassword(id, newPwd);
      alert(`Password successfully updated for ${name}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || s.departmentId === deptFilter;
    const matchesSem = semFilter === 'ALL' || String(s.semester) === semFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesDept && matchesSem && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Student Information System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer student profiles, enrollment, sections, ID generation, and credentials.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, registration number (STU2026...), or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-slate-900 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={semFilter}
            onChange={e => setSemFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="3">Semester 3</option>
            <option value="5">Semester 5</option>
            <option value="7">Semester 7</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 tracking-wider">
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Course & Class</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading student directory...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No students match the criteria.</td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {student.studentId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.admissionNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{student.courseName}</div>
                      <div className="text-[11px] text-slate-500">Sem {student.semester} · Sec {student.section}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{student.email}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-semibold tabular-nums ${student.attendancePercentage >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {student.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900 tabular-nums">
                      {student.cgpa.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {student.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowProfileDrawer(true);
                          }}
                          title="View Complete Profile"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent({ ...student });
                            setShowEditModal(true);
                          }}
                          title="Edit Student"
                          className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(student.id, student.name)}
                          title="Reset Password"
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          title="Delete / Deactivate"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {filteredStudents.length} of {students.length} enrolled students</span>
          <span>Role-Based Access: Admin Level Write Access</span>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <span>Register New Student</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kavya Deshmukh"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. kavya@sms.edu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Year</label>
                  <input
                    type="text"
                    value={formData.admissionYear}
                    onChange={e => setFormData({ ...formData, admissionYear: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block font-semibold text-slate-700 mb-1">Course Program</label>
                  <select
                    value={formData.courseId}
                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Class</label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permanent Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Apartment, Area"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-purple-900 text-[11px]">
                💡 The system will automatically generate a unique <strong>Registration ID</strong> (e.g. STU2026...) and provision a student login with default password <code>student123</code>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {actionLoading ? 'Creating Record...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal (Admin Override) */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600" />
                <span>Admin Edit Student: {selectedStudent.name}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                As Administrator, you have full override authority to edit locked attributes directly.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={selectedStudent.name}
                    onChange={e => setSelectedStudent({ ...selectedStudent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={selectedStudent.dob}
                    onChange={e => setSelectedStudent({ ...selectedStudent, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedStudent.email}
                    onChange={e => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={selectedStudent.phone}
                    onChange={e => setSelectedStudent({ ...selectedStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={selectedStudent.semester}
                    onChange={e => setSelectedStudent({ ...selectedStudent, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={selectedStudent.section}
                    onChange={e => setSelectedStudent({ ...selectedStudent, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={selectedStudent.status}
                    onChange={e => setSelectedStudent({ ...selectedStudent, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Student Profile View Drawer */}
      {showProfileDrawer && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{selectedStudent.name}</h3>
                    <p className="text-xs font-mono text-purple-700">{selectedStudent.studentId}</p>
                  </div>
                </div>
                <button onClick={() => setShowProfileDrawer(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Academic Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Attendance Rate</span>
                  <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {selectedStudent.attendancePercentage}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Cumulative GPA</span>
                  <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {selectedStudent.cgpa.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Institutional Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 tracking-wider">ACADEMIC PROGRAM</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-900">{selectedStudent.departmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Degree Course:</span>
                    <span className="font-semibold text-slate-900">{selectedStudent.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Semester:</span>
                    <span className="font-semibold text-slate-900">Semester {selectedStudent.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Section:</span>
                    <span className="font-semibold text-slate-900">{selectedStudent.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admission No:</span>
                    <span className="font-mono text-slate-900">{selectedStudent.admissionNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admission Year:</span>
                    <span className="font-mono text-slate-900">{selectedStudent.admissionYear}</span>
                  </div>
                </div>
              </div>

              {/* Contact and Personal */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 tracking-wider">CONTACT & PERSONAL DETAILS</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedStudent.phone} (Emergency: {selectedStudent.emergencyContact || 'N/A'})</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date of Birth: {selectedStudent.dob}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedStudent.address}, {selectedStudent.city}, {selectedStudent.state} - {selectedStudent.pincode}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Database Record ID: {selectedStudent.id}</span>
              <button
                onClick={() => setShowProfileDrawer(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-md font-medium"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
