import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Route Guards
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import EnrolledCourses from './pages/student/EnrolledCourses';
import CourseMaterials from './pages/student/CourseMaterials';
import MyMarks from './pages/student/MyMarks';
import PerformanceAnalytics from './pages/student/PerformanceAnalytics';
import Assignments from './pages/student/Assignments';
import AssignmentSubmission from './pages/student/AssignmentSubmission';
import AIAssignmentFeedback from './pages/student/AIAssignmentFeedback';
import StudyRecommendations from './pages/student/StudyRecommendations';
import Attendance from './pages/student/Attendance';
import StudentTimetable from './pages/student/StudentTimetable';
import DoubtAssistant from './pages/student/DoubtAssistant';
import AIQuizView from './pages/student/AIQuizView';
import CourseVideos from './pages/student/CourseVideos';
import StudentNotifications from './pages/student/StudentNotifications';
import Profile from './pages/student/Profile';

// Faculty Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CourseManagement from './pages/teacher/CourseManagement';
import CourseFiles from './pages/teacher/CourseFiles';
import AttendanceManagement from './pages/teacher/AttendanceManagement';
import ExamMarksManagement from './pages/teacher/ExamMarksManagement';
import Gradebook from './pages/teacher/Gradebook';
import FacultyAnnouncements from './pages/teacher/FacultyAnnouncements';
import AIQuizGenerator from './pages/teacher/AIQuizGenerator';
import TeacherStudentManagement from './pages/teacher/StudentManagement';
import MarksManagement from './pages/teacher/MarksManagement';
import AssignmentManagement from './pages/teacher/AssignmentManagement';
import AssignmentSubmissions from './pages/teacher/AssignmentSubmissions';
import AIAssignmentEvaluation from './pages/teacher/AIAssignmentEvaluation';
import ClassAnalytics from './pages/teacher/ClassAnalytics';
import FacultyTimetable from './pages/teacher/FacultyTimetable';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseCatalogAllocation from './pages/admin/CourseCatalogAllocation';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import ClassSectionManagement from './pages/admin/ClassSectionManagement';
import CampusTimetable from './pages/admin/CampusTimetable';
import AdminExams from './pages/admin/AdminExams';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminStudentManagement from './pages/admin/AdminStudentManagement';
import AdminTeacherManagement from './pages/admin/AdminTeacherManagement';
import SubjectManagement from './pages/admin/SubjectManagement';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<EnrolledCourses />} />
            <Route path="courses/:id/materials" element={<CourseMaterials />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="marks" element={<MyMarks />} />
            <Route path="analytics" element={<PerformanceAnalytics />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:id/submit" element={<AssignmentSubmission />} />
            <Route path="assignments/:id/feedback" element={<AIAssignmentFeedback />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="recommendations" element={<StudyRecommendations />} />
            <Route path="study-plan" element={<StudyRecommendations />} />
            <Route path="doubt" element={<DoubtAssistant />} />
            <Route path="quiz" element={<AIQuizView />} />
            <Route path="videos" element={<CourseVideos />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Faculty Protected Routes (/faculty & alias /teacher) */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="course-files" element={<CourseFiles />} />
            <Route path="students" element={<TeacherStudentManagement />} />
            <Route path="marks" element={<ExamMarksManagement />} />
            <Route path="exams" element={<ExamMarksManagement />} />
            <Route path="gradebook" element={<Gradebook />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="timetable" element={<FacultyTimetable />} />
            <Route path="assignments" element={<AssignmentManagement />} />
            <Route path="assignments/:id/submissions" element={<AssignmentSubmissions />} />
            <Route path="ai-evaluation" element={<AIAssignmentEvaluation />} />
            <Route path="evaluation/:id" element={<AIAssignmentEvaluation />} />
            <Route path="quiz-generator" element={<AIQuizGenerator />} />
            <Route path="announcements" element={<FacultyAnnouncements />} />
            <Route path="analytics" element={<ClassAnalytics />} />
          </Route>

          {/* Faculty Aliased Route for /teacher */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="course-files" element={<CourseFiles />} />
            <Route path="students" element={<TeacherStudentManagement />} />
            <Route path="marks" element={<ExamMarksManagement />} />
            <Route path="timetable" element={<FacultyTimetable />} />
            <Route path="assignments" element={<AssignmentManagement />} />
            <Route path="assignments/:id/submissions" element={<AssignmentSubmissions />} />
            <Route path="evaluation/:id" element={<AIAssignmentEvaluation />} />
            <Route path="analytics" element={<ClassAnalytics />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="courses" element={<CourseCatalogAllocation />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="sections" element={<ClassSectionManagement />} />
            <Route path="timetable" element={<CampusTimetable />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="students" element={<AdminStudentManagement />} />
            <Route path="teachers" element={<AdminTeacherManagement />} />
            <Route path="subjects" element={<SubjectManagement />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
