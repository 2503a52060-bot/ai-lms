import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CampusTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [slotForm, setSlotForm] = useState({
    course_id: 1,
    faculty_id: '',
    section: 'Section A',
    day: 'Monday',
    start_time: '09:00 AM',
    end_time: '10:30 AM',
    room: 'Hall 401'
  });

  useEffect(() => {
    fetchTimetable();
    fetchCoursesAndFaculty();
  }, []);

  const fetchCoursesAndFaculty = async () => {
    try {
      const res = await api.getCoursesCatalog();
      const cList = res.data?.courses || [];
      const fList = res.data?.available_faculty || [];
      setCourses(cList);
      setFacultyList(fList);
      if (cList.length > 0 && !slotForm.course_id) {
        setSlotForm(prev => ({ ...prev, course_id: cList[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.getCampusTimetable();
      setTimetable(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.addTimetableSlot(slotForm);
      setMessage('Timetable slot registered successfully!');
      setShowModal(false);
      fetchTimetable();
    } catch (e) {
      alert('Could not add slot');
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this timetable slot?')) return;
    try {
      await api.deleteTimetableSlot(slotId);
      setMessage('Timetable slot removed successfully.');
      fetchTimetable();
    } catch (e) {
      alert('Could not delete slot');
    }
  };

  if (loading) return <LoadingSpinner message="Loading campus lecture schedules..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Master Timetable</h1>
          <p className="page-subtitle">Institution-wide schedule of lectures, lab sessions, and classroom allocations</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} />
          <span>Add Timetable Slot</span>
        </button>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Day of Week</th>
              <th>Time Window</th>
              <th>Course / Subject</th>
              <th>Assigned Faculty</th>
              <th>Cohort Section</th>
              <th>Hall / Room</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map(slot => (
              <tr key={slot.id}>
                <td>
                  <span className="badge badge-primary">{slot.day}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <Clock size={14} color="var(--primary)" />
                    <span>{slot.start_time} - {slot.end_time}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{slot.course_code}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{slot.course_title}</div>
                </td>
                <td>{slot.faculty_name}</td>
                <td>
                  <span className="badge badge-neutral">{slot.section}</span>
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
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Add Timetable Slot</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
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

                <div className="form-group">
                  <label className="form-label">Assigned Faculty (Instructor)</label>
                  <select
                    className="form-select"
                    value={slotForm.faculty_id}
                    onChange={(e) => setSlotForm({ ...slotForm, faculty_id: e.target.value ? parseInt(e.target.value) : '' })}
                  >
                    <option value="">Course Default Faculty</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department || 'Faculty'})
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
                    placeholder="Hall 401"
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Timetable Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusTimetable;
