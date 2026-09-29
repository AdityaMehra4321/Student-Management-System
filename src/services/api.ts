import {
  User,
  StudentProfile,
  TeacherProfile,
  StaffProfile,
  Department,
  Course,
  Subject,
  ClassSection,
  TimetableSlot,
  Exam,
  MarkRecord,
  MarksCorrectionRequest,
  AttendanceRecord,
  ProfileCorrectionRequest,
  LeaveRequest,
  FeeRecord,
  DocumentRecord,
  Announcement,
  AuditLogEntry
} from '../types.js';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('sms_auth_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('sms_auth_token', token);
    } else {
      localStorage.removeItem('sms_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(data.message || `Request failed with status ${response.status}`);
      (err as any).status = response.status;
      (err as any).data = data;
      throw err;
    }

    return data as T;
  }

  // Auth
  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async quickSwitch(role: string, username?: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/quick-switch', {
      method: 'POST',
      body: JSON.stringify({ role, username }),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Admin Stats & Analytics
  async getDashboardStats() {
    return this.request<{
      totalStudents: number;
      totalTeachers: number;
      totalStaff: number;
      totalCourses: number;
      attendanceToday: number;
      pendingRequests: number;
      upcomingExams: number;
      pendingBreakdown: {
        profileCorrections: number;
        marksCorrections: number;
        leaveRequests: number;
        documents: number;
      };
      recentActivities: AuditLogEntry[];
    }>('/api/admin/dashboard-stats');
  }

  async getAnalytics() {
    return this.request<{
      totalStudents: number;
      activeStudents: number;
      inactiveStudents: number;
      totalTeachers: number;
      averageAttendance: number;
      averageMarks: number;
      passPercentage: number;
      studentsByDepartment: { name: string; count: number }[];
      gradeDistribution: { grade: string; count: number }[];
      attendanceBySemester: { semester: string; attendance: number }[];
    }>('/api/admin/analytics');
  }

  async getAuditLogs(params?: { search?: string; actorRole?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.actorRole) query.set('actorRole', params.actorRole);
    return this.request<AuditLogEntry[]>(`/api/admin/audit-logs?${query.toString()}`);
  }

  // Students
  async getStudents(): Promise<StudentProfile[]> {
    return this.request<StudentProfile[]>('/api/students');
  }

  async getStudent(id: string): Promise<StudentProfile> {
    return this.request<StudentProfile>(`/api/students/${id}`);
  }

  async createStudent(studentData: Partial<StudentProfile>): Promise<{ student: StudentProfile; user: any }> {
    return this.request<{ student: StudentProfile; user: any }>('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: string, updates: Partial<StudentProfile>): Promise<{ message: string; student: StudentProfile }> {
    return this.request<{ message: string; student: StudentProfile }>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStudent(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/students/${id}`, {
      method: 'DELETE',
    });
  }

  async resetStudentPassword(id: string, newPassword?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/students/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  // Teachers
  async getTeachers(): Promise<TeacherProfile[]> {
    return this.request<TeacherProfile[]>('/api/teachers');
  }

  async createTeacher(data: Partial<TeacherProfile>): Promise<{ teacher: TeacherProfile; user: any }> {
    return this.request<{ teacher: TeacherProfile; user: any }>('/api/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacher(id: string, updates: Partial<TeacherProfile>): Promise<{ message: string; teacher: TeacherProfile }> {
    return this.request<{ message: string; teacher: TeacherProfile }>(`/api/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTeacher(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  // Staff
  async getStaff(): Promise<StaffProfile[]> {
    return this.request<StaffProfile[]>('/api/staff');
  }

  async createStaff(data: Partial<StaffProfile>): Promise<{ staff: StaffProfile; user: any }> {
    return this.request<{ staff: StaffProfile; user: any }>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Academic Entities
  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/api/departments');
  }

  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>('/api/courses');
  }

  async getSubjects(): Promise<Subject[]> {
    return this.request<Subject[]>('/api/subjects');
  }

  async getClasses(): Promise<ClassSection[]> {
    return this.request<ClassSection[]>('/api/classes');
  }

  async createDepartment(data: Partial<Department>): Promise<Department> {
    return this.request<Department>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    return this.request<Course>('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createSubject(data: Partial<Subject>): Promise<Subject> {
    return this.request<Subject>('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createClass(data: Partial<ClassSection>): Promise<ClassSection> {
    return this.request<ClassSection>('/api/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Timetable
  async getTimetable(params?: { classId?: string; teacherId?: string }): Promise<TimetableSlot[]> {
    const query = new URLSearchParams();
    if (params?.classId) query.set('classId', params.classId);
    if (params?.teacherId) query.set('teacherId', params.teacherId);
    return this.request<TimetableSlot[]>(`/api/timetable?${query.toString()}`);
  }

  async addTimetableSlot(slot: Partial<TimetableSlot>): Promise<TimetableSlot> {
    return this.request<TimetableSlot>('/api/timetable', {
      method: 'POST',
      body: JSON.stringify(slot),
    });
  }

  // Marks
  async getMarks(): Promise<MarkRecord[]> {
    return this.request<MarkRecord[]>('/api/marks');
  }

  async saveMarksBatch(subjectId: string, examId: string, marksEntries: Array<{ studentId: string; marksObtained: number; notes?: string }>) {
    return this.request<{ message: string; count: number; records: MarkRecord[] }>('/api/marks/batch-save', {
      method: 'POST',
      body: JSON.stringify({ subjectId, examId, marksEntries }),
    });
  }

  async submitFinalMarks(subjectId: string, classId?: string) {
    return this.request<{ message: string; count: number }>('/api/marks/submit-final', {
      method: 'POST',
      body: JSON.stringify({ subjectId, classId }),
    });
  }

  async requestMarksCorrection(markRecordId: string, requestedMarks: number, reason: string) {
    return this.request<{ message: string; correction: MarksCorrectionRequest }>('/api/marks/correction-request', {
      method: 'POST',
      body: JSON.stringify({ markRecordId, requestedMarks, reason }),
    });
  }

  async getMarksCorrections(): Promise<MarksCorrectionRequest[]> {
    return this.request<MarksCorrectionRequest[]>('/api/marks/corrections');
  }

  async reviewMarksCorrection(id: string, decision: 'APPROVE' | 'REJECT', adminComment?: string) {
    return this.request<{ message: string; correction: MarksCorrectionRequest }>(`/api/marks/corrections/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, adminComment }),
    });
  }

  // Attendance
  async getAttendance(params?: { classId?: string; subjectId?: string }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.classId) query.set('classId', params.classId);
    if (params?.subjectId) query.set('subjectId', params.subjectId);
    return this.request<any>(`/api/attendance?${query.toString()}`);
  }

  async recordAttendance(payload: {
    classId: string;
    subjectId: string;
    date: string;
    entries: Array<{ studentId: string; studentRegNo: string; studentName: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }>;
  }) {
    return this.request<{ message: string; record: AttendanceRecord }>('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Profile Corrections
  async getProfileCorrections(): Promise<ProfileCorrectionRequest[]> {
    return this.request<ProfileCorrectionRequest[]>('/api/profile-corrections');
  }

  async submitProfileCorrection(field: string, requestedValue: string, reason: string) {
    return this.request<{ message: string; request: ProfileCorrectionRequest }>('/api/profile-corrections', {
      method: 'POST',
      body: JSON.stringify({ field, requestedValue, reason }),
    });
  }

  async reviewProfileCorrection(id: string, decision: 'APPROVE' | 'REJECT', adminComment?: string) {
    return this.request<{ message: string; request: ProfileCorrectionRequest; updatedStudent?: StudentProfile }>(
      `/api/profile-corrections/${id}/review`,
      {
        method: 'POST',
        body: JSON.stringify({ decision, adminComment }),
      }
    );
  }

  // Leave Requests
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return this.request<LeaveRequest[]>('/api/leave-requests');
  }

  async applyLeave(fromDate: string, toDate: string, reason: string) {
    return this.request<{ message: string; leave: LeaveRequest }>('/api/leave-requests', {
      method: 'POST',
      body: JSON.stringify({ fromDate, toDate, reason }),
    });
  }

  async reviewLeave(id: string, decision: 'APPROVE' | 'REJECT', teacherComment?: string) {
    return this.request<{ message: string; leave: LeaveRequest }>(`/api/leave-requests/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, teacherComment }),
    });
  }

  // Exams
  async getExams(): Promise<Exam[]> {
    return this.request<Exam[]>('/api/exams');
  }

  async createExam(data: Partial<Exam>): Promise<Exam> {
    return this.request<Exam>('/api/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Fees
  async getFees(): Promise<FeeRecord[]> {
    return this.request<FeeRecord[]>('/api/fees');
  }

  async recordFeePayment(feeId: string, amount: number, paymentMode?: string) {
    return this.request<{ message: string; fee: FeeRecord; receiptNo: string }>('/api/fees/record-payment', {
      method: 'POST',
      body: JSON.stringify({ feeId, amount, paymentMode }),
    });
  }

  // Documents
  async getDocuments(): Promise<DocumentRecord[]> {
    return this.request<DocumentRecord[]>('/api/documents');
  }

  async verifyDocument(id: string, status: 'VERIFIED' | 'REJECTED', notes?: string) {
    return this.request<{ message: string; document: DocumentRecord }>(`/api/documents/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return this.request<Announcement[]>('/api/announcements');
  }

  async createAnnouncement(data: { title: string; content: string; targetRole: string; priority: string }) {
    return this.request<Announcement>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Live Backend Security Violation Simulator
  async simulateSecurityViolation(scenario: 'STUDENT_EDIT_MARKS' | 'STUDENT_CHANGE_LOCKED_DOB' | 'TEACHER_EDIT_LOCKED_MARKS') {
    return this.request<any>('/api/security/simulate-violation', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  }
}

export const api = new ApiService();
