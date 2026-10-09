import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, Award, Users, ArrowRight, CheckCircle2, Sparkles, Upload, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AssignmentManagement = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedAsgToExtend, setSelectedAsgToExtend] = useState(null);
  const [extendedDueDate, setExtendedDueDate] = useState('');
  const [extendingLoading, setExtendingLoading] = useState(false);

  // New assignment form state
  const [newAsg, setNewAsg] = useState({
    title: '',
    course_id: '',
    subject: '',
    code: '',
    dueDate: '2026-04-10',
    maxMarks: 100,
    difficulty: 'Medium',
    description: '',
    rubricCorrectness: 40,
    rubricOptimization: 30,
    rubricStyle: 30
  });

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [asgRes, coursesRes] = await Promise.all([
        api.getTeacherAssignments(),
        api.getAllCourses()
      ]);
      const list = Array.isArray(asgRes.data) ? asgRes.data : Array.isArray(asgRes.data?.assignments) ? asgRes.data.assignments : [];
      setAssignments(list);

      const courseList = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      setCourses(courseList);
      if (courseList.length > 0) {
        setNewAsg((prev) => ({
          ...prev,
          course_id: prev.course_id || courseList[0].id,
          subject: prev.subject || courseList[0].title,
          code: prev.code || courseList[0].code
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesRes = await api.getAllCourses();
      const courseList = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      setCourses(courseList);
      if (courseList.length > 0) {
        setNewAsg((prev) => {
          const exists = courseList.some((c) => String(c.id) === String(prev.course_id));
          if (!exists || !prev.course_id) {
            return {
              ...prev,
              course_id: courseList[0].id,
              subject: courseList[0].title,
              code: courseList[0].code
            };
          }
          return prev;
        });
      }
    } catch (e) {
      console.error('Error fetching LMS courses:', e);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetchCourses();
    }
  }, [showCreateModal]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const selectedCourseId = newAsg.course_id || (courses[0]?.id || null);
      const selectedCourse = courses.find((c) =>
        String(c.id) === String(selectedCourseId) ||
        c.code?.toLowerCase() === String(newAsg.subject || '').toLowerCase() ||
        c.title?.toLowerCase() === String(newAsg.subject || '').toLowerCase()
      ) || courses[0];

      const formData = new FormData();
      formData.append('course_id', selectedCourse?.id || selectedCourseId);
      formData.append('title', newAsg.title.trim());
      formData.append('description', newAsg.description || '');
      formData.append('subject', selectedCourse ? selectedCourse.title : newAsg.subject);
      formData.append('code', selectedCourse ? selectedCourse.code : newAsg.code);
      formData.append('due_date', newAsg.dueDate);
      formData.append('dueDate', newAsg.dueDate);
      formData.append('max_marks', newAsg.maxMarks);
      formData.append('maxMarks', newAsg.maxMarks);
      if (assignmentFile) {
        formData.append('file', assignmentFile);
      }

      await api.createAssignment(formData);
      setShowCreateModal(false);
      setAssignmentFile(null);
      setNewAsg({
        title: '',
        course_id: courses[0]?.id || '',
        subject: courses[0]?.title || '',
        code: courses[0]?.code || '',
        dueDate: '2026-04-10',
        maxMarks: 100,
        difficulty: 'Medium',
        description: '',
        rubricCorrectness: 40,
        rubricOptimization: 30,
        rubricStyle: 30
      });
      fetchAssignments();
      alert('New assignment created with active AI auto-grading rubric!');
    } catch (err) {
      alert('Error creating assignment: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleOpenExtendModal = (asg = null) => {
    if (asg) {
      setSelectedAsgToExtend(asg);
      const rawDate = asg.dueDate || asg.due_date || '';
      setExtendedDueDate(rawDate.includes('T') ? rawDate.split('T')[0] : rawDate);
    } else if (assignments.length > 0) {
      setSelectedAsgToExtend(assignments[0]);
      const rawDate = assignments[0].dueDate || assignments[0].due_date || '';
      setExtendedDueDate(rawDate.includes('T') ? rawDate.split('T')[0] : rawDate);
    }
    setShowExtendModal(true);
  };

  const handleSaveExtendedDeadline = async (e) => {
    e.preventDefault();
    if (!selectedAsgToExtend || !extendedDueDate) {
      alert('Please select an assignment and enter a new submission deadline.');
      return;
    }

    setExtendingLoading(true);
    try {
      await api.extendAssignmentDeadline(selectedAsgToExtend.id, {
        due_date: extendedDueDate,
        dueDate: extendedDueDate
      });
      setShowExtendModal(false);
      await fetchAssignments();
      alert('Assignment submission deadline updated successfully!');
    } catch (err) {
      alert('Failed to extend submission deadline: ' + (err.response?.data?.detail || err.message));
    } finally {
      setExtendingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching professor assignments and rubric configurations..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage title="Assignments Unavailable" message={error} onRetry={fetchAssignments} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignment &amp; Rubric Management</h1>
          <p className="page-subtitle">
            Configure coursework assignments, define multi-axial grading rubrics, and view submission batches
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {assignments.length > 0 && (
            <button
              onClick={() => handleOpenExtendModal()}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Calendar size={14} color="var(--primary)" />
              <span>Extend Submission Date</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchCourses();
              setShowCreateModal(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} />
            <span>Create New Assignment</span>
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {(Array.isArray(assignments) ? assignments : []).length > 0 ? (
          assignments.map((asg) => (
            <div key={asg.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {asg.code} • {asg.subject}
                  </span>
                  <span className="badge badge-primary">{asg.difficulty}</span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  {asg.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem' }}>
                  {asg.description}
                </p>

                {asg.attachment_path && (
                  <div style={{ marginBottom: '0.85rem' }}>
                    <a
                      href={asg.attachment_path.startsWith('http') ? asg.attachment_path : `http://localhost:8000${asg.attachment_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      <Download size={13} />
                      <span>{asg.attachment_name || 'Question File'}</span>
                    </a>
                  </div>
                )}
              </div>

              <div>
                <div style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} color="var(--primary)" />
                    <span>Due: <strong>{asg.dueDate}</strong></span>
                  </span>
                  <span>Max: {asg.maxMarks} Pts</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenExtendModal(asg)}
                    className="btn btn-outline btn-sm"
                    title="Extend submission deadline for this assignment"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', borderColor: '#cbd5e1' }}
                  >
                    <Calendar size={13} color="var(--primary)" />
                    <span>Extend Date</span>
                  </button>

                  <button
                    onClick={() => navigate(`/teacher/assignments/${asg.id}/submissions`)}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Users size={13} />
                    <span>Submissions</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No assignments found. Click &quot;Create New Assignment&quot; to configure your first coursework assignment.
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Create New Course Assignment</h3>
              <button onClick={() => { setShowCreateModal(false); setAssignmentFile(null); }} className="btn-icon">✕</button>
            </div>

            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Assignment Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. A* Pathfinding and Heuristic Optimizations"
                    value={newAsg.title}
                    onChange={(e) => setNewAsg({ ...newAsg, title: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-select"
                      value={newAsg.course_id || ''}
                      onFocus={fetchCourses}
                      onClick={fetchCourses}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedCourse = courses.find((c) =>
                          String(c.id) === String(val) ||
                          c.code?.toLowerCase() === String(val).toLowerCase() ||
                          c.title?.toLowerCase() === String(val).toLowerCase()
                        );
                        setNewAsg({
                          ...newAsg,
                          course_id: selectedCourse ? selectedCourse.id : (Number(val) || val),
                          subject: selectedCourse ? selectedCourse.title : val,
                          code: selectedCourse ? selectedCourse.code : ''
                        });
                      }}
                      required
                    >
                      {courses.length === 0 ? (
                        <option value="">No courses available</option>
                      ) : (
                        courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code ? `${c.code}: ` : ''}{c.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Submission Deadline</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={newAsg.dueDate}
                      onChange={(e) => setNewAsg({ ...newAsg, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Description &amp; Problem Statement</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    required
                    placeholder="Detail the technical specifications, requirements, and allowed languages..."
                    value={newAsg.description}
                    onChange={(e) => setNewAsg({ ...newAsg, description: e.target.value })}
                  />
                </div>

                {/* Upload Assignment / Question File */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Upload size={14} color="var(--primary)" />
                    <span>Upload Assignment / Question File</span>
                  </label>
                  <input
                    type="file"
                    className="form-input"
                    accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg"
                    onChange={(e) => setAssignmentFile(e.target.files[0] || null)}
                  />
                  {assignmentFile ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={13} color="var(--success)" />
                      <span>Selected File: <strong>{assignmentFile.name}</strong> ({(assignmentFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      Attach prompt sheets, problem statements, or references (PDF, DOC/DOCX, TXT, etc.)
                    </span>
                  )}
                </div>

                {/* AI Rubric Weights Setup */}
                <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                    <Sparkles size={14} color="#10b981" />
                    AI Auto-Evaluation Rubric Weights (Total: 100 Pts)
                  </span>

                  <div className="grid-3" style={{ gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.725rem', color: '#15803d', fontWeight: 600 }}>Correctness</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newAsg.rubricCorrectness}
                        onChange={(e) => setNewAsg({ ...newAsg, rubricCorrectness: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.725rem', color: '#15803d', fontWeight: 600 }}>Optimization</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newAsg.rubricOptimization}
                        onChange={(e) => setNewAsg({ ...newAsg, rubricOptimization: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.725rem', color: '#15803d', fontWeight: 600 }}>Code Style</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newAsg.rubricStyle}
                        onChange={(e) => setNewAsg({ ...newAsg, rubricStyle: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ flexShrink: 0, borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                <button type="button" onClick={() => { setShowCreateModal(false); setAssignmentFile(null); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Assignment &amp; AI Rubric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Submission Date Modal */}
      {showExtendModal && (
        <div className="modal-backdrop" onClick={() => setShowExtendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', borderRadius: 'var(--radius-lg)' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Extend Submission Date</h3>
              </div>
              <button onClick={() => setShowExtendModal(false)} className="btn-icon">✕</button>
            </div>

            <form onSubmit={handleSaveExtendedDeadline}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Assignment</label>
                  <select
                    className="form-select"
                    value={selectedAsgToExtend?.id || ''}
                    onChange={(e) => {
                      const found = assignments.find((a) => String(a.id) === String(e.target.value));
                      setSelectedAsgToExtend(found || null);
                      if (found) {
                        const rawDate = found.dueDate || found.due_date || '';
                        setExtendedDueDate(rawDate.includes('T') ? rawDate.split('T')[0] : rawDate);
                      }
                    }}
                    required
                  >
                    {assignments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code ? `[${a.code}] ` : ''}{a.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAsgToExtend && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: '0.825rem' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <strong>Course:</strong> {selectedAsgToExtend.code} • {selectedAsgToExtend.subject}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      <strong>Current Deadline:</strong> <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{selectedAsgToExtend.dueDate || 'Not set'}</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">New Submission Deadline Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={extendedDueDate}
                    onChange={(e) => setExtendedDueDate(e.target.value)}
                  />
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                    Select the new deadline. Students enrolled in this course will immediately see this updated submission date.
                  </span>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowExtendModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={extendingLoading} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  {extendingLoading ? (
                    <LoadingSpinner message="" size={14} centered={false} />
                  ) : (
                    <Calendar size={14} />
                  )}
                  <span>Save New Deadline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
