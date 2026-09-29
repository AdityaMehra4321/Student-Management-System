export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'STAFF';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  department?: string;
  phone?: string;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
  staffProfile?: StaffProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  departmentId: string;
  courseId: string;
  departmentName: string;
  courseName: string;
  semester: number;
  section: string;
  admissionYear: string;
  admissionNo: string;
  cgpa: number;
  attendancePercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  classId: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  assignedClassIds: string[];
  assignedSubjectIds: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StaffProfile {
  id: string;
  userId: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  roleTitle: string;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  totalStudents: number;
  totalTeachers: number;
}

export interface Course {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  durationYears: number;
  totalSemesters: number;
}

export interface Subject {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  primaryTeacherId: string;
  primaryTeacherName: string;
}

export interface ClassSection {
  id: string;
  courseId: string;
  departmentId: string;
  name: string;
  semester: number;
  section: string;
  academicYear: string;
  classTeacherId: string;
  classTeacherName: string;
  studentCount: number;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string;
  room: string;
}

export interface Exam {
  id: string;
  title: string;
  academicYear: string;
  semester: number;
  departmentId: string;
  departmentName: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface MarkRecord {
  id: string;
  examId: string;
  examTitle: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  classId: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt?: string;
  updatedAt: string;
}

export interface MarksCorrectionRequest {
  id: string;
  markRecordId: string;
  examTitle: string;
  subjectName: string;
  studentRegNo: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  oldMarks: number;
  requestedMarks: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
  adminComment?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  date: string;
  teacherId: string;
  teacherName: string;
  entries: {
    studentId: string;
    studentRegNo: string;
    studentName: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
  }[];
  createdAt: string;
}

export interface ProfileCorrectionRequest {
  id: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  field: 'name' | 'dob' | 'admissionYear' | 'department' | 'course' | 'admissionNo';
  fieldLabel: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
  reviewedByAdminName?: string;
  adminComment?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  classId: string;
  className: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedByTeacherId?: string;
  reviewedByTeacherName?: string;
  teacherComment?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  courseName: string;
  semester: number;
  totalFee: number;
  paidFee: number;
  remainingFee: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
  lastPaymentDate?: string;
  payments: {
    id: string;
    amount: number;
    date: string;
    receiptNo: string;
    paymentMode: string;
  }[];
}

export interface DocumentRecord {
  id: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  documentType: 'Aadhaar Card' | '10th Marksheet' | '12th Marksheet' | 'Transfer Certificate' | 'Admission Document';
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  fileUrl: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifierName?: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'ALL' | 'STUDENT' | 'TEACHER' | 'STAFF';
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ip: string;
}
