import React, { useState, useEffect } from 'react';
import { Award, Filter, Download } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const Gradebook = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [gradebookData, setGradebookData] = useState(null);
  const [loading, setLoading] = useState(true);
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
        fetchGradebook(list[0].id);
      }
    } catch (err) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchGradebook = async (courseId) => {
    try {
      setLoading(true);
      const res = await api.getGradebook(courseId);
      setGradebookData(res.data);
    } catch (err) {
      setError('Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (id) => {
    setSelectedCourseId(id);
    fetchGradebook(id);
  };

  if (loading && !gradebookData) return <LoadingSpinner message="Generating academic gradebook..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCourses} />;

  const exams = Array.isArray(gradebookData?.exams) ? gradebookData.exams : [];
  const students = Array.isArray(gradebookData?.students) ? gradebookData.students : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Gradebook</h1>
          <p className="page-subtitle">Cumulative student performance, examination weighting, and letter grades</p>
        </div>

        <div style={{ width: '280px' }}>
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
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              {exams.map(e => (
                <th key={e.id} style={{ textAlign: 'center' }}>
                  {e.title}
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 'normal' }}>
                    Max: {e.total_marks}
                  </div>
                </th>
              ))}
              <th style={{ textAlign: 'center' }}>Overall %</th>
              <th style={{ textAlign: 'center' }}>Letter Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(s => (
                <tr key={s.student_id}>
                  <td>
                    <span className="badge badge-neutral">{s.identifier}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                  </td>
                  {exams.map(e => {
                    const mark = s.marks ? s.marks[e.id] : null;
                    return (
                      <td key={e.id} style={{ textAlign: 'center', fontWeight: 600 }}>
                        {mark !== null && mark !== undefined ? mark : '—'}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {s.overall_pct}%
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${s.letter_grade === 'A' ? 'badge-success' : s.letter_grade === 'B' ? 'badge-primary' : s.letter_grade === 'C' ? 'badge-warning' : 'badge-danger'}`}>
                      {s.letter_grade}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={exams.length + 4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No grade records found for this course.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Gradebook;
