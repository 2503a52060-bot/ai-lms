import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const FacultyTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDay, setSelectedDay] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [slotForm, setSlotForm] = useState({
    course_id: '',
    day: 'Monday',
    start_time: '09:00 AM',
    end_time: '10:30 AM',
    room: 'Hall 101',
    section: 'Section A'
  });

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
    fetchCourses();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getFacultyTimetable();
      setTimetable(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch teaching timetable.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.getFacultyCourses();
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
      if (list.length > 0 && !slotForm.course_id) {
        setSlotForm(prev => ({ ...prev, course_id: list[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createFacultyTimetableSlot(slotForm);
      setMessage('Class schedule created successfully!');
      setShowModal(false);
      fetchTimetable();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not schedule class');
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this class schedule?')) return;
    try {
      await api.deleteFacultyTimetableSlot(slotId);
      setMessage('Class schedule removed successfully.');
      fetchTimetable();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not delete schedule');
    }
  };

  const filteredSlots = selectedDay === 'All'
    ? timetable
    : timetable.filter(s => (s.day || s.day_of_week)?.toLowerCase() === selectedDay.toLowerCase());

  if (loading && timetable.length === 0) {
    return <LoadingSpinner message="Loading teaching timetable and lecture schedules..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teaching Timetable &amp; Schedules</h1>
          <p className="page-subtitle">
            Manage your weekly lecture schedule, classroom allocations, and lab sessions
          </p>
        </div>

        <button
          onClick={() => {
            fetchCourses();
            setShowModal(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <Plus size={14} />
          <span>Schedule Class</span>
        </button>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Days Filter Tabs */}
      <div className="tabs-container">
        {days.map(d => (
          <button
            key={d}
            className={`tab-btn ${selectedDay === d ? 'active' : ''}`}
            onClick={() => setSelectedDay(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Timetable Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Day of Week</th>
              <th>Time Window</th>
              <th>Course / Subject</th>
              <th>Cohort Section</th>
              <th>Hall / Room</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSlots.length > 0 ? (
              filteredSlots.map(slot => (
                <tr key={slot.id}>
                  <td>
                    <span className="badge badge-primary">{slot.day || slot.day_of_week}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <Clock size={14} color="var(--primary)" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{slot.course_code}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{slot.course_title}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{slot.section || slot.class_section}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="#f59e0b" />
                      <span>{slot.room}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#ef4444', borderColor: '#fca5a5', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No scheduled classes for {selectedDay === 'All' ? 'any day' : selectedDay}. Click &quot;Schedule Class&quot; to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Class Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Schedule New Class</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon">✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Course / Subject</label>
                  <select
                    className="form-select"
                    value={slotForm.course_id}
                    onChange={(e) => setSlotForm({ ...slotForm, course_id: parseInt(e.target.value) })}
                    required
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Day of Week</label>
                    <select
                      className="form-select"
                      value={slotForm.day}
                      onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cohort Section</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Section A"
                      value={slotForm.section}
                      onChange={(e) => setSlotForm({ ...slotForm, section: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="09:00 AM"
                      value={slotForm.start_time}
                      onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="10:30 AM"
                      value={slotForm.end_time}
                      onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lecture Hall / Room</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Hall 101 / Lab 2"
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ flexShrink: 0, borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyTimetable;
