import React from 'react';
import { Sparkles, Clock, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecommendationCard = ({ recommendation, onOpenStudyPlan }) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return <span className="badge badge-danger"><AlertTriangle size={12} /> High Priority</span>;
      case 'High':
        return <span className="badge badge-warning">Recommended</span>;
      default:
        return <span className="badge badge-primary">Growth Booster</span>;
    }
  };

  const handleStudyPlanClick = () => {
    if (onOpenStudyPlan) {
      onOpenStudyPlan(recommendation);
    } else {
      navigate('/student/study-plan');
    }
  };

  return (
    <div
      className="card"
      style={{
        borderLeft: recommendation.priority === 'Critical'
          ? '4px solid var(--danger)'
          : recommendation.priority === 'High'
          ? '4px solid var(--warning)'
          : '4px solid var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {recommendation.subject}
            </span>
          </div>
          {getPriorityBadge(recommendation.priority)}
        </div>

        <h4 style={{ fontSize: '1.025rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
          {recommendation.title}
        </h4>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '1rem' }}>
          {recommendation.description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.785rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={13} /> {recommendation.estimatedHours}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <BookOpen size={13} /> {recommendation.difficulty}
          </span>
        </div>

        <button
          onClick={handleStudyPlanClick}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.785rem', padding: '0.25rem 0.65rem' }}
        >
          Study Plan <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
