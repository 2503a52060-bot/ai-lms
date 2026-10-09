import React, { useState } from 'react';
import { Megaphone, Plus, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';

const AdminAnnouncements = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', target_role: 'all' });
  const [message, setMessage] = useState('');
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Mid-Semester Examination Schedule Announced',
      content: 'The examination timetable for Fall 2026 has been published. Midterms begin on October 25th in designated academic halls.',
      target: 'Entire University (All Roles)',
      date: 'Oct 05, 2026'
    },
    {
      id: 2,
      title: 'Annual Campus AI & Systems Research Symposium',
      content: 'Undergraduate and graduate research submissions are open for the 2026 Annual Computer Science & AI Showcase.',
      target: 'Faculty & Students',
      date: 'Oct 01, 2026'
    }
  ]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.postAdminAnnouncement(form);
      setMessage('Institutional announcement broadcasted!');
      setAnnouncements([
        {
          id: Date.now(),
          title: form.title,
          content: form.content,
          target: form.target_role === 'all' ? 'All Roles' : form.target_role,
          date: 'Just now'
        },
        ...announcements
      ]);
      setShowModal(false);
      setForm({ title: '', content: '', target_role: 'all' });
    } catch (e) {
      alert('Could not broadcast announcement');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Institutional Announcements</h1>
          <p className="page-subtitle">Publish campus-wide bulletins, term schedules, and administrative notifications</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} />
          <span>Broadcast Notice</span>
        </button>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.map(a => (
          <div key={a.id} className="card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{a.title}</h3>
              <span className="badge badge-purple">{a.target}</span>
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
              <h3 style={{ fontWeight: 700 }}>Broadcast Institutional Notice</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Notice Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Campus Holiday Schedule Update"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select
                    className="form-select"
                    value={form.target_role}
                    onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                  >
                    <option value="all">Entire Campus (All Users)</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Announcement Content</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Write detailed institutional announcement..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
