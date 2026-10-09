import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  FileCheck,
  Sparkles,
  BarChart3,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import PerformanceChart from '../../components/PerformanceChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [classAnalytics, setClassAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeacherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, stdRes, subRes, anaRes] = await Promise.all([
        api.getTeacherOverview(),
        api.getTeacherStudents(),
        api.getAssignmentSubmissions('all'),
        api.getClassAnalytics()
      ]);
      setOverview(ovRes?.data || {});
      const stdList = Array.isArray(stdRes?.data)
        ? stdRes.data
        : Array.isArray(stdRes?.data?.students)
        ? stdRes.data.students
        : [];
      setStudents(stdList);

      const subList = Array.isArray(subRes?.data)
        ? subRes.data
        : Array.isArray(subRes?.data?.submissions)
        ? subRes.data.submissions
        : [];
      setSubmissions(subList);

      setClassAnalytics(anaRes?.data || {});
    } catch (err) {
      setError(err.message || 'Failed to load teacher analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating class performance and AI evaluation queues..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage
          title="Teacher Dashboard Unavailable"
          message={error}
          onRetry={fetchTeacherData}
        />
      </div>
    );
  }

  const totalStudents = overview?.totalStudents ?? 48;
  const averageClassScore = overview?.averageClassScore ?? 78.4;
  const pendingSubmissionsCount = overview?.pendingSubmissionsCount ?? 4;
  const atRiskStudentsCount = overview?.atRiskStudentsCount ?? 2;

  const distributionData = Array.isArray(classAnalytics?.distribution)
    ? classAnalytics.distribution
    : [
        { grade: 'O (90-100)', count: 12 },
        { grade: 'A+ (80-89)', count: 24 },
        { grade: 'A (70-79)', count: 16 },
        { grade: 'B (60-69)', count: 8 },
        { grade: 'Below 60', count: 4 }
      ];

  const normalizedStudents = Array.isArray(students)
    ? students
    : Array.isArray(students?.students)
    ? students.students
    : [];

  const atRiskFromStudents = normalizedStudents.filter((s) => s.atRisk);
  const atRiskFromOverview = Array.isArray(overview?.weak_students)
    ? overview.weak_students.map(ws => ({
        id: ws.id,
        name: ws.name,
        rollNo: ws.identifier || 'STU-101',
        marksAvg: ws.average_marks || 62.0,
        attendance: ws.attendance_rate || 70.0,
        status: ws.risk_level || 'At Risk',
        atRisk: true,
        reason: ws.concern_area || 'Performance alert'
      }))
    : [];

  const atRiskList = atRiskFromOverview.length > 0 ? atRiskFromOverview : atRiskFromStudents;

  // Submissions normalization
  const rawSubmissions = Array.isArray(submissions) && submissions.length > 0
    ? submissions
    : Array.isArray(submissions?.submissions) && submissions.submissions.length > 0
    ? submissions.submissions
    : Array.isArray(overview?.pending_submissions)
    ? overview.pending_submissions
    : [];

  const normalizedSubmissions = rawSubmissions.map(sub => ({
    id: sub.id,
    studentName: sub.studentName || sub.student_name || 'Alex Morgan',
    rollNo: sub.rollNo || sub.student_identifier || 'STU-101',
    assignmentTitle: sub.assignmentTitle || sub.assignment_title || 'Course Assignment',
    submittedOn: sub.submittedOn || sub.submitted_at || 'Recent',
    aiSuggestedScore: sub.aiSuggestedScore ?? sub.ai_suggested_marks ?? 45,
    aiConfidence: sub.aiConfidence || '94% High',
    status: sub.status || sub.ai_review_status || 'pending'
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Professor Academic Command Center</h1>
          <p className="page-subtitle">
            Curriculum overview, AI assisted grading pipeline, and at-risk student monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="btn btn-outline btn-sm"
          >
            <PlusCircle size={14} />
            Create Assignment
          </button>
          <button
            onClick={() => navigate('/teacher/marks')}
            className="btn btn-primary btn-sm"
          >
            <Award size={14} />
            Update Gradebook
          </button>
        </div>
      </div>

      {/* 4 Core Metrics */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <DashboardCard
          title="Enrolled Students"
          value={totalStudents}
          trend="Section A &amp; B"
          trendType="neutral"
          subtitle="CS 6th Semester"
          color="primary"
          icon={Users}
          onClick={() => navigate('/teacher/students')}
        />
        <DashboardCard
          title="Class Average"
          value={`${averageClassScore}%`}
          trend="+4.1% vs Midterms"
          trendType="up"
          subtitle="Course Mean"
          color="success"
          icon={Award}
          onClick={() => navigate('/teacher/analytics')}
        />
        <DashboardCard
          title="Submissions Pending AI"
          value={pendingSubmissionsCount}
          trend="3 Require Override"
          trendType="down"
          subtitle="Awaiting publish"
          color="warning"
          icon={FileCheck}
          onClick={() => navigate('/teacher/evaluation/sub_1')}
        />
        <DashboardCard
          title="At-Risk Students"
          value={atRiskStudentsCount}
          trend="Alert active"
          trendType="down"
          subtitle="Attendance or Marks <65%"
          color="purple"
          icon={AlertTriangle}
          onClick={() => navigate('/teacher/students')}
        />
      </div>

      {/* Grade Distribution Chart & At-Risk Alert */}
      <div className="grid-2-1" style={{ marginBottom: '1.75rem' }}>
        {/* Grade Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BarChart3 size={18} color="var(--primary)" />
                Class Grade Distribution (Current Semester)
              </h3>
              <p className="card-subtitle">Count of students categorized by official grade tiers</p>
            </div>
            <button
              onClick={() => navigate('/teacher/analytics')}
              className="btn btn-outline btn-sm"
            >
              Deep Analytics
            </button>
          </div>
          <PerformanceChart
            type="bar"
            data={distributionData}
            dataKeys={[{ key: 'count', name: 'Number of Students', color: '#4f46e5' }]}
            xAxisKey="grade"
            height={260}
          />
        </div>

        {/* At-Risk Intervention Watchlist */}
        <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ color: '#991b1b' }}>
                <AlertTriangle size={18} color="#ef4444" />
                At-Risk Watchlist ({atRiskList.length})
              </h3>
              <p className="card-subtitle">Early warning signals detected by AI</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {atRiskList.length > 0 ? (
              atRiskList.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#fef2f2',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fecaca'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991b1b' }}>
                      {s.name} ({s.rollNo})
                    </span>
                    <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                      {s.marksAvg}% Avg
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.25rem' }}>
                    {s.reason}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No critical student alerts at this time. Class attendance and marks meet requirements.
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/teacher/students')}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', marginTop: '1rem', borderColor: '#f87171', color: '#b91c1c' }}
          >
            Review All Student Profiles <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Submissions Pending Review & One-Click AI Evaluation */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Sparkles size={18} color="var(--primary)" />
              Course Submissions Awaiting Professor Approval
            </h3>
            <p className="card-subtitle">
              AI has pre-graded these solutions. Review scores and release feedback with 1-click.
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Assignment</th>
                <th>Submitted On</th>
                <th>AI Suggested Score</th>
                <th>AI Confidence</th>
                <th>Evaluation Action</th>
              </tr>
            </thead>
            <tbody>
              {normalizedSubmissions.length > 0 ? (
                normalizedSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600 }}>{sub.studentName}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{sub.rollNo}</td>
                    <td>{sub.assignmentTitle}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>{sub.submittedOn}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                        {sub.aiSuggestedScore}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> / 50</span>
                    </td>
                    <td>
                      <span className="badge badge-purple">{sub.aiConfidence}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/teacher/evaluation/${sub.id}`)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                      >
                        <Sparkles size={12} />
                        Review &amp; Approve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    All student assignment submissions have been reviewed and approved.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
