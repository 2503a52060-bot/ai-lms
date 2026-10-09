import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('All');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.getTimetable();
      setTimetable(res.data || []);
    } catch (err) {
      setError('Failed to fetch timetable.');
    } finally {
      setLoading(false);
    }
  };

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredSlots = selectedDay === 'All'
    ? timetable
    : timetable.filter(s => s.day?.toLowerCase() === selectedDay.toLowerCase());

  if (loading) return <LoadingSpinner message="Loading your class timetable..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTimetable} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Class Timetable</h1>
          <p className="page-subtitle">Fall 2026 Academic Schedule &amp; Lecture Halls</p>
        </div>
      </div>

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

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time Window</th>
              <th>Course / Subject</th>
              <th>Hall / Room</th>
              <th>Instructor</th>
            </tr>
          </thead>
          <tbody>
            {filteredSlots.length > 0 ? (
              filteredSlots.map(slot => (
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
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{slot.course_code}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{slot.course_title}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="#f59e0b" />
                      <span>{slot.room}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} color="#10b981" />
                      <span>{slot.faculty_name}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No classes scheduled for {selectedDay}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTimetable;
