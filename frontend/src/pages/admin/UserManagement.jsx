import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, CheckCircle, XCircle, UserPlus, Filter, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'student',
    department: 'Computer Science & Engineering',
    identifier: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminUser(newUser);
      setMessage(`User account for ${newUser.name} created successfully!`);
      setShowModal(false);
      setNewUser({
        name: '',
        email: '',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering',
        identifier: ''
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.deleteAdminUser(userId);
      setMessage('User account removed.');
      fetchUsers();
    } catch (err) {
      alert('Could not delete user account.');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.updateAdminUser(user.id, { is_active: !user.is_active });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner message="Retrieving institutional identities and user credentials..." />;
  }

  const filtered = users.filter((u) => {
    const roleMatches =
      roleFilter === 'all'
        ? true
        : roleFilter === 'faculty'
        ? u.role === 'faculty' || u.role === 'teacher'
        : u.role === roleFilter;

    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());

    return roleMatches && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Global User &amp; Access Management</h1>
          <p className="page-subtitle">
            Directory of all student, faculty, and administrator accounts registered across the institution
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <UserPlus size={16} />
          <span>Provision New User</span>
        </button>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setRoleFilter('all')}
              className={`btn btn-sm ${roleFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`btn btn-sm ${roleFilter === 'student' ? 'btn-primary' : 'btn-outline'}`}
            >
              Students ({users.filter((u) => u.role === 'student').length})
            </button>
            <button
              onClick={() => setRoleFilter('faculty')}
              className={`btn btn-sm ${roleFilter === 'faculty' ? 'btn-primary' : 'btn-outline'}`}
            >
              Faculty ({users.filter((u) => u.role === 'faculty' || u.role === 'teacher').length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
            >
              Admins ({users.filter((u) => u.role === 'admin').length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Roll / Emp ID</th>
              <th>Full Name</th>
              <th>Institutional Email</th>
              <th>Assigned Role</th>
              <th>Department</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                  {user.identifier || `ID-${user.id}`}
                </td>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                <td>
                  <span
                    className={`badge ${
                      user.role === 'admin'
                        ? 'badge-purple'
                        : (user.role === 'faculty' || user.role === 'teacher')
                        ? 'badge-info'
                        : 'badge-primary'
                    }`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {user.role}
                  </span>
                </td>
                <td>{user.department || user.dept || 'Engineering'}</td>
                <td>
                  <span className={`badge ${user.is_active !== false ? 'badge-success' : 'badge-danger'}`}>
                    {user.is_active !== false ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => toggleStatus(user)}
                      className={`btn btn-sm ${user.is_active !== false ? 'btn-outline' : 'btn-success'}`}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                    >
                      {user.is_active !== false ? 'Suspend' : 'Reactivate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', padding: '0.2rem 0.55rem' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Provision New User */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Provision New Account</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maya Lin"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Institutional Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. maya.lin@lms.edu"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
