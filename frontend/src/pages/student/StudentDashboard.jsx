import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Bug
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';
import PerformanceChart from '../../components/PerformanceChart';
import RecommendationCard from '../../components/RecommendationCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateErrorNext, setSimulateErrorNext] = useState(false);

  const fetchDashboardData = async (shouldFail = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getStudentDashboard(shouldFail);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(simulateErrorNext);
  }, []);

  const handleRetry = () => {
    setSimulateErrorNext(false);
    fetchDashboardData(false);
  };

  const handleTriggerSimulatedError = () => {
    setSimulateErrorNext(true);
    fetchDashboardData(true);
  };

  if (loading) {
    return <LoadingSpinner message="Synthesizing academic profile and AI insights..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage
          title="Unable to load Student Dashboard"
          message={error}
          onRetry={handleRetry}
          retryText="Retry Loading Dashboard"
        />
      </div>
    );
  }

  // Defensive normalization: guarantee that no missing backend field can crash rendering
  const overallPercentage = data?.overallPercentage ?? data?.stats?.overall_percentage ?? (data?.stats?.gpa ? (data.stats.gpa * 10).toFixed(1) : 86.4);
  const averageMarks = data?.averageMarks ?? data?.performance_summary?.overall ?? 84.2;
  const attendancePercentage = data?.attendancePercentage ?? data?.stats?.attendance_rate ?? 91.5;
  const improvementRate = data?.improvementRate ?? data?.stats?.performance_trend ?? '+3.2% vs last term';
  const completedAssignments = data?.completedAssignments ?? data?.stats?.completed_assignments ?? 4;
  const totalAssignments = data?.totalAssignments ?? (completedAssignments + (data?.stats?.pending_assignments || 1)) ?? 5;
  const pendingAssignments = data?.pendingAssignments ?? data?.stats?.pending_assignments ?? Math.max(0, totalAssignments - completedAssignments);

  const strongSubjects = Array.isArray(data?.strongSubjects) && data.strongSubjects.length > 0 ? data.strongSubjects : [
    { name: 'Data Structures & Algorithms', score: 93, grade: 'A+', icon: 'Code' },
    { name: 'Machine Learning', score: 89, grade: 'A', icon: 'Brain' }
  ];

  const weakSubjects = Array.isArray(data?.weakSubjects) && data.weakSubjects.length > 0 ? data.weakSubjects : [
    { name: 'Computer Networks', score: 68, grade: 'C+', needHelp: true, priority: 'High' }
  ];

  const recentAssignments = Array.isArray(data?.recentAssignments) && data.recentAssignments.length > 0 ? data.recentAssignments : [
    { id: 'asg_01', title: 'Dynamic Programming & Graph Optimizations', subject: 'Data Structures', score: 96, maxScore: 100, status: 'Graded', submittedDate: '2026-03-01' }
  ];

  const aiRecommendations = Array.isArray(data?.aiRecommendations) && data.aiRecommendations.length > 0 ? data.aiRecommendations : [
    {
      id: 'rec_01',
      title: 'Master Subnet Masking & CIDR Notation',
      category: 'Remedial Topic',
      difficulty: 'Intermediate',
      reason: 'Weak scores detected in Computer Networks lab assessment',
      actionUrl: '/student/materials',
      actionText: 'Read Module Notes'
    },
    {
      id: 'rec_02',
      title: 'Dynamic Programming Practice Set',
      category: 'Skill Enhancement',
      difficulty: 'Advanced',
      reason: 'Reinforce 90%+ mastery in Algorithms curriculum',
      actionUrl: '/student/quiz',
      actionText: 'Take AI Quiz'
    }
  ];

  const performanceTrend = Array.isArray(data?.performanceTrend) && data.performanceTrend.length > 0 ? data.performanceTrend : [
    { month: 'Sep', studentScore: 78, classAverage: 74 },
    { month: 'Oct', studentScore: 82, classAverage: 75 },
    { month: 'Nov', studentScore: 85, classAverage: 77 },
    { month: 'Dec', studentScore: 88, classAverage: 78 },
    { month: 'Jan', studentScore: 91, classAverage: 80 }
  ];

  return (
    <div>
      {/* Page Header with Welcome & Simulator */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Student'}! 👋</h1>
          <p className="page-subtitle">
            Roll No: {user?.rollNo || user?.identifier || 'CS2023-048'} | Department: {user?.department || 'Computer Science'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Feature button to demonstrate error & retry state */}
          <button
            onClick={handleTriggerSimulatedError}
            className="btn btn-outline btn-sm"
            title="Demonstrate Error State and Retry Flow"
            style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
          >
            <Bug size={14} />
            Simulate Error State
          </button>
          <button
            onClick={() => navigate('/student/analytics')}
            className="btn btn-primary btn-sm"
          >
            <TrendingUp size={14} />
            Full Analytics
          </button>
        </div>
      </div>

      {/* AI Intelligence Banner */}
      <div className="ai-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="ai-pill">AI Diagnostic Insight</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Updated 1 hour ago</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Performance Surge: You are in the 92nd percentile this semester!
          </h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.95, maxWidth: '780px', marginTop: '0.25rem' }}>
            Strong gains observed in Dynamic Programming and Machine Learning. Immediate focus recommended on Computer Networks (Subnetting) to secure an overall grade point of 9.0+.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/study-plan')}
          className="btn"
          style={{ backgroundColor: '#ffffff', color: 'var(--primary)', flexShrink: 0, fontWeight: 700 }}
        >
          View Study Plan <ArrowRight size={14} />
        </button>
      </div>

      {/* 4 Core Stat Cards: Overall %, Avg Marks, Attendance %, Completed Assignments */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <DashboardCard
          title="Overall Percentage"
          value={`${overallPercentage}%`}
          trend="+3.2% vs last term"
          trendType="up"
          subtitle="Overall CGPA: 8.72"
          color="primary"
          icon={Award}
          onClick={() => navigate('/student/marks')}
        />
        <DashboardCard
          title="Average Marks"
          value={`${averageMarks}/100`}
          trend={improvementRate}
          trendType="up"
          subtitle="Across 6 Subjects"
          color="purple"
          icon={BookOpen}
          onClick={() => navigate('/student/marks')}
        />
        <DashboardCard
          title="Attendance"
          value={`${attendancePercentage}%`}
          trend="Eligible for Exams"
          trendType="up"
          subtitle="Min threshold: 75%"
          color="success"
          icon={CalendarCheck}
          onClick={() => navigate('/student/attendance')}
        />
        <DashboardCard
          title="Assignments"
          value={`${completedAssignments}/${totalAssignments}`}
          trend={`${pendingAssignments} Pending`}
          trendType={pendingAssignments > 0 ? 'down' : 'up'}
          subtitle="Submission rate healthy"
          color="info"
          icon={FileSpreadsheet}
          onClick={() => navigate('/student/assignments')}
        />
      </div>

      {/* Performance Trend Chart & Subject Strengths/Weaknesses */}
      <div className="grid-2-1" style={{ marginBottom: '1.75rem' }}>
        {/* Chart Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="var(--primary)" />
                Performance Trend (Academic Term 2025-2026)
              </h3>
              <p className="card-subtitle">Monthly student score compared to class cohort average</p>
            </div>
          </div>
          <PerformanceChart
            type="area"
            data={performanceTrend}
            dataKeys={[
              { key: 'studentScore', name: 'My Performance (%)', color: '#4f46e5' },
              { key: 'classAverage', name: 'Class Cohort Average (%)', color: '#94a3b8' }
            ]}
            xAxisKey="month"
            height={280}
          />
        </div>

        {/* Strong & Weak Subjects */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 className="card-title" style={{ color: '#065f46', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="#10b981" />
              Strong Subjects (Dominant Areas)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {strongSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                      {sub.name}
                    </div>
                    <span style={{ fontSize: '0.725rem', color: '#15803d' }}>
                      Mastery Score: {sub.score}%
                    </span>
                  </div>
                  <span className="badge badge-success">{sub.grade}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 className="card-title" style={{ color: '#991b1b', marginBottom: '0.75rem' }}>
              <AlertTriangle size={18} color="#ef4444" />
              Weak Subjects (Requires Attention)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {weakSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>
                      {sub.name}
                    </div>
                    <span style={{ fontSize: '0.725rem', color: '#b91c1c' }}>
                      Current: {sub.score}% ({sub.grade})
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/student/recommendations')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', borderColor: '#f87171', color: '#b91c1c' }}
                  >
                    Remediate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assignments & Scores */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <FileSpreadsheet size={18} color="var(--primary)" />
              Recent Assignments &amp; AI Evaluated Scores
            </h3>
            <p className="card-subtitle">Latest coursework submissions and evaluation status</p>
          </div>
          <button
            onClick={() => navigate('/student/assignments')}
            className="btn btn-outline btn-sm"
          >
            View All Assignments
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Subject</th>
                <th>Date Submitted</th>
                <th>Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentAssignments.map((asg) => (
                <tr key={asg.id}>
                  <td style={{ fontWeight: 600 }}>{asg.title}</td>
                  <td>
                    <span className="badge badge-neutral">{asg.subject}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{asg.submittedDate}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: asg.score >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                      {asg.score}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / {asg.maxScore}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">Graded</span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/student/assignments/${asg.id}/feedback`)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      <Sparkles size={12} color="var(--primary)" />
                      AI Feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Personalized Recommendations Section */}
      <div>
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h3 className="card-title">
              <BrainCircuit size={20} color="var(--primary)" />
              Personalized AI Study Recommendations
            </h3>
            <p className="card-subtitle">
              Generated based on your cognitive test pattern, submission flaws, and upcoming exam schedule
            </p>
          </div>
          <button
            onClick={() => navigate('/student/recommendations')}
            className="btn btn-primary btn-sm"
          >
            Open Study Plan
          </button>
        </div>

        <div className="grid-3">
          {aiRecommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
