import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Plus, Filter, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminStudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    department: 'Computer Science',
    email: '',
    batch: '2023-2027'
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getTeacherStudents();
      setStudents(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEnroll = (e) => {
    e.preventDefault();
    setStudents((prev) => [
      ...prev,
      {
        id: `std_${Date.now()}`,
        name: newStudent.name,
        rollNo: newStudent.rollNo,
        marksAvg: 75.0,
        attendance: 90.0,
        status: 'Good',
        atRisk: false
      }
    ]);
    setShowModal(false);
    alert(`Enrolled student ${newStudent.name} successfully!`);
  };

  if (loading) {
    return <LoadingSpinner message="Querying student university registry..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage title="Registry Offline" message={error} onRetry={fetchStudents} />
      </div>
    );
  }

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">University Student Registry</h1>
          <p className="page-subtitle">
            Centralized enrollment, matriculation records, and departmental allocations
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus size={14} /> Enroll New Student
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search student or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Full Name</th>
                <th>Current Status</th>
                <th>Academic Average</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                    {s.rollNo}
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>
                    <span className="badge badge-success">Matriculated</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{s.marksAvg}%</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: s.attendance >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => alert(`Showing academic dossier for ${s.name}`)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Enroll New Student</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon">✕</button>
            </div>
            <form onSubmit={handleEnroll}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Maya Lin"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Roll / Enrollment No</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="CS2023-112"
                      value={newStudent.rollNo}
                      onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={newStudent.batch}
                      onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Information Science">Information Science</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentManagement;
