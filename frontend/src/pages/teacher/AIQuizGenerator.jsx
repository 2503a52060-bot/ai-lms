import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, BookOpen, CheckCircle2, Award, Clock } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AIQuizGenerator = () => {
  const [topic, setTopic] = useState('Dynamic Programming & Tree Algorithms');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [questionBank, setQuestionBank] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.getFacultyQuizzes();
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.quizzes) ? res.data.quizzes : [];
      setQuestionBank(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.generateAIQuiz({
        topic,
        difficulty,
        num_questions: parseInt(numQuestions)
      });
      setGeneratedQuiz(res.data);
      setMessage(`AI Quiz generated successfully with ${res.data.questions?.length || 5} questions!`);
      fetchQuizzes();
    } catch (err) {
      alert('Could not generate quiz. Fallback questions active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="ai-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="ai-pill">Faculty Assessment Suite</span>
            <span style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>LLM Item Generation</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>AI Quiz Generator &amp; Question Bank</h1>
          <p style={{ fontSize: '0.9rem', color: '#e0e7ff', marginTop: '0.2rem' }}>
            Instantly formulate rigorous multiple-choice assessments with automatic distractor generation and pedagogical explanations.
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="grid-2-1">
        {/* Left: Generator Form & Newly Generated Questions */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <span>Configure AI Quiz Parameters</span>
            </h3>

            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Syllabus Topic / Concept Domain</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. B+ Tree Indexing & ACID Isolation"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Difficulty Tier</label>
                  <select
                    className="form-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy (Foundational Recall)</option>
                    <option value="Medium">Medium (Application &amp; Analysis)</option>
                    <option value="Hard">Hard (Edge-Cases &amp; Proofs)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Number of Items</label>
                  <select
                    className="form-select"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                  >
                    <option value="3">3 Questions</option>
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', gap: '0.5rem' }}
              >
                {loading ? (
                  <LoadingSpinner message="Generating Questions with AI Engine..." size={18} centered={false} />
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate AI Quiz &amp; Publish to Bank</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Questions Preview */}
          {generatedQuiz && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <span className="badge badge-purple">{generatedQuiz.title}</span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.35rem' }}>
                    Generated Assessment Items ({generatedQuiz.questions?.length})
                  </h4>
                </div>
                <span className="badge badge-success">Saved to Question Bank</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {generatedQuiz.questions?.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.65rem' }}>
                      Q{idx + 1}. {q.question}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.65rem' }}>
                      {q.options?.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#ffffff',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.8rem',
                            color: 'var(--text-main)'
                          }}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.45rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Assessment Key</span>
                      <span style={{ marginLeft: '0.5rem' }}>Correct answers stored securely in question bank for automated grading and evaluation only.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Question Bank List */}
        <div>
          <div className="card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              Institutional Question Bank
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(Array.isArray(questionBank) ? questionBank : []).map(qb => (
                <div
                  key={qb.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{qb.difficulty}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{qb.questions_count} Items</span>
                  </div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{qb.title}</h5>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Topic: {qb.topic} • Created {qb.created_at}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuizGenerator;
