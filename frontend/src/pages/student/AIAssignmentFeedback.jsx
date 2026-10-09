import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowLeft,
  Download,
  ExternalLink,
  Bot
} from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AIAssignmentFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAIFeedback(id);
      setFeedback(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch AI feedback report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Generating AI evaluation breakdown and rubric diagnostics..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage
          title="Unable to generate AI Feedback"
          message={error}
          onRetry={fetchFeedback}
          retryText="Regenerate Feedback"
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/student/assignments')}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={14} />
          Back to Assignments
        </button>
      </div>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-purple">
              <Bot size={12} /> AI Evaluation Report
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Evaluated by GPT-4 / Fine-Tuned CodeLLM
            </span>
          </div>
          <h1 className="page-title">{feedback.title}</h1>
          <p className="page-subtitle">Assignment ID: {id} • Student: Alex Morgan (CS2023-048)</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-outline btn-sm"
          >
            <Download size={14} />
            Export AI Audit Report (PDF)
          </button>
        </div>
      </div>

      {/* AI Score Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Cumulative Evaluation Score
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.35rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{feedback.score}</span>
            <span style={{ fontSize: '1.25rem', color: '#cbd5e1' }}>/ {feedback.maxScore}</span>
            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
              Grade: Outstanding (O)
            </span>
          </div>
          <p style={{ color: '#e0e7ff', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '640px' }}>
            {feedback.summary}
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#c7d2fe', textTransform: 'uppercase', fontWeight: 600 }}>
            Percentile Rank
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>Top 3%</div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>+12 pts vs Mean</span>
        </div>
      </div>

      {/* 4 Rubric Breakdown Cards */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
        Detailed Rubric Dimension Scores
      </h3>
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        {feedback.rubricScores.map((rubric, idx) => (
          <div key={idx} className="card">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {rubric.criterion}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.4rem 0' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {rubric.score}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {rubric.max}</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${rubric.percentage}%`,
                  backgroundColor: rubric.percentage >= 90 ? 'var(--success)' : 'var(--primary)'
                }}
              />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {rubric.percentage}% Mastery
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Identified Strengths */}
        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#065f46' }}>
              <CheckCircle2 size={18} color="#10b981" />
              Verified Architectural Strengths
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {feedback.strengths.map((str, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.875rem',
                  color: '#166534'
                }}
              >
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#92400e' }}>
              <AlertCircle size={18} color="#f59e0b" />
              Prescriptive Improvement Opportunities
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {feedback.improvements.map((imp, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  backgroundColor: '#fffbeb',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fde68a',
                  fontSize: '0.875rem',
                  color: '#92400e'
                }}
              >
                <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Readings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <BookOpen size={18} color="var(--primary)" />
            AI Recommended Learning References
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Curated papers and problem sets to reach 100% mastery
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {feedback.suggestedReadings.map((reading, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BookOpen size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{reading.title}</span>
              </div>
              <a
                href={reading.link}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>Read Guide</span>
                <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssignmentFeedback;
