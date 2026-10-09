import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, AlertTriangle, CheckCircle, Mail, MessageSquare, ArrowUpDown } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTeacherStudents();
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.students) ? res.data.students : [];
      setStudents(list);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading registered student cohorts..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage
          title="Student Roster Unavailable"
          message={error}
          onRetry={fetchStudents}
        />
      </div>
    );
  }

  const studentList = Array.isArray(students) ? students : [];
  const filtered = studentList.filter((s) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'atRisk'
        ? s.atRisk
        : filter === 'top'
        ? (s.marksAvg || 0) >= 85
        : true;

    const matchesSearch =
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo || s.identifier || '').toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Cohort Management</h1>
          <p className="page-subtitle">
            Track individual progress, attendance compliance, and dispatch targeted academic interventions
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by student name or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Students ({students.length})
        </button>
        <button
          className={`tab-btn ${filter === 'atRisk' ? 'active' : ''}`}
          onClick={() => setFilter('atRisk')}
        >
          <AlertTriangle size={14} color="#ef4444" />
          At-Risk ({students.filter((s) => s.atRisk).length})
        </button>
        <button
          className={`tab-btn ${filter === 'top' ? 'active' : ''}`}
          onClick={() => setFilter('top')}
        >
          <CheckCircle size={14} color="#10b981" />
          Top Performers ({students.filter((s) => s.marksAvg >= 85).length})
        </button>
      </div>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Matched"
          description="No student records match the search filter or criteria."
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Marks Average</th>
                <th>Attendance</th>
                <th>Cohort Status</th>
                <th>AI Risk Flag</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} style={{ backgroundColor: student.atRisk ? '#fff5f5' : undefined }}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                    {student.rollNo}
                  </td>
                  <td style={{ fontWeight: 600 }}>{student.name}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{student.marksAvg}%</span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: student.attendance < 75 ? 'var(--danger)' : 'var(--success)'
                      }}
                    >
                      {student.attendance}%
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        student.status === 'Top Performer'
                          ? 'badge-success'
                          : student.status === 'Critical'
                          ? 'badge-danger'
                          : student.status === 'At Risk'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td>
                    {student.atRisk ? (
                      <span className="badge badge-danger" title={student.reason}>
                        <AlertTriangle size={11} /> {student.reason || 'At Risk'}
                      </span>
                    ) : (
                      <span className="badge badge-success">On Track</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => alert(`Sending academic advisory notice to ${student.name} (${student.rollNo}). Message queued!`)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                        title="Notify Student"
                      >
                        <Mail size={12} />
                        Alert
                      </button>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Details Inspection Modal */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{selectedStudent.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Roll No: {selectedStudent.rollNo}</span>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="btn-icon">✕</button>
            </div>
            <div className="modal-body">
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Marks</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedStudent.marksAvg}%</div>
                </div>
                <div className="card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attendance</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: selectedStudent.attendance < 75 ? 'var(--danger)' : 'var(--success)' }}>
                    {selectedStudent.attendance}%
                  </div>
                </div>
              </div>

              {selectedStudent.atRisk && (
                <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                  <AlertTriangle size={18} />
                  <div>
                    <strong>AI Intervention Triggered:</strong>
                    <div style={{ fontSize: '0.825rem', marginTop: '0.2rem' }}>{selectedStudent.reason}</div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Recommended Action: Dispatch diagnostic problem set on Weak Topics and schedule 10-minute office hours consultation.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary">Close</button>
              <button onClick={() => { alert(`Advisory invitation sent to ${selectedStudent.name}`); setSelectedStudent(null); }} className="btn btn-primary">
                Send AI Remediation Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
