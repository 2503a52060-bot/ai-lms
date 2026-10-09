import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const FacultyAnnouncements = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', course_id: '', target_role: 'student' });
  const [successMsg, setSuccessMsg] = useState('');
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'CS301: Assignment 1 Office Hours & Submission Guidelines',
      content: 'Prof. Alan Turing will hold extended office hours on Thursday from 3:00 PM to 5:00 PM to assist with DP recurrence state designs.',
      target: 'Students enrolled in CS301',
      date: 'Oct 04, 2026'
    },
    {
      id: 2,
      title: 'Mid-Semester Exam Preparation Materials Uploaded',
      content: 'Sample mock papers and exam formula sheets have been published to the Course Files section for review.',
      target: 'All Students',
      date: 'Oct 02, 2026'
    }
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.getFacultyCourses();
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
      if (list.length > 0) {
        setForm(prev => ({ ...prev, course_id: list[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createAnnouncement({
        title: form.title,
        content: form.content,
        course_id: form.course_id ? parseInt(form.course_id) : null,
        target_role: form.target_role
      });
      setSuccessMsg('Announcement published successfully!');
      setAnnouncements([
        {
          id: Date.now(),
          title: form.title,
          content: form.content,
          target: 'Course Students',
          date: 'Just now'
        },
        ...announcements
      ]);
      setShowModal(false);
      setForm({ title: '', content: '', course_id: courses[0]?.id || '', target_role: 'student' });
    } catch (err) {
      alert('Could not publish announcement.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Announcements</h1>
          <p className="page-subtitle">Post important academic notices, exam reminders, and office hours</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} />
          <span>New Announcement</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(Array.isArray(announcements) ? announcements : []).map(a => (
          <div key={a.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{a.title}</h3>
              <span className="badge badge-primary">{a.target}</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              {a.content}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> Posted {a.date}
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Publish Announcement</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  >
                    {(Array.isArray(courses) ? courses : []).map(c => (
                      <option key={c.id} value={c.id}>{c.code}: {c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Announcement Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lab Session Rescheduled to Thursday"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notice Message</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Write detailed instructions or notes for your students..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAnnouncements;
