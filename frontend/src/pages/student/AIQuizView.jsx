import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, XCircle, Award, Sparkles, RefreshCw, ArrowRight, Plus, X } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AIQuizView = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generate Quiz Modal States
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('Data Structures');
  const [genDifficulty, setGenDifficulty] = useState('Medium');
  const [genNumQuestions, setGenNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentQuizzes();
      setQuizzes(res.data || []);
      if (res.data?.length > 0) {
        loadQuiz(res.data[0].id);
      }
    } catch (err) {
      setError('Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async (quizId) => {
    try {
      setLoading(true);
      setActiveQuiz(quizId);
      setResult(null);
      setAnswers({});
      const res = await api.getQuizDetails(quizId);
      setQuizDetails(res.data);
    } catch (err) {
      setError('Failed to load quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (result) return; // Prevent changing after submission
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;

    setSubmitting(true);
    try {
      const res = await api.submitQuiz(activeQuiz, answers);
      setResult(res.data);
    } catch (err) {
      setError('Quiz submission error. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!genTopic.trim()) return;
    setGenerating(true);
    setGenError('');
    try {
      const res = await api.generateQuiz({
        topic: genTopic.trim(),
        difficulty: genDifficulty,
        num_questions: parseInt(genNumQuestions) || 5
      });
      setShowGenModal(false);
      // Refresh quizzes list and automatically select and load the generated quiz
      const updatedRes = await api.getStudentQuizzes();
      setQuizzes(updatedRes.data || []);
      if (res.data?.quiz_id) {
        await loadQuiz(res.data.quiz_id);
      }
    } catch (err) {
      setGenError(err.response?.data?.detail || 'Failed to generate AI quiz.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !quizDetails) return <LoadingSpinner message="Loading AI Diagnostic Quizzes..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchQuizzes} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Adaptive Quiz &amp; Skill Diagnostics</h1>
          <p className="page-subtitle">Test conceptual understanding, identify weaknesses, and boost examination performance</p>
        </div>

        <button
          onClick={() => { setGenError(''); setShowGenModal(true); }}
          className="btn btn-primary"
          style={{ gap: '0.4rem' }}
        >
          <Sparkles size={16} />
          <span>Generate New AI Quiz</span>
        </button>
      </div>

      <div className="grid-2-1">
        {/* Left: Active Quiz / Questions */}
        <div>
          {quizDetails ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-purple">{quizDetails.topic}</span>
                    <span className="badge badge-neutral">{quizDetails.difficulty} Level</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {quizDetails.title}
                  </h3>
                </div>

                {result && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: result.percentage >= 70 ? 'var(--success)' : 'var(--danger)' }}>
                      {result.score} / {result.total}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {result.percentage}% Score
                    </span>
                  </div>
                )}
              </div>

              {/* Quiz Submission Result Banner */}
              {result && (
                <div
                  style={{
                    backgroundColor: result.percentage >= 70 ? 'var(--success-light)' : 'var(--warning-light)',
                    border: `1px solid ${result.percentage >= 70 ? 'var(--success-border)' : 'var(--warning-border)'}`,
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                    <Award size={22} color={result.percentage >= 70 ? 'var(--success)' : '#d97706'} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: result.percentage >= 70 ? '#065f46' : '#92400e' }}>
                      {result.percentage >= 70 ? 'Great Performance!' : 'Needs Revision on Weak Areas'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: result.percentage >= 70 ? '#047857' : '#b45309', lineHeight: 1.5 }}>
                    {result.percentage >= 70
                      ? 'You demonstrated high cognitive retention for this subject. Review the detailed explanations below to refine tricky nuances.'
                      : 'The AI model detected potential gaps in foundational concepts. Check the weak topic recommendations.'}
                  </p>
                  {result.weak_topics_detected?.length > 0 && (
                    <div style={{ marginTop: '0.65rem' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#92400e' }}>AI Weakness Flags: </strong>
                      <span style={{ fontSize: '0.8rem', color: '#b45309' }}>
                        {result.weak_topics_detected.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {quizDetails.questions?.map((q, qIndex) => {
                    const resultItem = result?.feedback_details?.find(f => f.question_index === qIndex);
                    return (
                      <div
                        key={qIndex}
                        style={{
                          padding: '1.15rem',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: 'var(--radius-md)',
                          border: resultItem
                            ? (resultItem.is_correct ? '1px solid var(--success-border)' : '1px solid var(--danger-border)')
                            : '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.85rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                            Q{qIndex + 1}.
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {q.question}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {q.options?.map((opt, optIndex) => {
                            const isSelected = answers[qIndex] === optIndex;
                            let optBg = '#ffffff';
                            let optBorder = 'var(--border-color)';

                            if (resultItem) {
                              if (optIndex === resultItem.correct_option) {
                                optBg = 'var(--success-light)';
                                optBorder = 'var(--success-border)';
                              } else if (isSelected && !resultItem.is_correct) {
                                optBg = 'var(--danger-light)';
                                optBorder = 'var(--danger-border)';
                              }
                            } else if (isSelected) {
                              optBg = 'var(--primary-light)';
                              optBorder = 'var(--primary-border)';
                            }

                            return (
                              <label
                                key={optIndex}
                                onClick={() => handleSelectOption(qIndex, optIndex)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  padding: '0.65rem 0.85rem',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: optBg,
                                  border: `1px solid ${optBorder}`,
                                  cursor: result ? 'default' : 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`question_${qIndex}`}
                                  checked={isSelected}
                                  onChange={() => handleSelectOption(qIndex, optIndex)}
                                  disabled={Boolean(result)}
                                />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Explanation after submit */}
                        {resultItem && (
                          <div
                            style={{
                              marginTop: '0.85rem',
                              padding: '0.75rem',
                              backgroundColor: '#ffffff',
                              borderRadius: 'var(--radius-sm)',
                              borderLeft: `3px solid ${resultItem.is_correct ? 'var(--success)' : 'var(--danger)'}`,
                              fontSize: '0.8rem',
                              color: 'var(--text-muted)'
                            }}
                          >
                            <strong>Explanation:</strong> {resultItem.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!result && (
                  <button
                    type="submit"
                    disabled={submitting || Object.keys(answers).length < (quizDetails.questions?.length || 0)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1.5rem', gap: '0.5rem' }}
                  >
                    {submitting ? (
                      <LoadingSpinner message="Scoring Quiz with AI Engine..." size={18} centered={false} />
                    ) : (
                      <>
                        <span>Submit Assessment for AI Evaluation</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          ) : (
            <div className="card">Select a quiz from the list to begin.</div>
          )}
        </div>

        {/* Right: Available Quizzes List */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <Sparkles size={16} color="var(--primary)" />
                <span>Available Quizzes ({quizzes.length})</span>
              </h4>
              <button
                onClick={() => { setGenError(''); setShowGenModal(true); }}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', gap: '0.25rem' }}
              >
                <Plus size={13} />
                <span>New</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {quizzes.map(q => (
                <div
                  key={q.id}
                  onClick={() => loadQuiz(q.id)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: activeQuiz === q.id ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{q.difficulty}</span>
                    {q.is_completed && <span className="badge badge-success">Completed: {q.score}pts</span>}
                  </div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {q.title}
                  </h5>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {q.total_questions || 5} Questions • {q.topic}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Generate AI Diagnostic Quiz */}
      {showGenModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Generate AI Diagnostic Quiz</h3>
              </div>
              <button onClick={() => setShowGenModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>

            <form onSubmit={handleGenerateQuiz}>
              <div className="modal-body">
                {genError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {genError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Subject / Topic Area</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Data Structures, SQL, OS Scheduling, Python"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
                    {['Data Structures', 'Database Systems', 'Algorithms', 'Computer Networks', 'Operating Systems'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setGenTopic(t)}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: genTopic === t ? 'var(--primary-light)' : '#f8fafc',
                          color: genTopic === t ? 'var(--primary)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Diagnostic Difficulty Level</label>
                  <select
                    className="form-select"
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy (Foundational Recall &amp; Syntax)</option>
                    <option value="Medium">Medium (Application &amp; Analysis)</option>
                    <option value="Hard">Hard (Edge Cases &amp; Algorithmic Rigor)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Questions</label>
                  <select
                    className="form-select"
                    value={genNumQuestions}
                    onChange={(e) => setGenNumQuestions(Number(e.target.value))}
                  >
                    <option value={5}>5 Questions (Rapid 5-Min Diagnostic)</option>
                    <option value={10}>10 Questions (Comprehensive Assessment)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowGenModal(false)} className="btn btn-secondary" disabled={generating}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={generating || !genTopic.trim()} style={{ gap: '0.4rem' }}>
                  {generating ? (
                    <LoadingSpinner message="Generating with AI..." size={16} centered={false} />
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate &amp; Start Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuizView;
