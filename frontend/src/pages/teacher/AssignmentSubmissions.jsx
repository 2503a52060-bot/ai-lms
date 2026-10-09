import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Clock, Search } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AssignmentSubmissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await api.getAssignmentSubmissions(id);
        setSubmissions(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Retrieving batch submissions and AI confidence scores..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage title="Submissions Unavailable" message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const subList = Array.isArray(submissions)
    ? submissions
    : Array.isArray(submissions?.submissions)
    ? submissions.submissions
    : [];

  const filtered = subList.filter((s) => {
    const name = (s.studentName || s.student_name || '').toLowerCase();
    const roll = (s.rollNo || s.student_identifier || '').toLowerCase();
    return name.includes(search.toLowerCase()) || roll.includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/teacher/assignments')}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={14} />
          Back to Assignment Management
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Coursework Submissions: Batch Review</h1>
          <p className="page-subtitle">
            Submissions for Assignment ID: {id} • AI-Assisted Auto Grading Engine
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Assignment Title</th>
                <th>Submitted On</th>
                <th>AI Suggested Score</th>
                <th>Confidence Level</th>
                <th>Current Status</th>
                <th>Grading Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                    {sub.rollNo}
                  </td>
                  <td style={{ fontWeight: 600 }}>{sub.studentName}</td>
                  <td>{sub.assignmentTitle}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{sub.submittedOn}</td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                      {sub.aiSuggestedScore}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / 50</span>
                  </td>
                  <td>
                    <span className="badge badge-purple">{sub.aiConfidence}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        sub.status.includes('Intervention') ? 'badge-danger' : 'badge-warning'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/teacher/evaluation/${sub.id}`)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Sparkles size={12} />
                      AI Evaluation
                    </button>
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

export default AssignmentSubmissions;
