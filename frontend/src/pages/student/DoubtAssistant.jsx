import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, CheckCircle, HelpCircle, Lightbulb } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoubtAssistant = () => {
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDoubt, setActiveDoubt] = useState(null);
  const [history, setHistory] = useState([
    {
      id: 1,
      topic: 'Data Structures & Algorithms',
      question: 'How do I choose between memoization and tabulation in Dynamic Programming?',
      answer: `### Dynamic Programming: Memoization vs Tabulation\n\n- **Memoization (Top-Down):** Recursively solve subproblems starting from the original state and store answers in a hash map or cache. Best when you only visit a subset of possible subproblems.\n- **Tabulation (Bottom-Up):** Iteratively fill an array from base cases up to the goal. Avoids call stack overflow overhead and makes space optimization (e.g. O(1) state variables) easier to identify.\n\n💡 **Rule of Thumb:** Use Tabulation if all states must be computed; use Memoization if state transitions are sparse.`,
      time: 'Earlier today'
    }
  ]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const res = await api.askDoubt({ question, topic });
      const newDoubt = {
        id: Date.now(),
        topic,
        question,
        answer: res.data?.answer || "Explanation processed successfully.",
        time: 'Just now'
      };
      setActiveDoubt(newDoubt);
      setHistory([newDoubt, ...history]);
      setQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Explain the difference between clustered and non-clustered B+ Tree indexes.",
    "Why does vanishing gradient occur with Sigmoid activations?",
    "When should I use Dijkstra algorithm instead of Bellman-Ford?"
  ];

  return (
    <div className="page-container">
      <div className="ai-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="ai-pill">24/7 AI Academic Tutor</span>
            <span style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>Context-Aware Learning</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>AI Doubt Assistant</h1>
          <p style={{ fontSize: '0.9rem', color: '#e0e7ff', marginTop: '0.2rem' }}>
            Ask detailed questions on concepts, algorithm analysis, mathematical proofs, or homework topics.
          </p>
        </div>
      </div>

      <div className="grid-2-1">
        {/* Left: Question Form & Current Answer */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <form onSubmit={handleAsk}>
              <div className="form-group">
                <label className="form-label">Subject / Topic Domain</label>
                <select
                  className="form-select"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="Data Structures & Algorithms">Data Structures &amp; Algorithms</option>
                  <option value="Database Systems Architecture">Database Systems Architecture</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence &amp; ML</option>
                  <option value="Cloud Computing & Distributed Systems">Cloud Computing &amp; Distributed Systems</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Doubt or Conceptual Question</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g., Explain why B+ Tree is preferred over Binary Search Tree for disk storage..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              {/* Sample Quick Questions */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Suggested Prompts:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {sampleQuestions.map((sq, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuestion(sq)}
                      style={{
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      • {sq}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', gap: '0.5rem' }}
              >
                {loading ? (
                  <LoadingSpinner message="Consulting AI Academic Model..." size={18} centered={false} />
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Ask AI Tutor</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active / Latest Answer */}
          {(activeDoubt || history[0]) && (
            <div className="card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-purple">AI Explanation</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {(activeDoubt || history[0]).topic}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
                Q: {(activeDoubt || history[0]).question}
              </h3>
              <div
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-main)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {(activeDoubt || history[0]).answer}
              </div>
            </div>
          )}
        </div>

        {/* Right: History & Learning Tips */}
        <div>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lightbulb size={18} color="#f59e0b" />
              <span>Effective Study Tips</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <p>• Trace algorithms on small edge-case inputs before writing code.</p>
              <p>• Review weakness alerts from your latest examination in the AI Study Plan tab.</p>
              <p>• Test your mastery by taking the 5-question AI Quiz afterwards.</p>
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Recent Doubts History
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveDoubt(item)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: activeDoubt?.id === item.id ? 'var(--primary-light)' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {item.question.length > 55 ? `${item.question.slice(0, 55)}...` : item.question}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.topic} • {item.time}
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

export default DoubtAssistant;
