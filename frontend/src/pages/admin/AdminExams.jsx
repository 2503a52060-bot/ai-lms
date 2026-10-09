import React, { useState, useEffect } from 'react';
import { Calendar, Award, MapPin, Clock } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminExams();
      setExams(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading institutional exams..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Institution Examination Schedules</h1>
          <p className="page-subtitle">Centralized calendar of Midterms, Finals, and Departmental Quizzes</p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Assessment Title</th>
              <th>Exam Category</th>
              <th>Date</th>
              <th>Total Marks</th>
              <th>Assigned Hall</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(e => (
              <tr key={e.id}>
                <td>
                  <span className="badge badge-primary">{e.course_code}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{e.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.course_title}</div>
                </td>
                <td>
                  <span className="badge badge-neutral">{e.exam_type}</span>
                </td>
                <td>{e.exam_date}</td>
                <td>
                  <strong>{e.total_marks} Marks</strong>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#f59e0b" />
                    <span>{e.room}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminExams;
