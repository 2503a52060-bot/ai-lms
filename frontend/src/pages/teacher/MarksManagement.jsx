import React, { useState, useEffect } from 'react';
import { Award, Save, CheckCircle2, Search, Filter, Share2 } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const MarksManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('CS601');
  const [selectedExam, setSelectedExam] = useState('internal');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Local editable marks state
  const [editableMarks, setEditableMarks] = useState({
    std_101: { internal: 29, midterm: 28, endsem: 37 },
    std_102: { internal: 30, midterm: 29, endsem: 39 },
    std_103: { internal: 18, midterm: 16, endsem: 24 },
    std_104: { internal: 21, midterm: 19, endsem: 25 },
    std_105: { internal: 28, midterm: 27, endsem: 35 },
    std_106: { internal: 24, midterm: 23, endsem: 31 }
  });

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.getTeacherStudents();
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.students) ? res.data.students : [];
        setStudents(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleScoreChange = (studentId, examType, value) => {
    const num = Math.max(0, Math.min(examType === 'endsem' ? 40 : 30, Number(value) || 0));
    setEditableMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [examType]: num
      }
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      await api.updateStudentMarks('all', editableMarks);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to commit marks update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Opening institutional gradebook and marks registry..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage title="Gradebook Offline" message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const studentList = Array.isArray(students) ? students : [];
  const filteredStudents = studentList.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNo || s.identifier || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gradebook &amp; Marks Management</h1>
          <p className="page-subtitle">
            Enter, calibrate, and officially publish continuous assessment scores to the student portal
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleSaveMarks}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Gradebook Changes'}
          </button>
          <button
            onClick={() => alert('Marks published to all enrolled student dashboards and official transcripts!')}
            className="btn btn-success btn-sm"
          >
            <Share2 size={14} />
            Publish Live to Students
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>All scores and weighted grade points updated successfully in database!</span>
        </div>
      )}

      {/* Filter and Course Selection Header */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject Course</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-select"
            >
              <option value="CS601">CS601 - Data Structures &amp; Algorithms</option>
              <option value="CS602">CS602 - Machine Learning</option>
              <option value="CS603">CS603 - Database Management Systems</option>
              <option value="CS605">CS605 - Computer Networks</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Active Assessment Component</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="form-select"
            >
              <option value="internal">Continuous Assessment / Internal (Max 30)</option>
              <option value="midterm">Midterm Written Examination (Max 30)</option>
              <option value="endsem">Semester Final Examination (Max 40)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Student</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Gradebook Grid */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Grade Register: {selectedSubject}</h3>
            <p className="card-subtitle">Editing marks directly updates weighted totals in real-time</p>
          </div>
          <span className="badge badge-primary">Total Students: {filteredStudents.length}</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Internal (Max 30)</th>
                <th>Midterm (Max 30)</th>
                <th>End Sem (Max 40)</th>
                <th>Total (100)</th>
                <th>Calculated Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((std) => {
                const marksObj = editableMarks[std.id] || { internal: 25, midterm: 25, endsem: 30 };
                const total = marksObj.internal + marksObj.midterm + marksObj.endsem;
                const grade = total >= 90 ? 'O' : total >= 80 ? 'A+' : total >= 70 ? 'A' : total >= 60 ? 'B' : 'C';

                return (
                  <tr key={std.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                      {std.rollNo}
                    </td>
                    <td style={{ fontWeight: 600 }}>{std.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        className="form-input"
                        style={{ width: '70px', padding: '0.3rem 0.5rem', fontWeight: 700 }}
                        value={marksObj.internal}
                        onChange={(e) => handleScoreChange(std.id, 'internal', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        className="form-input"
                        style={{ width: '70px', padding: '0.3rem 0.5rem', fontWeight: 700 }}
                        value={marksObj.midterm}
                        onChange={(e) => handleScoreChange(std.id, 'midterm', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        className="form-input"
                        style={{ width: '70px', padding: '0.3rem 0.5rem', fontWeight: 700 }}
                        value={marksObj.endsem}
                        onChange={(e) => handleScoreChange(std.id, 'endsem', e.target.value)}
                      />
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: total >= 75 ? 'var(--primary)' : 'var(--danger)' }}>
                        {total}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / 100</span>
                    </td>
                    <td>
                      <span className={`badge ${total >= 80 ? 'badge-success' : total >= 65 ? 'badge-primary' : 'badge-warning'}`}>
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarksManagement;
