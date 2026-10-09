import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  ArrowLeft,
  Sparkles,
  Trash2,
  RefreshCw,
  Download,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AssignmentSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAssignments();
      const match = res.data?.find(a => String(a.id) === String(id));
      if (match) {
        setAssignment(match);
        if (match.submission?.notes) {
          setNotes(match.submission.notes);
        }
      } else {
        setError('Assignment not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !notes.trim()) {
      alert('Please attach a solution file or provide your implementation notes.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('notes', notes);

      await api.submitAssignmentMultipart(id, formData);
      setSuccessMsg('Assignment submitted successfully! AI evaluation recommendation has been queued for faculty review.');
      setIsReplacing(false);
      setSelectedFile(null);
      await fetchAssignment();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!window.confirm('Are you sure you want to delete your submission before the deadline?')) return;

    setDeleting(true);
    setError(null);
    try {
      await api.deleteSubmission(id);
      setSuccessMsg('Submission was successfully removed. You can submit a fresh solution before the deadline.');
      setIsReplacing(true);
      await fetchAssignment();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Could not delete submission.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving assignment details..." />;
  if (error && !assignment) {
    return (
      <div className="page-container">
        <ErrorMessage title="Error loading assignment" message={error} onRetry={fetchAssignment} />
      </div>
    );
  }

  const sub = assignment?.submission;
  const isPastDeadline = assignment?.is_past_deadline;

  return (
    <div className="page-container">
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
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            {assignment?.course_code} • {assignment?.course_title}
          </span>
          <h1 className="page-title">{assignment?.title}</h1>
          <p className="page-subtitle">{assignment?.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={`badge ${isPastDeadline ? 'badge-danger' : 'badge-warning'}`}>
            <Calendar size={13} />
            <span>Due: {assignment?.due_date_formatted || assignment?.due_date}</span>
          </div>
          <div className="badge badge-primary">
            <Award size={13} />
            <span>Max: {assignment?.max_marks} Marks</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Assignment / Question File Download Card for Students */}
      {assignment?.attachment_path && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#e0e7ff', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Assignment / Question File: {assignment.attachment_name || 'Question Document'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Download this file to review the problem statement, prompt specifications, and instructions.
              </div>
            </div>
          </div>

          <a
            href={assignment.attachment_path.startsWith('http') ? assignment.attachment_path : `http://localhost:8000${assignment.attachment_path}`}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
          >
            <Download size={14} />
            <span>Download Question File</span>
          </a>
        </div>
      )}

      {/* Existing Submission Details Card */}
      {sub && !isReplacing ? (
        <div className="grid-2-1">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.35rem' }}>
                  Submitted on {sub.submitted_at}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Your Active Submission</h3>
              </div>

              {sub.can_replace && !isPastDeadline && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setIsReplacing(true)}
                    className="btn btn-outline btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    <RefreshCw size={14} />
                    <span>Replace Submission</span>
                  </button>
                  <button
                    onClick={handleDeleteSubmission}
                    disabled={deleting}
                    className="btn btn-danger btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {sub.file_name && (
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <FileText size={20} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.file_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.file_size || 'Attached file'}</div>
                  </div>
                </div>
                {sub.file_path && (
                  <a
                    href={sub.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn btn-outline btn-sm"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
            )}

            {sub.notes && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Submission Notes
                </h4>
                <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', lineHeight: 1.5, border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
                  {sub.notes}
                </div>
              </div>
            )}

            {/* Evaluation Status */}
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: sub.is_approved ? 'var(--success-light)' : 'var(--primary-light)', border: `1px solid ${sub.is_approved ? 'var(--success-border)' : 'var(--primary-border)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={18} color={sub.is_approved ? 'var(--success)' : 'var(--primary)'} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: sub.is_approved ? '#065f46' : 'var(--primary)' }}>
                  {sub.is_approved ? 'Faculty Approved Evaluation' : 'AI Analysis In Review'}
                </h4>
              </div>

              {sub.is_approved ? (
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46', marginBottom: '0.35rem' }}>
                    Marks: {sub.marks_obtained} / {assignment?.max_marks}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#047857', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    <strong>Feedback:</strong> {sub.feedback}
                  </p>
                  {sub.weak_topics && (
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                      <strong>Identified Weak Topics:</strong> {sub.weak_topics}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#3730a3', lineHeight: 1.5 }}>
                  Your submission was scanned by our AI Rubric Assistant. Preliminary marks and feedback were generated and sent to Prof. {assignment?.faculty_name || 'Alan Turing'} for review and approval.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Policy &amp; Guidelines</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                • You are permitted to replace or delete your submission prior to the deadline: <strong>{assignment?.due_date_formatted}</strong>.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                • Once the faculty approves your submission, the official grade and feedback will lock in your gradebook.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Submission Upload Form */
        <div className="grid-2-1">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="card-title">
                <UploadCloud size={20} color="var(--primary)" />
                <span>{isReplacing ? 'Replace Solution Submission' : 'Submit Assignment Solution'}</span>
              </h3>
              {isReplacing && (
                <button onClick={() => setIsReplacing(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
              )}
            </div>

            {isPastDeadline ? (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>Deadline has passed. New submissions or modifications are no longer accepted.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Select Submission File (.pdf, .doc, .docx, images, code, .zip)
                  </label>
                  <input
                    type="file"
                    className="form-input"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.zip,.tar,.py,.java,.cpp,.txt"
                    style={{ padding: '0.6rem' }}
                  />
                  {selectedFile ? (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                        ✓ Ready to upload: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      Accepted formats: PDF documents, Word (DOC/DOCX), Images (PNG/JPG), Code files, or Archives
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Solution Notes &amp; Implementation Summary</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    placeholder="Provide notes on your approach, algorithms implemented, key assumptions, or explanation of your solution..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {submitting ? (
                    <LoadingSpinner message="Uploading File &amp; Submitting..." size={18} centered={false} />
                  ) : (
                    <>
                      <UploadCloud size={18} />
                      <span>{isReplacing ? 'Upload File / Replace Assignment' : 'Upload File / Submit Assignment'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div>
            <div className="card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="var(--primary)" />
                <span>AI Automated Correction Workflow</span>
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                1. <strong>Submission:</strong> You upload your file and notes.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                2. <strong>AI Evaluation:</strong> AI models assess complexity, correctness, and detect potential weak topics.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                3. <strong>Faculty Verification:</strong> Your professor reviews, amends, or approves the evaluation before marks reach your profile.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmission;
