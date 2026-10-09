# AI-Powered Learning Management & Student Performance Analytics System

A full-stack, enterprise-grade Learning Management System with integrated AI Analytics Engine, designed with React + Vite + Tailwind CSS, FastAPI backend, SQLAlchemy persistent SQLite database, and JWT role-based security.

---

## 🌟 Architecture & Features

### 1. Role-Based Security & Permissions
- **3 Strictly Isolated Roles:** Student, Faculty, Admin.
- **One Email = One Account** with exactly one role.
- Automatic routing after login to role-specific dashboards.
- Backend JWT token validation & FastAPI dependency injection (`require_role`).
- Full cross-role breach prevention (403 Forbidden for unauthorized access).

### 2. Pre-Configured Demo Accounts (1-Click Login)
- **Student:** `student@lms.edu` / `student123` (Sophia Martinez, Roll: CS-2024-042)
- **Faculty:** `faculty@lms.edu` / `faculty123` (Prof. Alan Turing, Dept: CSE)
- **Admin:** `admin@lms.edu` / `admin123` (Dr. Eleanor Vance, Dean of Academics)

---

## 🎓 Student Portal Features
- **Dashboard:** GPA, attendance percentage, enrolled courses, risk detection, recent announcements.
- **Enrolled Courses & Curriculum:** View course syllabus, modules count, credits, instructor details.
- **Course & Module Materials:** Sequential learning modules (Step 1, Step 2...), module durations, descriptions, downloadable faculty files (PDF, PPT, DOC, images), and external resource URLs.
- **Assignments:** View deadlines, max marks, status.
- **Assignment Submission & Revision:** Multipart file uploads, description notes, **replace or delete submission before deadline**.
- **Faculty-Approved Feedback:** Real-time visibility of faculty approved marks, qualitative remarks, and weak topics.
- **Subject-Wise Attendance:** Dates, Present/Late/Absent status, and percentage tracker.
- **Performance Analytics & Marks:** Chart visualizations comparing student performance against benchmarks.
- **Campus Timetable:** Daily/weekly schedule with times, rooms, and professors.
- **AI Study Plan & Weak Topics:** Adaptive 7-day schedule with targeted revision hours and identified weakness topics.
- **AI Doubt Assistant:** 24/7 academic question answering with step-by-step conceptual walkthroughs, code examples, and study advice.
- **AI Diagnostic Quizzes:** Take quizzes with real-time scoring, question-by-question explanations, and automatic weak-topic flagging.
- **Notification Center:** Live alerts for submissions, grades, and study reminders.

---

## 👨‍🏫 Faculty Portal Features
- **Faculty Dashboard:** Active courses count, total enrolled students, pending AI reviews, weak students alert.
- **Course & Module Management:**
  - Create and edit academic courses.
  - Add sequential learning modules (Title, Duration, Description).
  - Upload module files: PDF, PPT, PPTX, DOC, DOCX, images via multipart upload.
  - Link external resource URLs.
  - View, download, and delete resources.
- **Course Files Archive:** Centralized file repository with category badges and instant download.
- **Assignments:** Create assignments with deadline, max marks, and attachments; view student submissions.
- **AI Assignment Correction Suite:**
  - *Workflow:* Student submits → AI suggests marks/feedback/weak topics → Faculty reviews → **Approve / Edit / Reject** → Only approved result reaches student.
- **Attendance Management:** Select course, pick date, toggle Present / Late / Absent per student, save attendance to database.
- **Exams & Marks Entry:** Schedule Midterm, Final, Quiz, or Lab assessments; enter marks and individual remarks for students.
- **Gradebook:** Cumulative marks across all examinations with calculated percentages and letter grades (A, B, C, F).
- **AI Quiz Generator & Question Bank:** Generate 3, 5, or 10-item assessments by topic and difficulty level with pedagogical explanations, auto-saved to Question Bank.
- **Announcements:** Broadcast notices to enrolled students.
- **Faculty Analytics:** Class grade distributions, topic heatmaps, and at-risk student intervention alerts.

---

## ⚙️ Admin Portal Features
- **Admin Dashboard:** Total accounts, total students, total faculty, retention rates, department performance metrics.
- **Manage Accounts & Roles:** View all accounts, filter by role (Student, Faculty, Admin), provision new users with temporary passwords, suspend/reactivate accounts, delete users.
- **Course Catalog & Allocation:** Add courses to the catalog, allocate faculty professors to courses.
- **Academic Departments:** Create and manage divisions, departmental codes, and appointed deans.
- **Classes & Cohort Sections:** Manage academic cohorts, semester sessions, and section assignments.
- **Campus Timetable:** Add and oversee lecture hall scheduling.
- **Exams Schedule:** Centralized overview of all departmental examinations.
- **Institutional Announcements:** Broadcast campus-wide bulletins.

---

## 🚀 Running the Project Locally

### 1. Backend (FastAPI + SQLAlchemy)
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API runs on: **http://127.0.0.1:8000**
Interactive API Docs (Swagger UI): **http://127.0.0.1:8000/docs**

### 2. Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend Web App runs on: **http://127.0.0.1:5173**

---

## 🧪 Integration Verification
Run the automated test suites from the project root:
```bash
# Verify Auth & Role-Based Access Control:
python backend/test_auth.py

# Verify Full Live Integration & Endpoints:
python test_integration.py

# Verify AI Assignment Submission -> AI Suggestion -> Faculty Approval roundtrip:
python test_assignment_roundtrip.py
```
