# 🎓 Student Management System

A full-stack, role-based **Student Management System** designed to centralize and simplify academic, administrative, and student-related activities through a single web application.

The system provides separate portals for **Administrators, Teachers, and Students**, with secure authentication and role-based access control. Each user can access only the features and information permitted for their role.

---

## 📌 Project Overview

Educational institutions manage a large amount of student and academic information, including student profiles, attendance, marks, examinations, courses, teachers, and administrative records.

The **Student Management System** provides a centralized platform to manage these operations efficiently.

The application is built with a separate **Frontend** and **Backend** architecture while maintaining both components inside a single GitHub repository.

### Main User Roles

- 👨‍💼 **Admin**
- 👨‍🏫 **Teacher**
- 👨‍🎓 **Student**

Each role has a dedicated dashboard and different permissions.

---

# ✨ Key Features

## 👨‍💼 Admin Portal

The Admin has the highest level of access and can manage the overall system.

### Student Management
- Add new students
- View student details
- Update student information
- Activate/deactivate student accounts
- Search and filter students
- Assign students to courses, departments, semesters, and sections

### Teacher Management
- Add teachers
- View teacher information
- Update teacher information
- Activate/deactivate teacher accounts
- Assign teachers to subjects
- Assign teachers to classes

### Staff Management
- Manage staff accounts
- Assign staff roles
- Manage staff information
- Control access according to assigned permissions

### Academic Management
- Manage departments
- Manage courses
- Manage subjects
- Manage semesters
- Manage sections
- Assign subjects to teachers

### Examination Management
- Create examinations
- Manage examination schedules
- Monitor marks
- Manage results
- View academic performance

### Attendance Management
- View student attendance
- Monitor attendance by class, course, and semester
- Generate attendance reports

### Profile Correction Management
Students cannot directly modify critical information such as:

- Student Name
- Registration Number
- Admission Number
- Date of Birth
- Other institution-controlled information

Instead, students can submit correction requests which can be reviewed and approved/rejected by the Admin.

### Reports & Analytics
- Student statistics
- Teacher statistics
- Attendance reports
- Academic performance reports
- Examination reports
- Dashboard analytics

### System Monitoring
- View system activities
- Monitor important changes
- Maintain audit logs
- Track administrative actions

---

# 👨‍🏫 Teacher Portal

Teachers can manage academic activities related to their assigned classes and subjects.

### Student Management
- View assigned students
- Search students
- Filter students by class/section
- View student academic information

### Marks Management
- Enter student marks
- Update marks before final submission
- Submit marks
- View previously submitted marks
- Request correction when required

### Attendance Management
- Mark student attendance
- Update attendance
- View attendance history
- Monitor attendance percentage

### Academic Activities
- View assigned subjects
- View assigned classes
- View class schedules
- View student academic performance

### Teacher Dashboard

The teacher dashboard provides information such as:

- Assigned classes
- Assigned subjects
- Total students
- Pending marks
- Attendance information
- Upcoming examinations
- Class schedules

---

# 👨‍🎓 Student Portal

Students have access to their personal and academic information.

### Student Profile

Students can view their complete profile.

They can edit permitted information such as:

- Phone number
- Email address
- Address
- City
- State
- Pincode
- Emergency contact
- Profile picture

### Restricted Information

Students cannot directly modify institution-controlled information such as:

- Student Name
- Registration Number
- Admission Number
- Date of Birth
- Course
- Department
- Admission Year

If any information is incorrect, the student can submit a **Profile Correction Request** to the Admin.

### Academic Information
Students can:

- View marks
- View examination results
- View attendance
- View timetable
- View subjects
- View course information
- View academic performance

### Notifications
Students can receive:

- Examination announcements
- Result announcements
- Academic notifications
- Important administrative announcements

---

# 🔐 Role-Based Access Control

The system implements role-based access control to ensure that users can access only the features authorized for their role.

| Feature | Admin | Teacher | Student |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| Manage Students | ✅ | Limited | ❌ |
| Manage Teachers | ✅ | ❌ | ❌ |
| Manage Staff | ✅ | ❌ | ❌ |
| Manage Courses | ✅ | ❌ | ❌ |
| Manage Subjects | ✅ | ❌ | ❌ |
| Enter Marks | ✅ | ✅ | ❌ |
| Edit Marks | ✅ | Assigned Students | ❌ |
| View Marks | ✅ | Assigned Students | Own |
| Manage Attendance | ✅ | ✅ | ❌ |
| View Attendance | ✅ | Assigned Students | Own |
| Manage Exams | ✅ | Assigned Subjects | ❌ |
| View Results | ✅ | Assigned Students | Own |
| Edit Own Profile | ✅ | ✅ | Limited |
| Profile Correction Request | ✅ | ❌ | ✅ |
| Manage Notifications | ✅ | Limited | ❌ |
| View Reports | ✅ | Limited | Own |
| Audit Logs | ✅ | ❌ | ❌ |

> Permissions are enforced on the backend as well as the frontend to prevent unauthorized operations.

---

# 🏗️ System Architecture

The application follows a separate frontend and backend architecture.

```text
                    STUDENT MANAGEMENT SYSTEM
                              │
                         Authentication
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
          ADMIN            TEACHER           STUDENT
          PORTAL            PORTAL            PORTAL
             │                │                │
             └────────────────┼────────────────┘
                              │
                         REST APIs
                              │
                              ▼
                       BACKEND SERVER
                              │
                              ▼
                          DATABASE
