import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, role);
    setLoading(false);

    if (result.success) {
      const authenticatedRole = (result.user?.role || role)?.toLowerCase();
      const userRole = authenticatedRole === 'teacher' ? 'faculty' : authenticatedRole;
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'faculty') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickFill = (presetRole) => {
    setError('');
    if (presetRole === 'student') {
      setEmail('student@lms.edu');
      setPassword('student123');
      setRole('student');
    } else if (presetRole === 'faculty') {
      setEmail('faculty@lms.edu');
      setPassword('faculty123');
      setRole('faculty');
    } else if (presetRole === 'admin') {
      setEmail('admin@lms.edu');
      setPassword('admin123');
      setRole('admin');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 60%)',
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Left Side: System Highlights */}
        <div
          style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#ffffff',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
              <div className="brand-icon-box">
                <GraduationCap size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  LearnPulse AI
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Intelligent Student Analytics
                </span>
              </div>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
              Next-Generation AI Learning &amp; Performance Analytics
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Empowering students, professors, and administrators with real-time weakness detection, automated rubric grading, and predictive academic intelligence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Subject &amp; Topic-level Cognitive Mastery Tracking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Automated AI Assignment Rubric Evaluation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Real-time At-Risk Student Intervention Alerts</span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.8rem',
              color: '#94a3b8'
            }}
          >
            🎓 <strong>College Project Edition:</strong> Pre-configured with rich mock records, analytics engines, and instant role testing.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Sign In to Your Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter your credentials or choose a 1-click Demo Account below
            </p>
          </div>

          {/* Quick Demo Access Buttons */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Fill Role Credentials
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', borderColor: 'var(--primary-border)', color: 'var(--primary)', fontWeight: 700 }}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('faculty')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', borderColor: '#bae6fd', color: '#0284c7', fontWeight: 700 }}
              >
                👨‍🏫 Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', borderColor: '#ddd6fe', color: '#7c3aed', fontWeight: 700 }}
              >
                ⚙️ Admin
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0 1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR ENTER CREDENTIALS</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          </div>

          {error && (
            <ErrorMessage
              title="Authentication Error"
              message={error}
              onRetry={() => setError('')}
              retryText="Clear"
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Portal Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student Portal</option>
                <option value="faculty">Faculty Portal</option>
                <option value="admin">Administrator Portal</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              {loading ? (
                <LoadingSpinner message="Authenticating..." size={18} centered={false} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
