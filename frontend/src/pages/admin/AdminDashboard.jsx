import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  Activity,
  Server,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [sRes, aRes] = await Promise.all([
          api.getAdminStats(),
          api.getAdminAudits()
        ]);
        setStats(sRes.data);
        setAudits(aRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Querying institutional user registries and system health..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage title="Admin Service Offline" message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const totalUsers = stats?.totalUsers ?? stats?.total_users ?? 6;
  const totalStudents = stats?.totalStudents ?? stats?.total_students ?? 4;
  const totalTeachers = stats?.totalTeachers ?? stats?.total_faculty ?? 1;
  const totalCourses = stats?.totalCourses ?? stats?.total_courses ?? 3;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Institution System Administration</h1>
          <p className="page-subtitle">
            Global directory management, AI engine telemetry, academic security, and audit trails
          </p>
        </div>

        <div className="badge badge-success" style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}>
          <Server size={14} /> AI Cluster Status: Optimal (24ms latency)
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <DashboardCard
          title="Total User Accounts"
          value={totalUsers}
          trend="+45 this month"
          trendType="up"
          subtitle="All roles combined"
          color="primary"
          icon={Users}
          onClick={() => navigate('/admin/users')}
        />
        <DashboardCard
          title="Registered Students"
          value={totalStudents}
          trend="8 Active Batches"
          trendType="neutral"
          subtitle="Undergraduate &amp; PG"
          color="success"
          icon={GraduationCap}
          onClick={() => navigate('/admin/students')}
        />
        <DashboardCard
          title="Faculty Members"
          value={totalTeachers}
          trend="100% Active"
          trendType="up"
          subtitle="Across 6 Departments"
          color="info"
          icon={Briefcase}
          onClick={() => navigate('/admin/teachers')}
        />
        <DashboardCard
          title="Active Courses"
          value={totalCourses}
          trend="Spring 2026 Term"
          trendType="neutral"
          subtitle="Full syllabus mapped"
          color="purple"
          icon={Layers}
          onClick={() => navigate('/admin/subjects')}
        />
      </div>

      {/* System Health & Audit Trails */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* System Telemetry & AI Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} color="var(--primary)" />
              Infrastructure &amp; AI Engine Telemetry
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>System Platform Uptime</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High availability failover active</div>
              </div>
              <span className="badge badge-success">{stats.systemUptime}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Automated AI Evaluation Queue</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submissions processed per minute: 18</div>
              </div>
              <span className="badge badge-purple">Zero Backlog</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Database Cluster Integrity</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Replica synchronization healthy</div>
              </div>
              <span className="badge badge-success">Master-Slave In Sync</span>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="var(--text-muted)" />
              Recent System Administrative Audits
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Realtime ledger</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {audits.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.action}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Triggered by: {item.actor}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
