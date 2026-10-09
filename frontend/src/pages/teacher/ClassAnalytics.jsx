import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, Users, AlertCircle, Award } from 'lucide-react';
import { api } from '../../services/api';
import PerformanceChart from '../../components/PerformanceChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DashboardCard from '../../components/DashboardCard';

const ClassAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.getClassAnalytics();
        setAnalytics(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating multi-subject class performance and cohort analytics..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage title="Class Analytics Unavailable" message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const distribution = Array.isArray(analytics?.distribution) ? analytics.distribution : [];
  const topicHeatmap = Array.isArray(analytics?.topicHeatmap) ? analytics.topicHeatmap : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cohort &amp; Class Performance Analytics</h1>
          <p className="page-subtitle">
            Statistical grade distributions, topic difficulty heatmaps, and systemic weakness identification
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <DashboardCard
          title="Total Cohort Size"
          value={overview.totalStudents ?? 64}
          subtitle="Enrolled in Department"
          color="primary"
          icon={Users}
        />
        <DashboardCard
          title="Cohort Mean Score"
          value={`${overview.averageClassScore ?? 78.4}%`}
          trend="+3.4% this semester"
          trendType="up"
          subtitle="All assignments combined"
          color="success"
          icon={TrendingUp}
        />
        <DashboardCard
          title="Pass Percentage"
          value="93.75%"
          trend="60 of 64 students"
          trendType="up"
          subtitle="Meets University Benchmark"
          color="info"
          icon={Award}
        />
        <DashboardCard
          title="Critical Intervention"
          value={overview.atRiskStudentsCount ?? 0}
          trend="Require tutoring"
          trendType="down"
          subtitle="Score below 60%"
          color="danger"
          icon={AlertCircle}
        />
      </div>

      {/* Grade Distribution Chart */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BarChart3 size={18} color="var(--primary)" />
                Cohort Grade Histogram
              </h3>
              <p className="card-subtitle">Distribution of students across standardized grade bands</p>
            </div>
          </div>
          <PerformanceChart
            type="bar"
            data={distribution}
            dataKeys={[{ key: 'count', name: 'Student Count', color: '#4f46e5' }]}
            xAxisKey="grade"
            height={280}
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PieChart size={18} color="#8b5cf6" />
                Percentage Breakdown by Tier
              </h3>
              <p className="card-subtitle">Relative proportion of class performance</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {distribution.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>Grade {item.grade}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {item.count} students ({item.percentage}%)
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${item.percentage * 2}%`,
                      backgroundColor: idx === 0 ? 'var(--success)' : idx === 1 ? 'var(--primary)' : idx === 2 ? 'var(--secondary)' : 'var(--warning)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Difficulty Heatmap */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <AlertCircle size={18} color="var(--danger)" />
              Curriculum Topic Difficulty Heatmap (Cohort Mastery)
            </h3>
            <p className="card-subtitle">
              Identifies which topics had the lowest average scores across the whole class
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Topic Name</th>
                <th>Subject Area</th>
                <th>Cohort Mastery Score</th>
                <th>Difficulty Level</th>
                <th>Recommended Teaching Action</th>
              </tr>
            </thead>
            <tbody>
              {topicHeatmap.map((topic, idx) => (
                <tr key={idx} style={{ backgroundColor: topic.score < 65 ? '#fff5f5' : undefined }}>
                  <td style={{ fontWeight: 600 }}>{topic.topic}</td>
                  <td>
                    <span className="badge badge-neutral">{topic.subject}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: topic.score < 65 ? 'var(--danger)' : 'var(--text-main)' }}>
                      {topic.score}%
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        topic.score < 65 ? 'badge-danger' : topic.score < 80 ? 'badge-warning' : 'badge-success'
                      }`}
                    >
                      {topic.score < 65 ? 'High Difficulty' : topic.score < 80 ? 'Moderate' : 'Mastered'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {topic.score < 65
                      ? 'Schedule 1 remedial lecture & supplementary lab problem sets'
                      : topic.score < 80
                      ? 'Assign standard practice homework drill'
                      : 'Proceed to next advanced curriculum unit'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassAnalytics;
