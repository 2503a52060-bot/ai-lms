import React, { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', head_faculty_name: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await api.getDepartments();
      setDepartments(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createDepartment(deptForm);
      setMessage(`Department ${deptForm.name} created!`);
      setShowModal(false);
      setDeptForm({ name: '', code: '', description: '', head_faculty_name: '' });
      fetchDepts();
    } catch (e) {
      alert('Could not create department');
    }
  };

  if (loading) return <LoadingSpinner message="Loading academic departments..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Departments</h1>
          <p className="page-subtitle">Manage institutional divisions, department heads, and faculty councils</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="grid-2">
        {departments.map(d => (
          <div key={d.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">{d.code}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Head: <strong>{d.head}</strong></span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{d.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {d.description || 'Core academic and research division.'}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Add Academic Department</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mechanical &amp; Aerospace Engineering"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MECH"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Head / Dean</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Arthur Samuel"
                    value={deptForm.head_faculty_name}
                    onChange={(e) => setDeptForm({ ...deptForm, head_faculty_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
