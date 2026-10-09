import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  BrainCircuit,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Award,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import PerformanceChart from '../../components/PerformanceChart';
import RecommendationCard from '../../components/RecommendationCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DashboardCard from '../../components/DashboardCard';
import { useNavigate, useLocation } from 'react-router-dom';

const defaultImprovementMetrics = {
  percentageGain: 12.5,
  percentileRank: 'Top 10%',
  studyHoursLogged: 45,
  problemSetsSolved: 80
};

const defaultSubjectMarks = [
  { subject: 'DSA', marks: 88, average: 74 },
  { subject: 'ML', marks: 92, average: 76 },
  { subject: 'DBMS', marks: 85, average: 78 },
  { subject: 'OS', marks: 79, average: 72 },
  { subject: 'CN', marks: 72, average: 70 },
  { subject: 'TOC', marks: 81, average: 68 }
];

const defaultSkillRadar = [
  { subject: 'DSA', student: 90, benchmark: 75 },
  { subject: 'ML', student: 92, benchmark: 78 },
  { subject: 'DBMS', student: 86, benchmark: 80 },
  { subject: 'OS', student: 80, benchmark: 74 },
  { subject: 'CN', student: 72, benchmark: 70 },
  { subject: 'TOC', student: 82, benchmark: 72 }
];

const defaultStrongTopics = [
  { name: 'Binary Search Trees & AVL', subject: 'DSA', mastery: '94%', tag: 'Advanced' },
  { name: 'Convolutional Neural Networks', subject: 'ML', mastery: '91%', tag: 'Intermediate' },
  { name: 'B-Tree Indexing & Normalization', subject: 'DBMS', mastery: '88%', tag: 'Advanced' }
];

const defaultWeakTopics = [
  { name: 'Subnetting & CIDR Addressing', subject: 'CN', mastery: '58%', tag: 'Needs Attention', urgency: 'High' },
  { name: 'Deadlock Detection Algorithms', subject: 'OS', mastery: '64%', tag: 'Moderate Priority', urgency: 'Medium' },
  { name: 'Turing Reducibility & Halting', subject: 'TOC', mastery: '62%', tag: 'Needs Review', urgency: 'High' }
];

const defaultTopicMarks = [
  { topic: 'Dynamic Programming & Memoization', subject: 'DSA', score: 92, status: 'Strong' },
  { topic: 'Graph Search & Dijkstra', subject: 'DSA', score: 88, status: 'Strong' },
  { topic: 'Supervised Learning & Regression', subject: 'ML', score: 94, status: 'Strong' },
  { topic: 'Backpropagation & Gradient Descent', subject: 'ML', score: 86, status: 'Strong' },
  { topic: 'SQL Query Optimization & Indexes', subject: 'DBMS', score: 84, status: 'Moderate' },
  { topic: 'Transaction ACID Properties & 2PL', subject: 'DBMS', score: 80, status: 'Moderate' },
  { topic: 'Virtual Memory & Page Replacement', subject: 'OS', score: 76, status: 'Moderate' },
  { topic: 'Process Synchronization & Mutexes', subject: 'OS', score: 72, status: 'Moderate' },
  { topic: 'TCP/IP Flow Control & Handshake', subject: 'CN', score: 70, status: 'Moderate' },
  { topic: 'Subnet Masking & Variable Length', subject: 'CN', score: 58, status: 'Weak' },
  { topic: 'Context-Free Grammars & Pushdown', subject: 'TOC', score: 78, status: 'Moderate' },
  { topic: 'Halting Problem & Decidability', subject: 'TOC', score: 62, status: 'Weak' }
];

