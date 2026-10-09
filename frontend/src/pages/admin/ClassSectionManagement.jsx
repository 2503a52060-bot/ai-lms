import React, { useState, useEffect } from 'react';
import { Layers, Plus, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ClassSectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [secForm, setSecForm] = useState({ name: '', academic_year: '2025-2026', semester: 'Fall 2026', department: 'Computer Science & Engineering' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await api.getSections();
      setSections(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createSection(secForm);
      setMessage(`Class section ${secForm.name} added!`);
      setShowModal(false);
      setSecForm({ name: '', academic_year: '2025-2026', semester: 'Fall 2026', department: 'Computer Science & Engineering' });
      fetchSections();
    } catch (e) {
      alert('Could not add section');
    }
  };

  if (loading) return <LoadingSpinner message="Loading sections and cohorts..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes, Sections &amp; Academic Cohorts</h1>
          <p className="page-subtitle">Configure year groups, semester rosters, and student cohort allocations</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} />
          <span>Add Section</span>
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
              <th>Section Name</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Academic Year</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(s => (
              <tr key={s.id}>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</span>
                </td>
                <td>{s.department}</td>
                <td>
                  <span className="badge badge-primary">{s.semester}</span>
                </td>
                <td>{s.academic_year}</td>
                <td>
                  <span className="badge badge-success">Active Session</span>
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
              <h3 style={{ fontWeight: 700 }}>Add Section</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Section Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CSE Section C"
                    value={secForm.name}
                    onChange={(e) => setSecForm({ ...secForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <input
                    type="text"
                    className="form-input"
                    value={secForm.academic_year}
                    onChange={(e) => setSecForm({ ...secForm, academic_year: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="text"
                    className="form-input"
                    value={secForm.semester}
                    onChange={(e) => setSecForm({ ...secForm, semester: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Section</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSectionManagement;
