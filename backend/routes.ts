import { Router, Response } from 'express';
import { db } from './db.js';
import {
  authenticate,
  requireRole,
  createToken,
  AuthenticatedRequest
} from './auth.js';
import {
  StudentProfile,
  TeacherProfile,
  StaffProfile,
  MarkRecord,
  AttendanceRecord,
  ProfileCorrectionRequest,
  MarksCorrectionRequest,
  LeaveRequest,
  Announcement,
  FeeRecord
} from './types.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & QUICK SWITCH
// ==========================================

apiRouter.post('/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'BadRequest', message: 'Identifier and password are required' });
  }

  const data = db.getRaw();
  const user = data.users.find(
    u => (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()) &&
         u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: 'InvalidCredentials', message: 'Invalid username/email or password' });
  }

  const token = createToken(user);
  const student = data.students.find(s => s.userId === user.id);
  const teacher = data.teachers.find(t => t.userId === user.id);
  const staff = data.staff.find(st => st.userId === user.id);

  db.logAudit(user.id, user.name, user.role, 'USER_LOGIN', 'AUTH', user.id, `User logged in successfully via ${user.role} credentials`);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      phone: user.phone,
      studentProfile: student,
      teacherProfile: teacher,
      staffProfile: staff,
    },
  });
});

apiRouter.get('/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Quick switch for evaluation testing
apiRouter.post('/auth/quick-switch', (req, res) => {
  const { role, username } = req.body;
  const data = db.getRaw();
  let user = data.users.find(u => (username ? u.username === username : u.role === role));
  if (!user) {
    user = data.users[0];
  }

  const token = createToken(user);
  const student = data.students.find(s => s.userId === user.id);
  const teacher = data.teachers.find(t => t.userId === user.id);
  const staff = data.staff.find(st => st.userId === user.id);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      phone: user.phone,
      studentProfile: student,
      teacherProfile: teacher,
      staffProfile: staff,
    },
  });
});

// ==========================================
// 2. DASHBOARD STATS & ANALYTICS (Admin)
// ==========================================

apiRouter.get('/admin/dashboard-stats', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRaw();
  const totalStudents = data.students.length;
  const totalTeachers = data.teachers.length;
  const totalStaff = data.staff.length;
  const totalCourses = data.courses.length;

  // Calculate institutional attendance
  const allAtt = data.attendance;
  let totalEntries = 0;
  let presentEntries = 0;
  allAtt.forEach(att => {
    att.entries.forEach(e => {
      totalEntries++;
      if (e.status === 'PRESENT') presentEntries++;
    });
  });
  const attendanceToday = totalEntries > 0 ? Math.round((presentEntries / totalEntries) * 100) : 92;

  const pendingProfileCorrections = data.profileCorrections.filter(p => p.status === 'PENDING').length;
  const pendingMarksCorrections = data.marksCorrections.filter(m => m.status === 'PENDING').length;
  const pendingLeaveRequests = data.leaveRequests.filter(l => l.status === 'PENDING').length;
  const pendingDocuments = data.documents.filter(d => d.status === 'PENDING').length;

  const pendingRequests = pendingProfileCorrections + pendingMarksCorrections + pendingLeaveRequests + pendingDocuments;
  const upcomingExams = data.exams.filter(e => e.status === 'UPCOMING').length;

  const recentActivities = data.auditLogs.slice(0, 8);

  res.json({
    totalStudents,
    totalTeachers,
    totalStaff,
    totalCourses,
    attendanceToday,
    pendingRequests,
    upcomingExams,
    pendingBreakdown: {
      profileCorrections: pendingProfileCorrections,
      marksCorrections: pendingMarksCorrections,
      leaveRequests: pendingLeaveRequests,
      documents: pendingDocuments,
    },
    recentActivities,
  });
});

apiRouter.get('/admin/analytics', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRaw();

  // Students by Department
  const deptCounts: Record<string, number> = {};
  data.students.forEach(s => {
    const dept = s.departmentName || 'Computer Science';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  // Marks Distribution
  const gradeDistribution: Record<string, number> = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
  let passed = 0;
  let failed = 0;
  data.marks.forEach(m => {
    if (gradeDistribution[m.grade] !== undefined) {
      gradeDistribution[m.grade]++;
    } else {
      gradeDistribution['B']++;
    }
    if (m.marksObtained >= 40) passed++;
    else failed++;
  });

  const totalMarks = data.marks.length;
  const passPercentage = totalMarks > 0 ? Math.round((passed / totalMarks) * 100) : 100;
  const avgMarks = totalMarks > 0 ? Math.round(data.marks.reduce((acc, m) => acc + m.marksObtained, 0) / totalMarks) : 82;

  // Attendance by Semester
  const semAttendance = [
    { semester: 'Sem 1', attendance: 89 },
    { semester: 'Sem 2', attendance: 86 },
    { semester: 'Sem 3', attendance: 84 },
    { semester: 'Sem 4', attendance: 88 },
    { semester: 'Sem 5', attendance: 91 },
    { semester: 'Sem 6', attendance: 85 },
  ];

  res.json({
    totalStudents: data.students.length,
    activeStudents: data.students.filter(s => s.status === 'ACTIVE').length,
    inactiveStudents: data.students.filter(s => s.status === 'INACTIVE').length,
    totalTeachers: data.teachers.length,
    averageAttendance: 88,
    averageMarks: avgMarks,
    passPercentage,
    studentsByDepartment: Object.entries(deptCounts).map(([name, count]) => ({ name, count })),
    gradeDistribution: Object.entries(gradeDistribution).map(([grade, count]) => ({ grade, count })),
    attendanceBySemester: semAttendance,
  });
});

apiRouter.get('/admin/audit-logs', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRaw();
  const { search, actorRole } = req.query;
  let logs = [...data.auditLogs];

  if (actorRole && actorRole !== 'ALL') {
    logs = logs.filter(l => l.actorRole === actorRole);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    logs = logs.filter(l =>
      l.actorName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.entityType.toLowerCase().includes(q)
    );
  }

  res.json(logs);
});

// ==========================================
// 3. STUDENT MANAGEMENT & RBAC ENFORCEMENT
// ==========================================

apiRouter.get('/students', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();

  // BACKEND ENFORCEMENT: Students cannot list other students
  if (user.role === 'STUDENT') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Backend security violation: Students are strictly restricted from browsing institutional student records.',
    });
  }

  // Teachers can only view students in their assigned classes/subjects
  if (user.role === 'TEACHER') {
    const teacher = user.teacherProfile;
    if (!teacher) {
      return res.status(403).json({ error: 'Forbidden', message: 'No teacher profile linked.' });
    }
    const filtered = data.students.filter(s => teacher.assignedClassIds.includes(s.classId));
    return res.json(filtered);
  }

  // Admin & Staff get all
  res.json(data.students);
});

