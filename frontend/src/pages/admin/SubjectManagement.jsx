import React, { useState, useEffect } from 'react';
import { Layers, Search, Plus, BookOpen, Users } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newSub, setNewSub] = useState({
    code: '',
    name: '',
    credits: 4,
    department: 'Computer Science',
    faculty: 'Prof. Katherine Reed',
    studentsCount: 64
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminSubjects();
      setSubjects(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = (e) => {
    e.preventDefault();
    setSubjects((prev) => [...prev, newSub]);
    setShowModal(false);
    alert(`Added subject ${newSub.code} - ${newSub.name} to curriculum!`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading course catalogue and departmental syllabus..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage title="Syllabus Catalogue Offline" message={error} onRetry={fetchSubjects} />
      </div>
    );
  }

  const filtered = subjects.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Curriculum &amp; Course Subject Management</h1>
          <p className="page-subtitle">
            Configure institutional degree courses, assign credit allocations, and assign faculty chairs
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus size={14} /> Add Curriculum Subject
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search course code or name..."
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
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Department</th>
                <th>Credit Weight</th>
                <th>Assigned Faculty Chair</th>
                <th>Enrolled Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.code}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                    {sub.code}
                  </td>
                  <td style={{ fontWeight: 600 }}>{sub.name}</td>
                  <td>{sub.department}</td>
                  <td>
                    <span className="badge badge-neutral">{sub.credits} Credits</span>
                  </td>
                  <td>{sub.faculty}</td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{sub.studentsCount} Students</span>
                  </td>
                  <td>
                    <button
                      onClick={() => alert(`Editing syllabus topics and rubrics for ${sub.name}`)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Syllabus
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add New Curriculum Subject</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon">✕</button>
            </div>
            <form onSubmit={handleAddSubject}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Course Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS701"
                      className="form-input"
                      value={newSub.code}
                      onChange={(e) => setNewSub({ ...newSub, code: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      required
                      className="form-input"
                      value={newSub.credits}
                      onChange={(e) => setNewSub({ ...newSub, credits: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud Computing & Distributed Systems"
                    className="form-input"
                    value={newSub.name}
                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Faculty Chair</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newSub.faculty}
                    onChange={(e) => setNewSub({ ...newSub, faculty: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
