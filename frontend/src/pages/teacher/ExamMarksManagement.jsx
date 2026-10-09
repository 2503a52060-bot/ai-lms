import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Save, CheckCircle2, Award, Clock } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const ExamMarksManagement = () => {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // { studentId: { marks: number, remarks: string } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // New Exam Form
  const [examForm, setExamForm] = useState({
    course_id: '',
    title: '',
    exam_type: 'Midterm',
    exam_date: new Date().toISOString().split('T')[0],
    total_marks: 100,
    room: 'Hall 302'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [cRes, eRes] = await Promise.all([
        api.getFacultyCourses(),
        api.getFacultyExams()
      ]);
      const courseList = Array.isArray(cRes.data) ? cRes.data : [];
      const examList = Array.isArray(eRes.data) ? eRes.data : [];
      setCourses(courseList);
      setExams(examList);
      if (courseList.length > 0) {
        setExamForm(prev => ({ ...prev, course_id: courseList[0].id }));
      }
      if (examList.length > 0) {
        selectExam(examList[0]);
      }
    } catch (err) {
      setError('Failed to fetch exams and course data.');
    } finally {
      setLoading(false);
    }
  };

  const selectExam = async (exam) => {
    setSelectedExamId(exam.id);
    try {
      const res = await api.getCourseStudentsForAttendance(exam.course_id);
      const studentList = Array.isArray(res.data?.students)
        ? res.data.students
        : Array.isArray(res.data)
        ? res.data
        : [];
      setStudents(studentList);

      const initialMarks = {};
      studentList.forEach(s => {
        initialMarks[s.id] = { marks: 80, remarks: 'Consistent performance' };
      });
      setMarksMap(initialMarks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.scheduleExam({
        course_id: parseInt(examForm.course_id),
        title: examForm.title,
        exam_type: examForm.exam_type,
        exam_date: examForm.exam_date,
        total_marks: parseInt(examForm.total_marks),
        room: examForm.room
      });
      setMessage('Exam scheduled successfully!');
      setShowExamModal(false);
      const eRes = await api.getFacultyExams();
      setExams(eRes.data || []);
    } catch (err) {
      setError('Could not schedule exam');
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId) return;
    setSaving(true);
    setMessage('');
    setError('');

    const currentExam = exams.find(e => e.id === parseInt(selectedExamId));
    try {
      const payload = {
        exam_id: parseInt(selectedExamId),
        course_id: currentExam?.course_id || 1,
        marks: Object.keys(marksMap).map(sId => ({
          student_id: parseInt(sId),
          marks_obtained: parseFloat(marksMap[sId].marks || 0),
          remarks: marksMap[sId].remarks || ''
        }))
      };

      await api.saveExamMarks(payload);
      setMessage(`Marks successfully saved for ${students.length} students!`);
    } catch (err) {
      setError('Failed to save exam marks.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && exams.length === 0) return <LoadingSpinner message="Loading exam records..." />;

  const currentExam = exams.find(e => e.id === parseInt(selectedExamId));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams &amp; Marks Entry</h1>
          <p className="page-subtitle">Schedule departmental assessments, record student scores, and enter faculty remarks</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowExamModal(true)} className="btn btn-outline" style={{ gap: '0.4rem' }}>
            <Plus size={16} />
            <span>Schedule New Exam</span>
          </button>
          <button onClick={handleSaveMarks} disabled={saving || students.length === 0} className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Marks &amp; Remarks'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Exam Selector */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ minWidth: '320px', flex: 1 }}>
          <label className="form-label">Select Scheduled Exam</label>
          <select
            className="form-select"
            value={selectedExamId}
            onChange={(e) => {
              const ex = exams.find(x => String(x.id) === e.target.value);
              if (ex) selectExam(ex);
            }}
          >
            {(Array.isArray(exams) ? exams : []).map(e => (
              <option key={e.id} value={e.id}>{e.course_code}: {e.title} ({e.exam_type} - {e.exam_date})</option>
            ))}
          </select>
        </div>

        {currentExam && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-primary">Total Marks: {currentExam.total_marks}</span>
            <span className="badge badge-neutral">Room: {currentExam.room}</span>
            <span className="badge badge-neutral">Date: {currentExam.exam_date}</span>
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Marks Obtained (Max: {currentExam?.total_marks || 100})</th>
              <th>Percentage</th>
              <th>Faculty Remarks</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(s => {
                const markVal = marksMap[s.id]?.marks ?? 0;
                const remarksVal = marksMap[s.id]?.remarks ?? '';
                const pct = currentExam?.total_marks ? ((markVal / currentExam.total_marks) * 100).toFixed(1) : 0;

                return (
                  <tr key={s.id}>
                    <td>
                      <span className="badge badge-neutral">{s.identifier}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                    </td>
                    <td style={{ width: '180px' }}>
                      <input
                        type="number"
                        className="form-input"
                        value={markVal}
                        onChange={(e) => setMarksMap({
                          ...marksMap,
                          [s.id]: { ...marksMap[s.id], marks: parseFloat(e.target.value) || 0 }
                        })}
                        min="0"
                        max={currentExam?.total_marks || 100}
                        step="0.5"
                      />
                    </td>
                    <td>
                      <span className={`badge ${pct >= 75 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                        {pct}%
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={remarksVal}
                        onChange={(e) => setMarksMap({
                          ...marksMap,
                          [s.id]: { ...marksMap[s.id], remarks: e.target.value }
                        })}
                        placeholder="e.g. Excellent problem solving"
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No students found for this examination.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Schedule Exam */}
      {showExamModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Schedule Assessment / Exam</h3>
              <button onClick={() => setShowExamModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreateExam}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={examForm.course_id}
                    onChange={(e) => setExamForm({ ...examForm, course_id: e.target.value })}
                    required
                  >
                    {(Array.isArray(courses) ? courses : []).map(c => (
                      <option key={c.id} value={c.id}>{c.code}: {c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Midterm 1: Relational Architecture"
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Type</label>
                  <select
                    className="form-select"
                    value={examForm.exam_type}
                    onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })}
                  >
                    <option value="Midterm">Midterm Examination</option>
                    <option value="Final">Final Examination</option>
                    <option value="Quiz">Unit Quiz</option>
                    <option value="Lab Assessment">Practical Lab Assessment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={examForm.exam_date}
                    onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Total Marks</label>
                  <input
                    type="number"
                    className="form-input"
                    value={examForm.total_marks}
                    onChange={(e) => setExamForm({ ...examForm, total_marks: e.target.value })}
                    min="10"
                    max="200"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Room / Hall</label>
                  <input
                    type="text"
                    className="form-input"
                    value={examForm.room}
                    onChange={(e) => setExamForm({ ...examForm, room: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowExamModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamMarksManagement;
