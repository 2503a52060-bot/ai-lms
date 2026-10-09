import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  User,
  Layers,
  FileText,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Lock,
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' | 'catalog'
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [enrolledRes, availableRes] = await Promise.all([
        api.getStudentCourses(),
        api.getAvailableCourses()
      ]);
      setCourses(Array.isArray(enrolledRes.data) ? enrolledRes.data : []);
      setAvailableCourses(Array.isArray(availableRes.data) ? availableRes.data : []);
    } catch (err) {
      setError('Unable to load course curriculum. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      setError('');
      setSuccessMsg('');
      const res = await api.enrollCourse(courseId);
      setSuccessMsg(res.data?.message || 'Successfully enrolled in course!');
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to enroll in course';
      setError(detail);
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading course curriculum &amp; registration data..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Management &amp; Enrollment</h1>
          <p className="page-subtitle">Access learning modules, lecture notes, and register for semester courses</p>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            color: '#166534',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: '#991b1b',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Lock size={16} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="tabs-container" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
          onClick={() => { setActiveTab('enrolled'); setError(''); setSuccessMsg(''); }}
        >
          <BookOpen size={15} /> My Enrolled Courses ({courses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => { setActiveTab('catalog'); setError(''); setSuccessMsg(''); }}
        >
          <Plus size={15} /> Course Registration &amp; Catalog ({availableCourses.length})
        </button>
      </div>

      {/* TAB 1: ENROLLED COURSES */}
      {activeTab === 'enrolled' && (
        <>
          {courses.length === 0 ? (
            <EmptyState
              title="No Courses Enrolled"
              message="You are not currently enrolled in any academic subjects for this semester."
              actionText="Browse Course Catalog"
              onAction={() => setActiveTab('catalog')}
            />
          ) : (
            <div className="grid-2">
              {courses.map((course) => (
                <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span className="badge badge-primary">{course.code}</span>
                      <span className="badge badge-neutral">{course.credits} Credits</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      {course.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem', background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Layers size={15} color="var(--primary)" />
                        <span><strong>{course.modules_count || 0}</strong> Modules</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <FileText size={15} color="var(--secondary)" />
                        <span><strong>{course.resources_count || 0}</strong> Files</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Award size={15} color="#10b981" />
                        <span><strong>{course.assignments_count || 0}</strong> Tasks</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <User size={15} />
                      <span>Instructor: <strong style={{ color: 'var(--text-main)' }}>{course.faculty_name}</strong></span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    onClick={() => navigate(`/student/courses/${course.id}/materials`)}
                  >
                    <span>Study Materials &amp; Modules</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: COURSE REGISTRATION CATALOG */}
      {activeTab === 'catalog' && (
        <div>
          <div className="grid-2">
            {availableCourses.map((course) => {
              const isClosed = course.enrollment_status === 'closed' || (!course.is_enrollment_open && course.enrollment_end);
              const isUpcoming = course.enrollment_status === 'upcoming';
              const isOpen = course.is_enrollment_open && !course.is_enrolled;

              return (
                <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span className="badge badge-primary">{course.code}</span>
                        <span className="badge badge-neutral">{course.credits} Credits</span>
                      </div>

                      {course.is_enrolled ? (
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={12} /> Enrolled
                        </span>
                      ) : isClosed ? (
                        <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Lock size={12} /> Enrollment Closed
                        </span>
                      ) : isUpcoming ? (
                        <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={12} /> Upcoming
                        </span>
                      ) : (
                        <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Sparkles size={12} /> Open for Enrollment
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {course.description}
                    </p>

                    <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                        <Calendar size={13} color="var(--primary)" />
                        <span>Enrollment Window: <strong>{course.enrollment_start_formatted || 'Anytime'}</strong> to <strong>{course.enrollment_end_formatted || 'Open'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                        <User size={13} />
                        <span>Instructor: <strong style={{ color: 'var(--text-main)' }}>{course.faculty_name}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {course.is_enrolled ? (
                      <button
                        className="btn btn-outline"
                        style={{ width: '100%', borderColor: 'var(--success)', color: '#166534', gap: '0.35rem' }}
                        onClick={() => navigate(`/student/courses/${course.id}/materials`)}
                      >
                        <CheckCircle2 size={15} color="#16a34a" />
                        <span>Enrolled • View Materials</span>
                      </button>
                    ) : isClosed ? (
                      <button
                        className="btn btn-neutral"
                        disabled
                        style={{ width: '100%', opacity: 0.65, cursor: 'not-allowed', gap: '0.35rem', backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}
                      >
                        <Lock size={15} color="#dc2626" />
                        <span>Enrollment Closed</span>
                      </button>
                    ) : isUpcoming ? (
                      <button
                        className="btn btn-neutral"
                        disabled
                        style={{ width: '100%', opacity: 0.65, cursor: 'not-allowed', gap: '0.35rem' }}
                      >
                        <Clock size={15} />
                        <span>Enrollment Opens {course.enrollment_start_formatted}</span>
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', gap: '0.35rem' }}
                        disabled={enrollingId === course.id}
                        onClick={() => handleEnroll(course.id)}
                      >
                        <Plus size={15} />
                        <span>{enrollingId === course.id ? 'Enrolling...' : 'Enroll in Course'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
