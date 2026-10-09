import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Checking notifications..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchNotifs} />;

  return (
    <div className="page-container" style={{ maxWidth: '850px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Academic updates, submission feedback, and AI study alerts</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="All Caught Up!"
          message="You have no unread notifications at this time."
          actionText="Refresh"
          onAction={fetchNotifs}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.15rem',
                borderLeft: '4px solid var(--primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bell size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {n.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {n.created_at}
                  </span>
                </div>
              </div>

              {n.link && (
                <Link to={n.link} className="btn btn-outline btn-sm" style={{ flexShrink: 0, gap: '0.35rem' }}>
                  <span>View</span>
                  <ExternalLink size={13} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
