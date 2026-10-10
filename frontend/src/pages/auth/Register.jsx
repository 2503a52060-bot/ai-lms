import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, User, BookOpen, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    rollNo: '',
    department: 'Computer Science & Engineering',
    adminSecret: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.role === 'admin' && !formData.adminSecret.trim()) {
      setError('Admin Setup Secret Key is required to create an Administrator account.');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      identifier: formData.rollNo,
      admin_secret: formData.adminSecret,
      password: formData.password
    });
    setLoading(false);

    if (result.success) {
      const assignedRole = (result.user?.role || formData.role)?.toLowerCase();
      if (assignedRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (assignedRole === 'faculty' || assignedRole === 'teacher') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top left, #e0e7ff 0%, #f8fafc 60%)',
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          padding: '2.5rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            className="brand-icon-box"
            style={{ margin: '0 auto 1rem auto', width: '48px', height: '48px' }}
          >
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Create Your Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Join the AI-Powered Learning Management System
          </p>
        </div>

        {error && (
          <ErrorMessage
            title="Registration Notice"
            message={error}
            onRetry={() => setError('')}
            retryText="Dismiss"
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">I am registering as</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="faculty">Professor / Faculty</option>
              <option value="admin">Administrator (Secure Setup)</option>
            </select>
          </div>

          {formData.role === 'admin' && (
            <div className="form-group" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b21a8', fontWeight: 700, marginBottom: '0.4rem' }}>
                <Shield size={16} />
                <span>Admin Setup Secret Key</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#9333ea" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="adminSecret"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', borderColor: '#d8b4fe', backgroundColor: '#ffffff' }}
                  placeholder="Enter Admin Setup Key (e.g. admin123)"
                  value={formData.adminSecret}
                  onChange={handleChange}
                  required
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#7e22ce', display: 'block', marginTop: '0.35rem' }}>
                🔒 Secure verification required to provision administrator privileges.
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="name"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="e.g. Jordan Hayes"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="jordan@univ.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {formData.role === 'student' ? 'Roll / Enrollment No.' : formData.role === 'admin' ? 'Admin Staff ID' : 'Faculty ID'}
              </label>
              <div style={{ position: 'relative' }}>
                <BookOpen size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="rollNo"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder={formData.role === 'student' ? 'CS2023-099' : 'FAC-CS-12'}
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              name="department"
              className="form-select"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics &amp; Communication</option>
              <option value="Artificial Intelligence & Data Science">Artificial Intelligence &amp; Data Science</option>
            </select>
          </div>

          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? (
              <LoadingSpinner message="Creating account..." size={18} centered={false} />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
