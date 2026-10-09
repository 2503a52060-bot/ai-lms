import React from 'react';
import { Menu, Bot, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, toggleMobileMenu }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          onClick={toggleMobileMenu}
          className="btn-icon"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--primary-light)',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--primary)'
            }}
          >
            <Bot size={14} />
            <span>AI Analytics Engine Active</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)'
              }}
            />
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {/* Authenticated Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className="badge badge-primary"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'capitalize'
            }}
          >
            {role === 'admin' ? '⚙️ Admin' : role === 'faculty' ? '👨‍🏫 Faculty' : '🎓 Student'}
          </span>
        </div>

        {/* User Card */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)'
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <UserCircle size={32} color="var(--primary)" />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn-icon"
              style={{ width: '28px', height: '28px', padding: 0, marginLeft: '0.35rem', border: 'none' }}
              title="Sign Out"
            >
              <LogOut size={16} color="var(--text-muted)" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