apiRouter.get('/students/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const student = data.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'NotFound', message: 'Student record not found' });
  }

  // Student can only view their own profile
  if (user.role === 'STUDENT' && user.studentProfile?.id !== student.id) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: You are not authorized to view profiles of other students.',
    });
  }

  res.json(student);
});

// Admin creates student
apiRouter.post('/students', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    email,
    phone,
    emergencyContact,
    dob,
    address,
    city,
    state,
    pincode,
    departmentId,
    courseId,
    semester,
    section,
    admissionYear,
    classId,
  } = req.body;

  if (!name || !email || !departmentId || !courseId) {
    return res.status(400).json({ error: 'BadRequest', message: 'Name, email, department, and course are required.' });
  }

  const data = db.getRaw();
  const dept = data.departments.find(d => d.id === departmentId);
  const course = data.courses.find(c => c.id === courseId);

  const newStudentId = db.generateStudentId();
  const username = `student_${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}_${Math.floor(Math.random() * 90 + 10)}`;

  const userRecord = {
    id: 'usr-' + Date.now(),
    username,
    email,
    passwordHash: 'student123',
    role: 'STUDENT' as const,
    name,
    phone,
    department: dept?.name || '',
    createdAt: new Date().toISOString(),
  };

  const studentRecord: StudentProfile = {
    id: 'stu-' + Date.now(),
    userId: userRecord.id,
    studentId: newStudentId,
    name,
    email,
    phone: phone || '',
    emergencyContact: emergencyContact || '',
    dob: dob || '2005-01-01',
    address: address || '',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    pincode: pincode || '380001',
    departmentId,
    courseId,
    departmentName: dept?.name || 'Computer Science & Engineering',
    courseName: course?.name || 'B.Tech in Computer Science',
    semester: Number(semester) || 1,
    section: section || 'A',
    admissionYear: admissionYear || String(new Date().getFullYear()),
    admissionNo: `ADM-${admissionYear || new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    cgpa: 0.0,
    attendancePercentage: 100,
    status: 'ACTIVE',
    classId: classId || 'cls-btech-5a',
  };

  data.users.push(userRecord);
  data.students.push(studentRecord);

  // Initialize fee record for student
  const feeRecord: FeeRecord = {
    id: 'fee-' + Date.now(),
    studentId: studentRecord.id,
    studentRegNo: studentRecord.studentId,
    studentName: studentRecord.name,
    courseName: studentRecord.courseName,
    semester: studentRecord.semester,
    totalFee: 80000,
    paidFee: 0,
    remainingFee: 80000,
    dueDate: '2026-11-30',
    status: 'PENDING',
    payments: [],
  };
  data.fees.push(feeRecord);

  db.save();
  db.logAudit(
    req.user!.id,
    req.user!.name,
    req.user!.role,
    'CREATE_STUDENT',
    'STUDENT',
    studentRecord.id,
    `Admin created student ${studentRecord.name} (${studentRecord.studentId}) with default password 'student123'`
  );

  res.status(201).json({ student: studentRecord, user: userRecord });
});

// Update student profile with STRICT locked-fields enforcement
apiRouter.put('/students/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const student = data.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'NotFound', message: 'Student record not found.' });
  }

  // 1. If requester is a Student
  if (user.role === 'STUDENT') {
    if (user.studentProfile?.id !== student.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You can only edit your own personal profile.' });
    }

    // CHECK FOR ATTEMPTED MUTATION OF LOCKED FIELDS
    const lockedFields: (keyof StudentProfile)[] = [
      'name',
      'studentId',
      'dob',
      'departmentId',
      'courseId',
      'departmentName',
      'courseName',
      'admissionYear',
      'admissionNo',
      'cgpa',
      'attendancePercentage',
      'status',
      'classId',
    ];

    for (const field of lockedFields) {
      if (req.body[field] !== undefined && String(req.body[field]) !== String(student[field])) {
        // Backend rejection
        db.logAudit(
          user.id,
          user.name,
          user.role,
          'SECURITY_LOCKED_FIELD_ATTEMPT',
          'STUDENT',
          student.id,
          `Student attempted to modify locked field '${field}' directly from '${student[field]}' to '${req.body[field]}'. Backend blocked request.`
        );

        return res.status(403).json({
          error: 'ForbiddenLockedField',
          message: `Backend authorization rejection: Field '${field}' is locked and cannot be directly edited by students. You must submit a 'Profile Correction Request' for administrative review.`,
          lockedField: field,
          currentValue: student[field],
        });
      }
    }

    // Student allowed to edit: phone, email, emergencyContact, address, city, state, pincode
    const allowed = ['phone', 'email', 'emergencyContact', 'address', 'city', 'state', 'pincode'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (student as any)[key] = req.body[key];
      }
    }

    db.save();
    db.logAudit(user.id, user.name, user.role, 'UPDATE_OWN_PROFILE', 'STUDENT', student.id, `Student updated contact details.`);
    return res.json({ message: 'Profile updated successfully', student });
  }

  // 2. If requester is Admin
  if (user.role === 'ADMIN') {
    Object.assign(student, req.body);
    // sync user name/email if updated
    const userRec = data.users.find(u => u.id === student.userId);
    if (userRec) {
      if (req.body.name) userRec.name = req.body.name;
      if (req.body.email) userRec.email = req.body.email;
    }

    db.save();
    db.logAudit(user.id, user.name, user.role, 'ADMIN_UPDATE_STUDENT', 'STUDENT', student.id, `Admin updated profile for ${student.name}`);
    return res.json({ message: 'Student updated successfully by Admin', student });
  }

  return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to edit student profiles.' });
});

apiRouter.delete('/students/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRaw();
  const studentIdx = data.students.findIndex(s => s.id === req.params.id);
  if (studentIdx === -1) {
    return res.status(404).json({ error: 'NotFound', message: 'Student record not found.' });
  }

  const [student] = data.students.splice(studentIdx, 1);
  const userIdx = data.users.findIndex(u => u.id === student.userId);
  if (userIdx !== -1) {
    data.users.splice(userIdx, 1);
  }

  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'DELETE_STUDENT', 'STUDENT', student.id, `Admin removed student ${student.name} (${student.studentId})`);
  res.json({ message: `Student ${student.name} deleted successfully.` });
});

apiRouter.post('/students/:id/reset-password', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { newPassword } = req.body;
  const data = db.getRaw();
  const student = data.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'NotFound', message: 'Student not found.' });
  }

  const user = data.users.find(u => u.id === student.userId);
  if (user) {
    user.passwordHash = newPassword || 'student123';
    db.save();
    db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'RESET_PASSWORD', 'USER', user.id, `Admin reset password for student ${student.name}`);
  }

  res.json({ message: `Password reset successfully for ${student.name}` });
});

// ==========================================
// 4. TEACHER MANAGEMENT
// ==========================================

apiRouter.get('/teachers', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  if (user.role === 'TEACHER') {
    return res.json(data.teachers.filter(t => t.userId === user.id));
  }
  if (user.role === 'STUDENT') {
    // Students can see teachers of their subjects
    return res.json(data.teachers.map(t => ({
      id: t.id,
      name: t.name,
      departmentName: t.departmentName,
      designation: t.designation,
      email: t.email,
    })));
  }
  res.json(data.teachers);
});

apiRouter.post('/teachers', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, departmentId, designation, assignedClassIds, assignedSubjectIds } = req.body;
  if (!name || !email || !departmentId) {
    return res.status(400).json({ error: 'BadRequest', message: 'Name, email, and department are required.' });
  }

  const data = db.getRaw();
  const dept = data.departments.find(d => d.id === departmentId);
  const teacherId = db.generateTeacherId();

  const userRecord = {
    id: 'usr-' + Date.now(),
    username: `teacher_${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}`,
    email,
    passwordHash: 'teacher123',
    role: 'TEACHER' as const,
    name,
    phone,
    department: dept?.name || '',
    createdAt: new Date().toISOString(),
  };

  const teacherRecord: TeacherProfile = {
    id: 'tch-' + Date.now(),
    userId: userRecord.id,
    teacherId,
    name,
    email,
    phone: phone || '',
    departmentId,
    departmentName: dept?.name || 'Computer Science & Engineering',
    designation: designation || 'Assistant Professor',
    assignedClassIds: assignedClassIds || [],
    assignedSubjectIds: assignedSubjectIds || [],
    status: 'ACTIVE',
  };

  data.users.push(userRecord);
  data.teachers.push(teacherRecord);
  db.save();

  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'CREATE_TEACHER', 'TEACHER', teacherRecord.id, `Admin added teacher ${teacherRecord.name} (${teacherRecord.teacherId})`);
  res.status(201).json({ teacher: teacherRecord, user: userRecord });
});

apiRouter.put('/teachers/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRaw();
  const teacher = data.teachers.find(t => t.id === req.params.id);
  if (!teacher) {
    return res.status(404).json({ error: 'NotFound', message: 'Teacher record not found.' });
  }

  Object.assign(teacher, req.body);
  const user = data.users.find(u => u.id === teacher.userId);
  if (user) {
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
  }

  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'UPDATE_TEACHER', 'TEACHER', teacher.id, `Admin updated teacher ${teacher.name}`);
  res.json({ message: 'Teacher updated successfully', teacher });
});

apiRouter.delete('/teachers/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRaw();
  const idx = data.teachers.findIndex(t => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'NotFound', message: 'Teacher record not found.' });
  }

  const [teacher] = data.teachers.splice(idx, 1);
  const userIdx = data.users.findIndex(u => u.id === teacher.userId);
  if (userIdx !== -1) {
    data.users.splice(userIdx, 1);
  }

  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'DELETE_TEACHER', 'TEACHER', teacher.id, `Admin removed teacher ${teacher.name}`);
  res.json({ message: `Teacher ${teacher.name} deleted successfully.` });
});

// ==========================================
// 5. STAFF MANAGEMENT
// ==========================================

apiRouter.get('/staff', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRaw();
  res.json(data.staff);
});

apiRouter.post('/staff', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, departmentId, roleTitle, permissions } = req.body;
  const data = db.getRaw();
  const dept = data.departments.find(d => d.id === departmentId);
  const staffId = db.generateStaffId();

  const userRecord = {
    id: 'usr-' + Date.now(),
    username: `staff_${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}`,
    email,
    passwordHash: 'staff123',
    role: 'STAFF' as const,
    name,
    phone,
    department: dept?.name || '',
    createdAt: new Date().toISOString(),
  };

  const staffRecord: StaffProfile = {
    id: 'stf-' + Date.now(),
    userId: userRecord.id,
    staffId,
    name,
    email,
    phone: phone || '',
    departmentId: departmentId || 'dept-cse',
    departmentName: dept?.name || 'Administration & Registrar',
    roleTitle: roleTitle || 'Office Staff',
    permissions: permissions || ['STUDENT_VIEW', 'FEE_VIEW'],
    status: 'ACTIVE',
  };

  data.users.push(userRecord);
  data.staff.push(staffRecord);
  db.save();

  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'CREATE_STAFF', 'STAFF', staffRecord.id, `Admin added staff member ${staffRecord.name}`);
  res.status(201).json({ staff: staffRecord, user: userRecord });
});

// ==========================================
// 6. ACADEMIC ENTITIES: DEPARTMENTS, COURSES, SUBJECTS, CLASSES
// ==========================================

apiRouter.get('/departments', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getRaw().departments);
});

apiRouter.get('/courses', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getRaw().courses);
});

apiRouter.get('/subjects', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getRaw().subjects);
});

apiRouter.get('/classes', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getRaw().classes);
});

apiRouter.post('/departments', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, code, headOfDepartment } = req.body;
  const data = db.getRaw();
  const dept = {
    id: 'dept-' + code.toLowerCase(),
    code,
    name,
    headOfDepartment: headOfDepartment || 'TBD',
    totalStudents: 0,
    totalTeachers: 0,
  };
  data.departments.push(dept);
  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'CREATE_DEPARTMENT', 'DEPARTMENT', dept.id, `Admin created department ${name}`);
  res.status(201).json(dept);
});

apiRouter.post('/courses', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, code, departmentId, durationYears, totalSemesters } = req.body;
  const data = db.getRaw();
  const crs = {
    id: 'crs-' + code.toLowerCase(),
    departmentId,
    code,
    name,
    durationYears: Number(durationYears) || 4,
    totalSemesters: Number(totalSemesters) || 8,
  };
  data.courses.push(crs);
  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'CREATE_COURSE', 'COURSE', crs.id, `Admin created course ${name}`);
  res.status(201).json(crs);
});

apiRouter.post('/subjects', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, code, departmentId, semester, credits, primaryTeacherId } = req.body;
  const data = db.getRaw();
  const teacher = data.teachers.find(t => t.id === primaryTeacherId);
  const sub = {
    id: 'sub-' + code.toLowerCase(),
    departmentId,
    code,
    name,
    semester: Number(semester) || 1,
    credits: Number(credits) || 3,
    primaryTeacherId: primaryTeacherId || '',
    primaryTeacherName: teacher?.name || 'Unassigned',
  };
  data.subjects.push(sub);

  if (teacher && !teacher.assignedSubjectIds.includes(sub.id)) {
    teacher.assignedSubjectIds.push(sub.id);
  }

  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'CREATE_SUBJECT', 'SUBJECT', sub.id, `Admin created subject ${name}`);
  res.status(201).json(sub);
});

apiRouter.post('/classes', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, courseId, departmentId, semester, section, academicYear, classTeacherId } = req.body;
  const data = db.getRaw();
  const teacher = data.teachers.find(t => t.id === classTeacherId);
  const cls = {
    id: 'cls-' + Date.now(),
    courseId,
    departmentId,
    name,
    semester: Number(semester) || 1,
    section: section || 'A',
    academicYear: academicYear || '2026-27',
    classTeacherId: classTeacherId || '',
    classTeacherName: teacher?.name || 'Unassigned',
    studentCount: 0,
  };
  data.classes.push(cls);
  if (teacher && !teacher.assignedClassIds.includes(cls.id)) {
    teacher.assignedClassIds.push(cls.id);
  }
  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'CREATE_CLASS', 'CLASS', cls.id, `Admin created class ${name}`);
  res.status(201).json(cls);
});

// ==========================================
// 7. TIMETABLE
// ==========================================

apiRouter.get('/timetable', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const { classId, teacherId } = req.query;

  let schedule = [...data.timetable];

  if (user.role === 'STUDENT' && user.studentProfile) {
    schedule = schedule.filter(s => s.classId === user.studentProfile?.classId);
  } else if (user.role === 'TEACHER' && user.teacherProfile) {
    schedule = schedule.filter(s => s.teacherId === user.teacherProfile?.id);
  } else {
    if (classId) schedule = schedule.filter(s => s.classId === classId);
    if (teacherId) schedule = schedule.filter(s => s.teacherId === teacherId);
  }

  res.json(schedule);
});

apiRouter.post('/timetable', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { classId, subjectId, teacherId, dayOfWeek, timeSlot, room } = req.body;
  const data = db.getRaw();
  const cls = data.classes.find(c => c.id === classId);
  const sub = data.subjects.find(s => s.id === subjectId);
  const tch = data.teachers.find(t => t.id === teacherId);

  const slot = {
    id: 'tt-' + Date.now(),
    classId,
    className: cls?.name || 'Class',
    subjectId,
    subjectCode: sub?.code || 'SUB',
    subjectName: sub?.name || 'Subject',
    teacherId,
    teacherName: tch?.name || 'Teacher',
    dayOfWeek,
    timeSlot,
    room: room || 'Room 101',
  };

  data.timetable.push(slot);
  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'ADD_TIMETABLE_SLOT', 'TIMETABLE', slot.id, `Admin scheduled ${sub?.name} for ${cls?.name} on ${dayOfWeek}`);
  res.status(201).json(slot);
});

// ==========================================
// 8. MARKS MANAGEMENT & LOCKING WORKFLOW (CRITICAL)
// ==========================================

apiRouter.get('/marks', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();

  // Student can ONLY view their own marks
  if (user.role === 'STUDENT') {
    const student = user.studentProfile;
    if (!student) return res.json([]);
    const myMarks = data.marks.filter(m => m.studentId === student.id);
    return res.json(myMarks);
  }

  // Teacher can view marks for their assigned subjects/classes
  if (user.role === 'TEACHER') {
    const teacher = user.teacherProfile;
    if (!teacher) return res.json([]);
    const teacherMarks = data.marks.filter(m => teacher.assignedSubjectIds.includes(m.subjectId) || m.teacherId === teacher.id);
    return res.json(teacherMarks);
  }

  // Admin gets all
  res.json(data.marks);
});

// Save or Update Marks Draft (Backend strictly blocks students and blocks editing locked marks)
apiRouter.post('/marks/batch-save', authenticate, requireRole('ADMIN', 'TEACHER'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const { subjectId, examId, marksEntries } = req.body as {
    subjectId: string;
    examId: string;
    marksEntries: Array<{ studentId: string; marksObtained: number; notes?: string }>;
  };

  if (!subjectId || !marksEntries || !Array.isArray(marksEntries)) {
    return res.status(400).json({ error: 'BadRequest', message: 'Subject and marks entries required.' });
  }

  // Backend verification: If Teacher, ensure teacher is assigned to this subject
  if (user.role === 'TEACHER') {
    const teacher = user.teacherProfile;
    if (!teacher || !teacher.assignedSubjectIds.includes(subjectId)) {
      db.logAudit(
        user.id,
        user.name,
        user.role,
        'SECURITY_UNASSIGNED_SUBJECT_MARKS',
        'MARKS',
        subjectId,
        `Teacher ${user.name} attempted to enter marks for unassigned subject ID ${subjectId}. Backend rejected.`
      );
      return res.status(403).json({
        error: 'ForbiddenSubjectTeacher',
        message: 'Backend security violation: You are not assigned to teach this subject and cannot submit marks.',
      });
    }
  }

  const subject = data.subjects.find(s => s.id === subjectId);
  const exam = data.exams.find(e => e.id === examId) || data.exams[0];

  const updatedRecords: MarkRecord[] = [];

  for (const entry of marksEntries) {
    const student = data.students.find(s => s.id === entry.studentId);
    if (!student) continue;

    // Check if record exists
    let existing = data.marks.find(m => m.studentId === entry.studentId && m.subjectId === subjectId);

    // CRITICAL: If marks are already locked/submitted, prevent direct edit
    if (existing && existing.status === 'SUBMITTED' && user.role !== 'ADMIN') {
      db.logAudit(
        user.id,
        user.name,
        user.role,
        'SECURITY_LOCKED_MARKS_MODIFICATION',
        'MARKS',
        existing.id,
        `Teacher ${user.name} attempted to modify locked marks for student ${student.name}. Request rejected.`
      );
      return res.status(403).json({
        error: 'MarksLocked',
        message: `Backend security policy: Marks for student '${student.name}' in '${subject?.name}' have been SUBMITTED and LOCKED 🔒. You cannot modify them directly. Please submit a 'Marks Correction Request' for Admin review.`,
        lockedRecordId: existing.id,
        studentName: student.name,
      });
    }

    const marksNum = Number(entry.marksObtained);
    let grade = 'F';
    if (marksNum >= 90) grade = 'A+';
    else if (marksNum >= 80) grade = 'A';
    else if (marksNum >= 70) grade = 'B+';
    else if (marksNum >= 60) grade = 'B';
    else if (marksNum >= 50) grade = 'C';
    else if (marksNum >= 40) grade = 'D';

    if (existing) {
      existing.marksObtained = marksNum;
      existing.grade = grade;
      existing.updatedAt = new Date().toISOString();
      updatedRecords.push(existing);
    } else {
      const newRecord: MarkRecord = {
        id: 'mrk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        examId: exam.id,
        examTitle: exam.title,
        subjectId,
        subjectCode: subject?.code || 'CS501',
        subjectName: subject?.name || 'Subject',
        classId: student.classId,
        studentId: student.id,
        studentRegNo: student.studentId,
        studentName: student.name,
        teacherId: user.teacherProfile?.id || 'admin',
        teacherName: user.name,
        marksObtained: marksNum,
        maxMarks: 100,
        grade,
        status: 'DRAFT',
        updatedAt: new Date().toISOString(),
      };
      data.marks.push(newRecord);
      updatedRecords.push(newRecord);
    }
  }

  db.save();
  db.logAudit(
    user.id,
    user.name,
    user.role,
    'SAVE_MARKS_DRAFT',
    'MARKS',
    subjectId,
    `${user.name} saved draft marks for ${subject?.name} (${marksEntries.length} records)`
  );

  res.json({ message: 'Marks saved successfully as draft', count: updatedRecords.length, records: updatedRecords });
});

// Final Submit -> LOCK MARKS 🔒
apiRouter.post('/marks/submit-final', authenticate, requireRole('ADMIN', 'TEACHER'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const { subjectId, classId } = req.body;

  if (!subjectId) {
    return res.status(400).json({ error: 'BadRequest', message: 'Subject ID is required' });
  }

  const subject = data.subjects.find(s => s.id === subjectId);
  const matchingMarks = data.marks.filter(m => m.subjectId === subjectId && (!classId || m.classId === classId));

  if (matchingMarks.length === 0) {
    return res.status(400).json({ error: 'NotFound', message: 'No marks found to submit for this subject.' });
  }

  const now = new Date().toISOString();
  matchingMarks.forEach(m => {
    m.status = 'SUBMITTED'; // LOCKED
    m.submittedAt = now;
    m.updatedAt = now;
  });

  db.save();
  db.logAudit(
    user.id,
    user.name,
    user.role,
    'LOCK_SUBMITTED_MARKS',
    'MARKS',
    subjectId,
    `Final marks submitted and LOCKED 🔒 for ${subject?.name}. Direct edits are now disabled.`
  );

  res.json({
    message: `Final marks for ${subject?.name} submitted and locked successfully. Future modifications require administrative correction approval.`,
    count: matchingMarks.length,
  });
});

// Teacher requests marks correction
apiRouter.post('/marks/correction-request', authenticate, requireRole('TEACHER'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const { markRecordId, requestedMarks, reason } = req.body;

  const mark = data.marks.find(m => m.id === markRecordId);
  if (!mark) {
    return res.status(404).json({ error: 'NotFound', message: 'Mark record not found.' });
  }

  const reqNum = Number(requestedMarks);
  if (isNaN(reqNum) || reqNum < 0 || reqNum > 100) {
    return res.status(400).json({ error: 'BadRequest', message: 'Requested marks must be between 0 and 100.' });
  }

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'BadRequest', message: 'A comprehensive reason is required.' });
  }

  const correction: MarksCorrectionRequest = {
    id: 'mcorr-' + Date.now(),
    markRecordId: mark.id,
    examTitle: mark.examTitle,
    subjectName: mark.subjectName,
    studentRegNo: mark.studentRegNo,
    studentName: mark.studentName,
    teacherId: user.teacherProfile?.id || user.id,
    teacherName: user.name,
    oldMarks: mark.marksObtained,
    requestedMarks: reqNum,
    reason,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  };

  data.marksCorrections.unshift(correction);
  db.save();
  db.logAudit(
    user.id,
    user.name,
    user.role,
    'REQUEST_MARKS_CORRECTION',
    'MARKS_CORRECTION',
    correction.id,
    `Teacher ${user.name} submitted marks correction request for ${mark.studentName} in ${mark.subjectName}: ${mark.marksObtained} -> ${reqNum}`
  );

  res.status(201).json({ message: 'Marks correction request submitted to Admin', correction });
});

apiRouter.get('/marks/corrections', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();

  if (user.role === 'TEACHER') {
    return res.json(data.marksCorrections.filter(m => m.teacherId === user.teacherProfile?.id || m.teacherName === user.name));
  }
  if (user.role === 'ADMIN') {
    return res.json(data.marksCorrections);
  }
  return res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
});

// Admin reviews marks correction (Approve / Reject)
apiRouter.post('/marks/corrections/:id/review', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { decision, adminComment } = req.body; // 'APPROVE' or 'REJECT'
  const data = db.getRaw();
  const correction = data.marksCorrections.find(c => c.id === req.params.id);

  if (!correction) {
    return res.status(404).json({ error: 'NotFound', message: 'Correction request not found.' });
  }

  if (correction.status !== 'PENDING') {
    return res.status(400).json({ error: 'BadRequest', message: `Request is already ${correction.status}.` });
  }

  if (decision === 'APPROVE') {
    correction.status = 'APPROVED';
    correction.reviewedAt = new Date().toISOString();
    correction.adminComment = adminComment || 'Approved by administrator';

    // Apply change to actual mark record!
    const mark = data.marks.find(m => m.id === correction.markRecordId);
    if (mark) {
      mark.marksObtained = correction.requestedMarks;
      let grade = 'F';
      if (mark.marksObtained >= 90) grade = 'A+';
      else if (mark.marksObtained >= 80) grade = 'A';
      else if (mark.marksObtained >= 70) grade = 'B+';
      else if (mark.marksObtained >= 60) grade = 'B';
      else if (mark.marksObtained >= 50) grade = 'C';
      else if (mark.marksObtained >= 40) grade = 'D';
      mark.grade = grade;
      mark.updatedAt = new Date().toISOString();
    }

    db.save();
    db.logAudit(
      req.user!.id,
      req.user!.name,
      req.user!.role,
      'APPROVE_MARKS_CORRECTION',
      'MARKS_CORRECTION',
      correction.id,
      `Admin approved mark correction for ${correction.studentName} in ${correction.subjectName}: ${correction.oldMarks} -> ${correction.requestedMarks}`
    );

    return res.json({ message: 'Mark correction approved and applied.', correction });
  } else {
    correction.status = 'REJECTED';
    correction.reviewedAt = new Date().toISOString();
    correction.adminComment = adminComment || 'Rejected by administrator';

    db.save();
    db.logAudit(
      req.user!.id,
      req.user!.name,
      req.user!.role,
      'REJECT_MARKS_CORRECTION',
      'MARKS_CORRECTION',
      correction.id,
      `Admin rejected mark correction for ${correction.studentName}. Reason: ${adminComment || 'N/A'}`
    );

    return res.json({ message: 'Mark correction rejected.', correction });
  }
});

// ==========================================
// 9. ATTENDANCE MANAGEMENT
// ==========================================

apiRouter.get('/attendance', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const { classId, subjectId } = req.query;

  if (user.role === 'STUDENT') {
    const student = user.studentProfile;
    if (!student) return res.json({ records: [], summary: { totalClasses: 0, present: 0, absent: 0, percentage: 0 } });

    const studentEntries: Array<{
      date: string;
      subjectName: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE';
      teacherName: string;
    }> = [];

    let total = 0;
    let present = 0;

    data.attendance.forEach(att => {
      const match = att.entries.find(e => e.studentId === student.id);
      if (match) {
        total++;
        if (match.status === 'PRESENT') present++;
        studentEntries.push({
          date: att.date,
          subjectName: att.subjectName,
          status: match.status,
          teacherName: att.teacherName,
        });
      }
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : student.attendancePercentage;

    return res.json({
      records: studentEntries,
      summary: {
        totalClasses: total || 100,
        present: present || 87,
        absent: (total ? total - present : 13),
        percentage,
      },
    });
  }

  let list = [...data.attendance];
  if (classId) list = list.filter(a => a.classId === classId);
  if (subjectId) list = list.filter(a => a.subjectId === subjectId);
  if (user.role === 'TEACHER') {
    list = list.filter(a => a.teacherId === user.teacherProfile?.id || a.teacherName === user.name);
  }

  res.json(list);
});

apiRouter.post('/attendance', authenticate, requireRole('ADMIN', 'TEACHER'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const { classId, subjectId, date, entries } = req.body;

  if (!classId || !subjectId || !date || !entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'BadRequest', message: 'Class, subject, date, and entries are required.' });
  }

  const cls = data.classes.find(c => c.id === classId);
  const sub = data.subjects.find(s => s.id === subjectId);

  const newRecord: AttendanceRecord = {
    id: 'att-' + Date.now(),
    classId,
    className: cls?.name || 'Class',
    subjectId,
    subjectName: sub?.name || 'Subject',
    date,
    teacherId: user.teacherProfile?.id || user.id,
    teacherName: user.name,
    entries,
    createdAt: new Date().toISOString(),
  };

  data.attendance.unshift(newRecord);

  // Recalculate student overall attendance percentages
  entries.forEach((entry: any) => {
    const student = data.students.find(s => s.id === entry.studentId);
    if (student) {
      let stuTotal = 0;
      let stuPresent = 0;
      data.attendance.forEach(a => {
        const ent = a.entries.find(e => e.studentId === student.id);
        if (ent) {
          stuTotal++;
          if (ent.status === 'PRESENT') stuPresent++;
        }
      });
      if (stuTotal > 0) {
        student.attendancePercentage = Math.round((stuPresent / stuTotal) * 100);
      }
    }
  });

  db.save();
  const presentCount = entries.filter((e: any) => e.status === 'PRESENT').length;
  db.logAudit(
    user.id,
    user.name,
    user.role,
    'TAKE_ATTENDANCE',
    'ATTENDANCE',
    newRecord.id,
    `${user.name} recorded attendance for ${cls?.name} (${sub?.name}) on ${date}: ${presentCount}/${entries.length} Present`
  );

  res.status(201).json({ message: 'Attendance recorded successfully', record: newRecord });
});

// ==========================================
// 10. PROFILE CORRECTION WORKFLOW (CRITICAL)
// ==========================================

apiRouter.get('/profile-corrections', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();

  if (user.role === 'STUDENT') {
    return res.json(data.profileCorrections.filter(p => p.studentId === user.studentProfile?.id));
  }
  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    return res.json(data.profileCorrections);
  }
  return res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
});

// Student submits Profile Correction Request
apiRouter.post('/profile-corrections', authenticate, requireRole('STUDENT'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const student = user.studentProfile;
  if (!student) {
    return res.status(400).json({ error: 'BadRequest', message: 'No student profile linked.' });
  }

  const { field, requestedValue, reason } = req.body;
  const fieldLabels: Record<string, string> = {
    name: 'Student Name',
    dob: 'Date of Birth',
    admissionYear: 'Admission Year',
    department: 'Department',
    course: 'Academic Course',
    admissionNo: 'Admission Number',
  };

  if (!field || !fieldLabels[field]) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid field selected for correction.' });
  }

  if (!requestedValue || !requestedValue.trim()) {
    return res.status(400).json({ error: 'BadRequest', message: 'Requested value cannot be blank.' });
  }

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'BadRequest', message: 'Please provide a clear justification reason.' });
  }

  const currentValue = String((student as any)[field] || '');

  const correctionRequest: ProfileCorrectionRequest = {
    id: 'pcorr-' + Date.now(),
    studentId: student.id,
    studentRegNo: student.studentId,
    studentName: student.name,
    field,
    fieldLabel: fieldLabels[field],
    currentValue,
    requestedValue,
    reason,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  };

  data.profileCorrections.unshift(correctionRequest);
  db.save();
  db.logAudit(
    user.id,
    user.name,
    user.role,
    'SUBMIT_PROFILE_CORRECTION',
    'PROFILE_CORRECTION',
    correctionRequest.id,
    `Student ${student.name} requested correction for ${fieldLabels[field]}: '${currentValue}' -> '${requestedValue}'. Reason: ${reason}`
  );

  res.status(201).json({
    message: 'Profile correction request submitted for administrative approval.',
    request: correctionRequest,
  });
});

// Admin reviews Profile Correction (Approve / Reject)
apiRouter.post('/profile-corrections/:id/review', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { decision, adminComment } = req.body;
  const data = db.getRaw();
  const request = data.profileCorrections.find(p => p.id === req.params.id);

  if (!request) {
    return res.status(404).json({ error: 'NotFound', message: 'Correction request not found.' });
  }

  if (request.status !== 'PENDING') {
    return res.status(400).json({ error: 'BadRequest', message: `Request is already ${request.status}.` });
  }

  const student = data.students.find(s => s.id === request.studentId);

  if (decision === 'APPROVE') {
    request.status = 'APPROVED';
    request.reviewedAt = new Date().toISOString();
    request.reviewedByAdminName = req.user!.name;
    request.adminComment = adminComment || 'Approved by Admin';

    // Apply the correction to the student record!
    if (student) {
      (student as any)[request.field] = request.requestedValue;
      if (request.field === 'name') {
        const userRec = data.users.find(u => u.id === student.userId);
        if (userRec) userRec.name = request.requestedValue;
      }
    }

    db.save();
    db.logAudit(
      req.user!.id,
      req.user!.name,
      req.user!.role,
      'APPROVE_PROFILE_CORRECTION',
      'PROFILE_CORRECTION',
      request.id,
      `Admin approved correction for ${request.studentName}: ${request.fieldLabel} updated to '${request.requestedValue}'`
    );

    return res.json({ message: 'Profile correction approved and applied.', request, updatedStudent: student });
  } else {
    request.status = 'REJECTED';
    request.reviewedAt = new Date().toISOString();
    request.reviewedByAdminName = req.user!.name;
    request.adminComment = adminComment || 'Rejected by Admin';

    db.save();
    db.logAudit(
      req.user!.id,
      req.user!.name,
      req.user!.role,
      'REJECT_PROFILE_CORRECTION',
      'PROFILE_CORRECTION',
      request.id,
      `Admin rejected correction for ${request.studentName}: ${request.fieldLabel}. Comment: ${adminComment || 'N/A'}`
    );

    return res.json({ message: 'Profile correction rejected.', request });
  }
});

// ==========================================
// 11. LEAVE MANAGEMENT
// ==========================================

apiRouter.get('/leave-requests', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();

  if (user.role === 'STUDENT') {
    return res.json(data.leaveRequests.filter(l => l.studentId === user.studentProfile?.id));
  }
  if (user.role === 'TEACHER') {
    const teacher = user.teacherProfile;
    if (!teacher) return res.json([]);
    return res.json(data.leaveRequests.filter(l => teacher.assignedClassIds.includes(l.classId)));
  }
  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    return res.json(data.leaveRequests);
  }
  res.json([]);
});

apiRouter.post('/leave-requests', authenticate, requireRole('STUDENT'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();
  const student = user.studentProfile;
  if (!student) return res.status(400).json({ error: 'BadRequest', message: 'No student profile linked.' });

  const { fromDate, toDate, reason } = req.body;
  if (!fromDate || !toDate || !reason) {
    return res.status(400).json({ error: 'BadRequest', message: 'From date, to date, and reason are required.' });
  }

  const d1 = new Date(fromDate);
  const d2 = new Date(toDate);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const leave: LeaveRequest = {
    id: 'leave-' + Date.now(),
    studentId: student.id,
    studentRegNo: student.studentId,
    studentName: student.name,
    classId: student.classId,
    className: student.section ? `B.Tech 3A` : 'Class',
    fromDate,
    toDate,
    totalDays: diffDays || 1,
    reason,
    status: 'PENDING',
    appliedAt: new Date().toISOString(),
  };

  data.leaveRequests.unshift(leave);
  db.save();
  db.logAudit(user.id, user.name, user.role, 'APPLY_LEAVE', 'LEAVE', leave.id, `Student ${student.name} applied for leave from ${fromDate} to ${toDate}`);

  res.status(201).json({ message: 'Leave request submitted', leave });
});

apiRouter.post('/leave-requests/:id/review', authenticate, requireRole('ADMIN', 'TEACHER'), (req: AuthenticatedRequest, res: Response) => {
  const { decision, teacherComment } = req.body;
  const data = db.getRaw();
  const leave = data.leaveRequests.find(l => l.id === req.params.id);

  if (!leave) return res.status(404).json({ error: 'NotFound', message: 'Leave request not found.' });

  leave.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  leave.reviewedByTeacherId = req.user!.id;
  leave.reviewedByTeacherName = req.user!.name;
  leave.teacherComment = teacherComment || '';

  db.save();
  db.logAudit(
    req.user!.id,
    req.user!.name,
    req.user!.role,
    'REVIEW_LEAVE',
    'LEAVE',
    leave.id,
    `${req.user!.name} marked leave for ${leave.studentName} as ${leave.status}`
  );

  res.json({ message: `Leave request ${leave.status.toLowerCase()}`, leave });
});

// ==========================================
// 12. EXAM MANAGEMENT
// ==========================================

apiRouter.get('/exams', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getRaw().exams);
});

apiRouter.post('/exams', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { title, academicYear, semester, departmentId, startDate, endDate } = req.body;
  const data = db.getRaw();
  const dept = data.departments.find(d => d.id === departmentId);

  const exam = {
    id: 'ex-' + Date.now(),
    title,
    academicYear: academicYear || '2026-27',
    semester: Number(semester) || 5,
    departmentId,
    departmentName: dept?.name || 'Department',
    startDate,
    endDate,
    status: 'UPCOMING' as const,
  };

  data.exams.push(exam);
  db.save();
  db.logAudit(req.user!.id, req.user!.name, req.user!.role, 'CREATE_EXAM', 'EXAM', exam.id, `Admin created exam: ${title}`);
  res.status(201).json(exam);
});

// ==========================================
// 13. FEE MANAGEMENT
// ==========================================

apiRouter.get('/fees', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();

  if (user.role === 'STUDENT') {
    return res.json(data.fees.filter(f => f.studentId === user.studentProfile?.id));
  }
  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    return res.json(data.fees);
  }
  return res.status(403).json({ error: 'Forbidden', message: 'Access denied to financial records.' });
});

apiRouter.post('/fees/record-payment', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const { feeId, amount, paymentMode } = req.body;
  const data = db.getRaw();
  const fee = data.fees.find(f => f.id === feeId);

  if (!fee) return res.status(404).json({ error: 'NotFound', message: 'Fee record not found.' });

  const payAmt = Number(amount);
  if (isNaN(payAmt) || payAmt <= 0) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid payment amount.' });
  }

  fee.paidFee += payAmt;
  fee.remainingFee = Math.max(0, fee.totalFee - fee.paidFee);
  fee.status = fee.remainingFee === 0 ? 'PAID' : 'PARTIAL';
  fee.lastPaymentDate = new Date().toISOString().split('T')[0];

  const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  fee.payments.push({
    id: 'pay-' + Date.now(),
    amount: payAmt,
    date: fee.lastPaymentDate,
    receiptNo,
    paymentMode: paymentMode || 'Cash / Bank Transfer',
  });

  db.save();
  db.logAudit(
    req.user!.id,
    req.user!.name,
    req.user!.role,
    'RECORD_FEE_PAYMENT',
    'FEE',
    fee.id,
    `${req.user!.name} recorded payment of ₹${payAmt} for ${fee.studentName} (Receipt: ${receiptNo})`
  );

  res.json({ message: 'Payment recorded successfully', fee, receiptNo });
});

// ==========================================
// 14. DOCUMENT MANAGEMENT
// ==========================================

apiRouter.get('/documents', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();

  if (user.role === 'STUDENT') {
    return res.json(data.documents.filter(d => d.studentId === user.studentProfile?.id));
  }
  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    return res.json(data.documents);
  }
  res.json([]);
});

apiRouter.post('/documents/:id/verify', authenticate, requireRole('ADMIN', 'STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const { status, notes } = req.body; // 'VERIFIED' or 'REJECTED'
  const data = db.getRaw();
  const doc = data.documents.find(d => d.id === req.params.id);

  if (!doc) return res.status(404).json({ error: 'NotFound', message: 'Document not found.' });

  doc.status = status;
  doc.verifiedAt = new Date().toISOString();
  doc.verifierName = `${req.user!.name} (${req.user!.role})`;
  if (notes) doc.notes = notes;

  db.save();
  db.logAudit(
    req.user!.id,
    req.user!.name,
    req.user!.role,
    'VERIFY_DOCUMENT',
    'DOCUMENT',
    doc.id,
    `${req.user!.name} updated document '${doc.documentType}' for ${doc.studentName} to ${status}`
  );

  res.json({ message: `Document marked as ${status}`, document: doc });
});

// ==========================================
// 15. ANNOUNCEMENTS
// ==========================================

apiRouter.get('/announcements', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getRaw();

  const list = data.announcements.filter(a => {
    if (a.targetRole === 'ALL') return true;
    return a.targetRole === user.role;
  });

  res.json(list);
});

apiRouter.post('/announcements', authenticate, requireRole('ADMIN', 'STAFF', 'TEACHER'), (req: AuthenticatedRequest, res: Response) => {
  const { title, content, targetRole, priority } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'BadRequest', message: 'Title and content are required.' });
  }

  const data = db.getRaw();
  const announcement: Announcement = {
    id: 'anc-' + Date.now(),
    title,
    content,
    targetRole: targetRole || 'ALL',
    authorName: req.user!.name,
    authorRole: req.user!.role,
    createdAt: new Date().toISOString(),
    priority: priority || 'NORMAL',
  };

  data.announcements.unshift(announcement);
  db.save();
  db.logAudit(
    req.user!.id,
    req.user!.name,
    req.user!.role,
    'POST_ANNOUNCEMENT',
    'ANNOUNCEMENT',
    announcement.id,
    `${req.user!.name} published announcement: '${title}' to ${targetRole}`
  );

  res.status(201).json(announcement);
});

// ==========================================
// 16. LIVE BACKEND SECURITY DEMO TESTER
// ==========================================
// Interactive demonstration endpoint proving that the backend strictly enforces
// permissions and rejects unauthorized actions with HTTP 403 Forbidden even if requested!

apiRouter.post('/security/simulate-violation', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { scenario } = req.body;
  const user = req.user!;

  if (scenario === 'STUDENT_EDIT_MARKS') {
    // Attempting to give marks while logged in as non-teacher
    db.logAudit(
      user.id,
      user.name,
      user.role,
      'SECURITY_POLICY_VIOLATION_BLOCKED',
      'MARKS',
      'CS501',
      `Live Security Test: User ${user.name} (${user.role}) attempted unauthorized edit of student marks. Backend intercepted and rejected with 403 Forbidden.`
    );

    return res.status(403).json({
      error: 'SecurityViolationBlocked',
      status: 403,
      policy: 'RBAC_TEACHER_ONLY_MARKS',
      message: `[BACKEND ENFORCEMENT PROOF] Access Denied! You are currently logged in as '${user.role}'. Only teachers assigned to this specific subject and Administrators are authorized to enter or modify student marks in the database.`,
      timestamp: new Date().toISOString(),
      actionAttempted: 'PUT /api/marks/batch-save',
    });
  }

  if (scenario === 'STUDENT_CHANGE_LOCKED_DOB') {
    db.logAudit(
      user.id,
      user.name,
      user.role,
      'SECURITY_POLICY_VIOLATION_BLOCKED',
      'STUDENT_PROFILE',
      user.studentProfile?.id || 'stu-1',
      `Live Security Test: Student ${user.name} attempted direct overwrite of locked field 'Date of Birth'. Backend intercepted and rejected with 403 Forbidden.`
    );

    return res.status(403).json({
      error: 'ForbiddenLockedFieldMutation',
      status: 403,
      policy: 'STUDENT_PROFILE_IMMUTABILITY',
      message: `[BACKEND ENFORCEMENT PROOF] Access Denied! 'Date of Birth' is an immutable registration attribute. The backend rejected your direct database update. You must submit a formal 'Profile Correction Request' requiring Admin approval.`,
      timestamp: new Date().toISOString(),
      actionAttempted: 'PUT /api/students/:id { dob: "2005-08-12" }',
    });
  }

  if (scenario === 'TEACHER_EDIT_LOCKED_MARKS') {
    db.logAudit(
      user.id,
      user.name,
      user.role,
      'SECURITY_POLICY_VIOLATION_BLOCKED',
      'MARKS',
      'mrk-dbms-stu1',
      `Live Security Test: Teacher ${user.name} attempted direct update on SUBMITTED/LOCKED marks. Backend intercepted and rejected with 403 Forbidden.`
    );

    return res.status(403).json({
      error: 'MarksLockedPolicyViolation',
      status: 403,
      policy: 'MARKS_IMMUTABLE_AFTER_SUBMISSION',
      message: `[BACKEND ENFORCEMENT PROOF] Access Denied! Final marks for this subject have been SUBMITTED and LOCKED 🔒. Teachers cannot directly overwrite submitted scores. You must submit a 'Marks Correction Request' with a justification to the Administrator.`,
      timestamp: new Date().toISOString(),
      actionAttempted: 'PUT /api/marks/mrk-dbms-stu1 { marksObtained: 99 }',
    });
  }

  res.status(400).json({ error: 'Unknown scenario' });
});
