import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Award,
  BarChart3,
  FileSpreadsheet,
  BrainCircuit,
  CalendarCheck2,
  User,
  Users,
  CheckSquare,
  BookOpen,
  PieChart,
  ShieldCheck,
  Briefcase,
  Layers,
  HelpCircle,
  Sparkles,
  Calendar,
  Bell,
  Archive,
  Megaphone,
  Building2,
  FolderOpen,
  Video,
  X,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isMobileOpen, closeMobileMenu, isCollapsed }) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (closeMobileMenu) closeMobileMenu();
    navigate('/login', { replace: true });
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/courses', label: 'Enrolled Courses', icon: BookOpen },
    { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck2 },
    { to: '/student/marks', label: 'Marks & Results', icon: Award },
    { to: '/student/analytics', label: 'Performance Analytics', icon: BarChart3 },
    { to: '/student/assignments', label: 'Assignments', icon: FileSpreadsheet },
    { to: '/student/timetable', label: 'Class Timetable', icon: Calendar },
    { to: '/student/study-plan', label: 'Study Plan', icon: BrainCircuit },
    { to: '/student/doubt', label: 'AI Doubt Assistant', icon: HelpCircle },
    { to: '/student/quiz', label: 'AI Diagnostic Quiz', icon: Sparkles },
    { to: '/student/videos', label: 'Course Videos', icon: Video },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'Profile', icon: User }
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { to: '/faculty/courses', label: 'Course & Modules', icon: Layers },
    { to: '/faculty/course-files', label: 'Course Files', icon: FolderOpen },
    { to: '/faculty/timetable', label: 'Teaching Timetable', icon: Calendar },
    { to: '/faculty/assignments', label: 'Assignments & Review', icon: BookOpen },
    { to: '/faculty/ai-evaluation', label: 'AI Correction Suite', icon: Sparkles },
    { to: '/faculty/attendance', label: 'Mark Attendance', icon: CalendarCheck2 },
    { to: '/faculty/exams', label: 'Exams & Marks', icon: CheckSquare },
    { to: '/faculty/gradebook', label: 'Gradebook', icon: Award },
    { to: '/faculty/quiz-generator', label: 'AI Quiz Generator', icon: BrainCircuit },
    { to: '/faculty/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/faculty/analytics', label: 'Faculty Analytics', icon: PieChart }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
    { to: '/admin/users', label: 'Accounts & Roles', icon: Users },
    { to: '/admin/courses', label: 'Catalog & Allocations', icon: BookOpen },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/sections', label: 'Classes & Sections', icon: Layers },
    { to: '/admin/timetable', label: 'Campus Timetable', icon: Calendar },
    { to: '/admin/exams', label: 'Exams Schedule', icon: CheckSquare },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone }
  ];

  let currentLinks = studentLinks;
  if (role === 'faculty' || role === 'teacher') currentLinks = facultyLinks;
  if (role === 'admin') currentLinks = adminLinks;

  const roleLabel = (role === 'faculty' || role === 'teacher') ? 'FACULTY' : role.toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 35,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="brand-logo" onClick={closeMobileMenu}>
            <div className="brand-icon-box">
              <GraduationCap size={22} />
            </div>
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  LearnPulse AI
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>
                  Analytics &amp; LMS
                </span>
              </div>
            )}
          </NavLink>

          {isMobileOpen && (
            <button
              onClick={closeMobileMenu}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-title">
            {!isCollapsed && `${roleLabel} PORTAL`}
          </div>

          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title={link.label}
              >
                <Icon size={18} />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {!isCollapsed && (
          <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                color: '#f87171',
                borderColor: 'rgba(248, 113, 113, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                cursor: 'pointer'
              }}
              title="Sign Out of Session"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                  AI Engine v2.4 Active
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  Connected to FastAPI
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
