import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save, CheckCircle2, User, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AttendanceManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({}); // { studentId: "Present" | "Absent" | "Late" }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.getFacultyCourses();
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourseId(list[0].id);
        fetchStudents(list[0].id);
      }
    } catch (err) {
      setError('Failed to fetch faculty courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (courseId, targetDate = date) => {
    try {
      const res = await api.getCourseStudentsForAttendance(courseId);
      const studentList = Array.isArray(res.data?.students)
        ? res.data.students
        : Array.isArray(res.data)
        ? res.data
        : [];
      setStudents(studentList);

      // Check if attendance was already recorded for this date
      let existingMap = {};
      try {
        const existRes = await api.getExistingAttendanceRecords(courseId, targetDate);
        existingMap = existRes.data?.records || {};
      } catch (e) {
        // fallback
      }

      const initialMap = {};
      studentList.forEach(s => {
        initialMap[s.id] = existingMap[s.id] || 'Present';
      });
      setRecords(initialMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    fetchStudents(courseId, date);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (selectedCourseId) {
      fetchStudents(selectedCourseId, newDate);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setRecords({
      ...records,
      [studentId]: status
    });
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        course_id: parseInt(selectedCourseId),
        date,
        records: Object.keys(records).map(studentId => ({
          student_id: parseInt(studentId),
          status: records[studentId]
        }))
      };

      await api.saveAttendance(payload);
      setMessage(`Attendance recorded successfully for ${students.length} students on ${date}!`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading && courses.length === 0) return <LoadingSpinner message="Loading course attendance records..." />;

  const presentCount = Object.values(records).filter(s => s === 'Present').length;
  const absentCount = Object.values(records).filter(s => s === 'Absent').length;
  const lateCount = Object.values(records).filter(s => s === 'Late').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Record daily course attendance with date tracking and instant synchronization</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="btn btn-primary"
          style={{ gap: '0.4rem' }}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
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

      {/* Control Strip */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '240px', flex: 1 }}>
          <label className="form-label">Subject / Course</label>
          <select
            className="form-select"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            {(Array.isArray(courses) ? courses : []).map(c => (
              <option key={c.id} value={c.id}>{c.code}: {c.title}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0, width: '180px' }}>
          <label className="form-label">Attendance Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => handleMarkAll('Present')} className="btn btn-outline btn-sm">
            All Present
          </button>
          <button type="button" onClick={() => handleMarkAll('Absent')} className="btn btn-outline btn-sm">
            All Absent
          </button>
        </div>

        {/* Stats Summary */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-success">Present: {presentCount}</span>
          <span className="badge badge-warning">Late: {lateCount}</span>
          <span className="badge badge-danger">Absent: {absentCount}</span>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Email</th>
              <th style={{ textAlign: 'center' }}>Attendance Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(s => {
                const currentStatus = records[s.id] || 'Present';
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="badge badge-neutral">{s.identifier}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.email}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'Present')}
                          className={`btn btn-sm ${currentStatus === 'Present' ? 'btn-success' : 'btn-outline'}`}
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'Late')}
                          className={`btn btn-sm ${currentStatus === 'Late' ? 'btn-secondary' : 'btn-outline'}`}
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', backgroundColor: currentStatus === 'Late' ? '#f59e0b' : 'transparent', color: currentStatus === 'Late' ? '#ffffff' : 'inherit' }}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'Absent')}
                          className={`btn btn-sm ${currentStatus === 'Absent' ? 'btn-danger' : 'btn-outline'}`}
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No students currently enrolled in this course.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceManagement;