const PerformanceAnalytics = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // GPA & Trajectory Simulator State
  const [simAttendance, setSimAttendance] = useState(94);
  const [simExamScore, setSimExamScore] = useState(88);
  const [simDrills, setSimDrills] = useState(15);
  const [showSimulator, setShowSimulator] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getPerformanceAnalytics();
      setAnalytics(response.data || {});
    } catch (err) {
      console.warn('Could not retrieve live analytics, using baseline metrics:', err.message);
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating subject and topic mastery distribution..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage
          title="Performance Analytics Unavailable"
          message={error}
          onRetry={fetchAnalytics}
          retryText="Recalculate Analytics"
        />
      </div>
    );
  }

  // Safe fallback resolution
  const improvementMetrics = {
    ...defaultImprovementMetrics,
    ...(analytics?.improvementMetrics || {})
  };

  const subjectMarks = Array.isArray(analytics?.subjectMarks) && analytics.subjectMarks.length > 0
    ? analytics.subjectMarks
    : defaultSubjectMarks;

  const skillRadar = Array.isArray(analytics?.skillRadar) && analytics.skillRadar.length > 0
    ? analytics.skillRadar
    : defaultSkillRadar;

  const strongTopics = Array.isArray(analytics?.strongTopics) && analytics.strongTopics.length > 0
    ? analytics.strongTopics
    : defaultStrongTopics;

  const weakTopics = Array.isArray(analytics?.weakTopics) && analytics.weakTopics.length > 0
    ? analytics.weakTopics
    : defaultWeakTopics;

  const topicMarks = Array.isArray(analytics?.topicMarks) && analytics.topicMarks.length > 0
    ? analytics.topicMarks
    : defaultTopicMarks;

  // Filter topics if a specific subject is selected
  const filteredTopics = selectedSubjectFilter === 'All'
    ? topicMarks
    : topicMarks.filter(t => t.subject === selectedSubjectFilter);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cognitive &amp; Performance Analytics</h1>
          <p className="page-subtitle">
            Fine-grained topic mastery, subject benchmarks, predictive trendlines, and AI diagnostic recommendations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Filter by Subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Subjects</option>
              <option value="DSA">DSA</option>
              <option value="ML">ML</option>
              <option value="DBMS">DBMS</option>
              <option value="OS">OS</option>
              <option value="CN">Computer Networks</option>
              <option value="TOC">Theory of Comp.</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Summary Cards: Improvement %, Percentile, Hours Logged, Problems Solved */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <DashboardCard
          title="Improvement Percentage"
          value={`+${improvementMetrics.percentageGain ?? 12.5}%`}
          trend="Over previous semester"
          trendType="up"
          subtitle="Continuous upward velocity"
          color="success"
          icon={TrendingUp}
        />
        <DashboardCard
          title="Cohort Percentile"
          value={improvementMetrics.percentileRank ?? 'Top 10%'}
          trend="Rank #4 in Batch of 64"
          trendType="up"
          subtitle="Computer Science Dept."
          color="primary"
          icon={Award}
        />
        <DashboardCard
          title="Deep Study Hours"
          value={`${improvementMetrics.studyHoursLogged ?? 45} hrs`}
          trend="+12 hrs this month"
          trendType="up"
          subtitle="Logged on LMS modules"
          color="info"
          icon={Clock}
        />
        <DashboardCard
          title="Problems &amp; Drills"
          value={improvementMetrics.problemSetsSolved ?? 80}
          trend="88% First-Attempt Accuracy"
          trendType="up"
          subtitle="Coding &amp; Theory questions"
          color="purple"
          icon={Target}
        />
      </div>

      {/* Charts Section: Subject-wise Marks Comparison & Multi-dimensional Skill Radar */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Subject-wise Marks Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BarChart3 size={18} color="var(--primary)" />
                Subject-wise Marks vs. Cohort Average
              </h3>
              <p className="card-subtitle">Your score compared against class mean across curriculum</p>
            </div>
          </div>
          <PerformanceChart
            type="bar"
            data={subjectMarks}
            dataKeys={[
              { key: 'marks', name: 'My Marks (%)', color: '#4f46e5' },
              { key: 'average', name: 'Class Average (%)', color: '#94a3b8' }
            ]}
            xAxisKey="subject"
            height={280}
          />
        </div>

        {/* Skill Radar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BrainCircuit size={18} color="#8b5cf6" />
                Cognitive Skill Dimension Radar
              </h3>
              <p className="card-subtitle">Algorithmic, systemic, and theoretical competency evaluation</p>
            </div>
          </div>
          <PerformanceChart
            type="radar"
            data={skillRadar}
            dataKeys={[
              { key: 'student', name: 'My Competency', color: '#6366f1' },
              { key: 'benchmark', name: 'Target Benchmark', color: '#10b981' }
            ]}
            radarPolarKey="subject"
            height={280}
          />
        </div>
      </div>

      {/* Strong Topics vs Weak Topics Breakdown */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Strong Topics */}
        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ color: '#065f46' }}>
                <CheckCircle size={18} color="#10b981" />
                Strong Topics (Mastery &gt; 85%)
              </h3>
              <p className="card-subtitle">Verified high comprehension and low error rate in exams</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {strongTopics.map((topic, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.85rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                    {topic.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.2rem' }}>
                    Subject: {topic.subject} • Level: {topic.tag}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}>
                    {topic.mastery}
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Dominant</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ color: '#991b1b' }}>
                <AlertCircle size={18} color="#ef4444" />
                Weak Topics (Targeted Intervention Needed)
              </h3>
              <p className="card-subtitle">Topics with recurring quiz mistakes and low concept retention</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {weakTopics.map((topic, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.85rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.9rem' }}>
                    {topic.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.2rem' }}>
                    Subject: {topic.subject} • Priority: {topic.urgency}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#dc2626' }}>
                    {topic.mastery}
                  </div>
                  <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>{topic.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Topic-wise Marks Table */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Target size={18} color="var(--primary)" />
              Granular Topic-Wise Marks &amp; Progress Bar
            </h3>
            <p className="card-subtitle">
              Interactive breakdown of competencies within {selectedSubjectFilter === 'All' ? 'all courses' : selectedSubjectFilter}
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Topic Name</th>
                <th>Subject</th>
                <th>Diagnostic Score</th>
                <th>Proficiency Status</th>
                <th style={{ width: '30%' }}>Progress Visualizer</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((t, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{t.topic}</td>
                  <td>
                    <span className="badge badge-neutral">{t.subject}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t.score}%</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        t.status === 'Strong' ? 'badge-success' : t.status === 'Moderate' ? 'badge-info' : 'badge-danger'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${t.score}%`,
                          backgroundColor:
                            t.score >= 85 ? 'var(--success)' : t.score >= 70 ? 'var(--secondary)' : 'var(--danger)'
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Prescriptive Recommendations for Improvement */}
      <div>
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h3 className="card-title">
              <Sparkles size={18} color="var(--primary)" />
              AI Prescriptive Recommendations for Next Grade Jump
            </h3>
            <p className="card-subtitle">
              Algorithms computed 3 high-impact intervention pathways to boost your overall CGPA from 8.72 to 9.20+
            </p>
          </div>
        </div>

        <div className="grid-3">
          <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="badge badge-danger">Impact: +0.28 CGPA</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4 hrs estimated</span>
            </div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Turing Machine Reductions Drill</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Solve 8 step-by-step halting problem proofs. AI tutor provides immediate verification on state diagrams.
            </p>
            <button
              onClick={() => navigate('/student/recommendations#drill')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              Start Targeted Drill
            </button>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="badge badge-warning">Impact: +0.18 CGPA</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3 hrs estimated</span>
            </div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>CIDR &amp; Subnet Arithmetic Workshop</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Interactive subnet mask calculator drills to eliminate calculation oversights in Computer Networks.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('gpa-simulator-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              Launch Simulator
            </button>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">Capstone Ready</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optional</span>
            </div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Neural Architecture Search (NAS)</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Expand your already dominant Machine Learning mastery with advanced gradient-based hyperparameter tuning.
            </p>
            <button
              onClick={() => navigate('/student/courses')}
              className="btn btn-outline btn-sm"
              style={{ width: '100%' }}
            >
              Read Paper Notes
            </button>
          </div>
        </div>

        {/* Real Interactive GPA Predictive Simulator */}
        <div id="gpa-simulator-section" className="card" style={{ marginTop: '2rem', border: '1px solid var(--primary-border)', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
          <div className="card-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-purple">Realtime Predictive AI Engine</span>
              </div>
              <h3 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Interactive GPA &amp; Academic Trajectory Simulator
              </h3>
              <p className="card-subtitle">
                Adjust your simulated attendance, exam target, and drill consistency to forecast your semester outcome.
              </p>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '2rem', alignItems: 'center' }}>
            {/* Left: Interactive Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Target Attendance Rate</label>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{simAttendance}%</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="100"
                  value={simAttendance}
                  onChange={(e) => setSimAttendance(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required: 75% | Safe Threshold: 85%</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Target Exam Score Average</label>
                  <span style={{ fontWeight: 800, color: 'var(--success)' }}>{simExamScore}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={simExamScore}
                  onChange={(e) => setSimExamScore(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Internal + Midterm + Final weightage</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Practice Drills &amp; Quizzes Solved</label>
                  <span style={{ fontWeight: 800, color: '#7c3aed' }}>{simDrills} Solved</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={simDrills}
                  onChange={(e) => setSimDrills(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Higher drill volume reinforces weak-topic retention</span>
              </div>
            </div>

            {/* Right: Realtime Forecast Output */}
            {(() => {
              const simulatedSGPA = Math.min(10, Math.max(6.0, (simAttendance * 0.15 + simExamScore * 0.75 + Math.min(10, simDrills) * 1.0) / 10)).toFixed(2);
              const baselineSGPA = 8.72;
              const boost = (simulatedSGPA - baselineSGPA).toFixed(2);
              const isBoostPositive = Number(boost) >= 0;

              return (
                <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Projected Semester SGPA
                  </span>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#15803d', margin: '0.5rem 0' }}>
                    {simulatedSGPA}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-full)', border: '1px solid #86efac', fontWeight: 700, fontSize: '0.85rem', color: isBoostPositive ? '#166534' : '#b91c1c' }}>
                    <span>{isBoostPositive ? `+${boost}` : boost} CGPA vs Current Baseline</span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#166534', marginTop: '1rem', lineHeight: 1.5 }}>
                    {Number(simulatedSGPA) >= 9.0
                      ? ' Outstanding Trajectory: You are on track for Dean\'s List with Distinction honours.'
                      : Number(simulatedSGPA) >= 8.0
                      ? ' Strong Trajectory: Maintaining this consistency safely keeps you in the top tier.'
                      : ' Action Recommended: Complete more remediation drills to improve exam weightage.'}
                  </p>
                  <button
                    onClick={() => navigate('/student/recommendations#drill')}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '0.75rem' }}
                  >
                    Start Drill to Reach This Goal
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
