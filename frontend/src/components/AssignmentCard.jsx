import React from 'react';
import { Calendar, Award, FileText, CheckCircle2, Clock, Sparkles, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssignmentCard = ({ assignment, userRole = 'student' }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Graded':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Graded</span>;
      case 'Submitted':
        return <span className="badge badge-info"><Clock size={12} /> Under Review</span>;
      default:
        return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
    }
  };

  const getDifficultyBadge = (difficulty) => {
    if (difficulty === 'Hard') return <span className="badge badge-danger">Hard</span>;
    if (difficulty === 'Medium') return <span className="badge badge-warning">Medium</span>;
    return <span className="badge badge-neutral">Easy</span>;
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {assignment.subject || assignment.course_title} ({assignment.code || assignment.course_code})
            </span>
            <h3
              onClick={() => navigate(`/student/assignments/${assignment.id}/submit`)}
              style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--text-main)', cursor: 'pointer' }}
              title="Click to view assignment & submission options"
            >
              {assignment.title}
            </h3>
          </div>
          <div>{getStatusBadge(assignment.status)}</div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '1rem' }}>
          {assignment.description}
        </p>

        {assignment.attachment_path && (
          <div style={{ marginBottom: '0.85rem' }}>
            <a
              href={assignment.attachment_path.startsWith('http') ? assignment.attachment_path : `http://localhost:8000${assignment.attachment_path}`}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={13} />
              <span>Question File: {assignment.attachment_name || 'Download'}</span>
            </a>
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} />
            <span>Due: {assignment.dueDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={14} />
            <span>Max: {assignment.maxMarks} pts</span>
          </div>
          <div>{getDifficultyBadge(assignment.difficulty)}</div>
        </div>

        {/* Action Buttons depending on status */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {assignment.status === 'Pending' && (
            <button
              onClick={() => navigate(`/student/assignments/${assignment.id}/submit`)}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              <FileText size={14} />
              Upload File / Submit Assignment
            </button>
          )}

          {assignment.status === 'Graded' && (
            <button
              onClick={() => navigate(`/student/assignments/${assignment.id}/feedback`)}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <Sparkles size={14} color="var(--primary)" />
              View AI Feedback ({assignment.grade}/{assignment.maxMarks})
            </button>
          )}

          {assignment.status === 'Submitted' && (
            <button
              onClick={() => navigate(`/student/assignments/${assignment.id}/submit`)}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              <FileText size={14} />
              View / Replace Submission
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
