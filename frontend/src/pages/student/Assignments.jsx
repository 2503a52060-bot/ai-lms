import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Filter, Plus } from 'lucide-react';
import { api } from '../../services/api';
import AssignmentCard from '../../components/AssignmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [asgRes, crsRes] = await Promise.all([
        api.getAssignments(),
        api.getStudentCourses()
      ]);
      setAssignments(Array.isArray(asgRes.data) ? asgRes.data : []);
      setCourses(Array.isArray(crsRes.data) ? crsRes.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Fetching assignments and evaluation states..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage
          title="Could not load assignments"
          message={error}
          onRetry={fetchAssignments}
        />
      </div>
    );
  }

  const filtered = assignments.filter((asg) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Pending'
        ? asg.status === 'Pending'
        : activeTab === 'Submitted'
        ? asg.status === 'Submitted'
        : asg.status === 'Graded';

    const matchesCourse =
      selectedCourse === 'ALL'
        ? true
        : String(asg.course_id) === String(selectedCourse) ||
          asg.course_code === selectedCourse ||
          asg.subject === selectedCourse ||
          asg.course_title === selectedCourse;

    const matchesSearch =
      asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asg.subject && asg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asg.course_code && asg.course_code.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesCourse && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Assignments</h1>
          <p className="page-subtitle">
            Submit coursework, track submission deadlines, and review AI-graded feedback
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ minWidth: '200px', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Enrolled Subjects</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
          onClick={() => setActiveTab('All')}
        >
          All ({assignments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'Pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('Pending')}
        >
          Pending Action ({assignments.filter((a) => a.status === 'Pending').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'Submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('Submitted')}
        >
          Submitted ({assignments.filter((a) => a.status === 'Submitted').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'Graded' ? 'active' : ''}`}
          onClick={() => setActiveTab('Graded')}
        >
          Graded by AI ({assignments.filter((a) => a.status === 'Graded').length})
        </button>
      </div>

      {/* Assignment Grid or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title={`No ${activeTab === 'All' ? '' : activeTab} Assignments Found`}
          description="There are currently no assignments matching your selected filter or query."
          action={
            <button onClick={() => { setActiveTab('All'); setSearchQuery(''); }} className="btn btn-primary btn-sm">
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid-3">
          {filtered.map((asg) => (
            <AssignmentCard key={asg.id} assignment={asg} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;
