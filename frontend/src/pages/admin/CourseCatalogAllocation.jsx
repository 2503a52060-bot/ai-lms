import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, User, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const CourseCatalogAllocation = () => {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New course form
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    department: 'Computer Science & Engineering',
    credits: 3,
    semester: 'Semester 5',
    academic_year: '2025-2026',
    faculty_id: null
  });

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminCourses();
      setCourses(res.data?.courses || []);
      setFacultyList(res.data?.available_faculty || []);
    } catch (err) {
      setError('Could not load course catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.adminCreateCourse({
        ...newCourse,
        faculty_id: newCourse.faculty_id ? parseInt(newCourse.faculty_id) : null
      });
      setMessage(`Course ${newCourse.code} added to catalog!`);
      setShowModal(false);
      setNewCourse({
        code: '',
        title: '',
        department: 'Computer Science & Engineering',
        credits: 3,
        semester: 'Semester 5',
        academic_year: '2025-2026',
        faculty_id: null
      });
      fetchCatalog();
    } catch (err) {
      alert(err.response?.data?.detail || 'Course creation failed');
    }
  };

  const handleAssignFaculty = async (courseId, facultyId) => {
    try {
      await api.assignFacultyToCourse(courseId, facultyId ? parseInt(facultyId) : null);
      setMessage('Faculty allocation updated!');
      fetchCatalog();
    } catch (err) {
      alert('Could not update faculty allocation.');
    }
  };

  if (loading && courses.length === 0) return <LoadingSpinner message="Loading course catalog &amp; allocations..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Catalog &amp; Faculty Allocation</h1>
          <p className="page-subtitle">Configure academic offerings and assign professors to courses</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} />
          <span>New Catalog Course</span>
        </button>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Enrolled</th>
              <th>Assigned Faculty</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td>
                  <span className="badge badge-primary">{c.code}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.semester} • {c.academic_year}</div>
                </td>
                <td>{c.department}</td>
                <td>{c.credits} Credits</td>
                <td>
                  <span className="badge badge-neutral">{c.enrolled_students || 0} Students</span>
                </td>
                <td>
                  <select
                    className="form-select"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', minWidth: '180px' }}
                    value={c.faculty_id || ''}
                    onChange={(e) => handleAssignFaculty(c.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Add Course to Catalog</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS501"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Advanced Compiler Design"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                    min="1"
                    max="6"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Faculty</label>
                  <select
                    className="form-select"
                    value={newCourse.faculty_id || ''}
                    onChange={(e) => setNewCourse({ ...newCourse, faculty_id: e.target.value })}
                  >
                    <option value="">Unassigned (Select Later)</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCatalogAllocation;
