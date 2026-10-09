import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  BookOpen,
  Check,
  Layers,
  FileSpreadsheet,
  MapPin,
  Download,
  CheckSquare,
  ChevronRight,
  User
} from 'lucide-react';
import { api } from '../../services/api';
import RecommendationCard from '../../components/RecommendationCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DashboardCard from '../../components/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const DEFAULT_DRILL_QUESTIONS = [
  {
    index: 0,
    question: "How many usable host IP addresses are available in a /28 subnet mask (255.255.255.240)?",
    options: ["16 usable hosts", "14 usable hosts", "30 usable hosts", "12 usable hosts"],
    explanation: "A /28 subnet provides 2^(32-28) = 16 total IPs. Subtracting 2 for Network ID and Broadcast ID leaves 14 usable hosts."
  },
  {
    index: 1,
    question: "In the 0/1 Knapsack problem with weights [2, 3, 4] and values [3, 4, 5], what is the optimal state transition equation?",
    options: ["dp[w] = max(dp[w], dp[w - wt[i]] + val[i])", "dp[w] = dp[w] + dp[w - 1]", "dp[w] = min(dp[w], val[i])", "dp[w] = dp[w] * 2"],
    explanation: "Standard 0/1 Knapsack dynamic programming checks whether picking item i produces a higher value than skipping it: max(dp[w], dp[w - wt[i]] + val[i])."
  },
  {
    index: 2,
    question: "Which database index structure guarantees O(log N) search, insertion, and range queries by keeping all leaf nodes linked?",
    options: ["Hash Table", "Binary Search Tree", "B+ Tree", "Skip List"],
    explanation: "B+ Trees maintain balanced depth with linked leaf pages, making sequential range scans and point queries highly efficient for disk I/O."
  },
  {
    index: 3,
    question: "What is the primary function of TCP Congestion Window (cwnd) during slow start?",
    options: ["Encrypt payload bytes", "Double cwnd every RTT until ssthresh is reached", "Drop packets automatically", "Determine the MAC address"],
    explanation: "During TCP slow start, the congestion window doubles every round-trip time (RTT) for exponential probing of available network bandwidth."
  },
  {
    index: 4,
    question: "Which asymptotic time complexity describes Dijkstra's shortest path algorithm using a min-priority heap?",
    options: ["O(V^3)", "O((V + E) log V)", "O(V * E)", "O(1)"],
    explanation: "Using a binary min-heap, Dijkstra requires O((V + E) log V) time where V is vertices and E is edges."
  }
];

const StudyRecommendations = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [planData, setPlanData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'courses' | 'timetable' | 'assignments' | 'schedule'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persistent drill progress across refresh and login
  const [completedDrills, setCompletedDrills] = useState(() => {
    try {
      const storageKey = `lms_completed_drills_${user?.id || 'guest'}`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Interactive 5-Minute Drill State
  const [isDrillOpen, setIsDrillOpen] = useState(false);
  const [drillQuestions, setDrillQuestions] = useState(DEFAULT_DRILL_QUESTIONS);
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillResult, setDrillResult] = useState(null);
  const [submittingDrill, setSubmittingDrill] = useState(false);

  const fetchStudyPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStudyPlan();
      const pData = res.data || {};
      setPlanData(pData);

      const list = Array.isArray(pData.recommendations)
        ? pData.recommendations
        : Array.isArray(pData.study_plan?.recommendations)
        ? pData.study_plan.recommendations
        : [];
      setRecommendations(list);

      // Sync saved drill progress from backend
      try {
        const progRes = await api.getDrillProgress();
        if (progRes.data?.completed_indices?.length > 0) {
          const map = {};
          progRes.data.completed_indices.forEach(idx => { map[idx] = true; });
          setCompletedDrills(prev => {
            const merged = { ...prev, ...map };
            const storageKey = `lms_completed_drills_${user?.id || 'guest'}`;
            localStorage.setItem(storageKey, JSON.stringify(merged));
            return merged;
          });
        }
      } catch (e) {
        // Fallback to local storage
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student study plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyPlan();
    if (location.hash === '#drill' || location.search.includes('drill=true')) {
      handleOpenDrill();
    }
  }, [user?.id]);

  const toggleDrillComplete = async (id) => {
    const updated = { ...completedDrills, [id]: !completedDrills[id] };
    setCompletedDrills(updated);
    try {
      const storageKey = `lms_completed_drills_${user?.id || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      const indices = Object.keys(updated).filter(k => updated[k]).map(Number);
      await api.saveDrillProgress(indices);
    } catch (e) {
      console.warn('Could not persist drill progress to server:', e);
    }
  };

  const handleOpenStudyPlan = () => {
    setActiveTab('schedule');
    setTimeout(() => {
      const el = document.getElementById('study-plan-schedule');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenDrill = async () => {
    setIsDrillOpen(true);
    setDrillAnswers({});
    setDrillResult(null);
    try {
      const res = await api.getDrillQuestions();
      if (res.data?.questions?.length > 0) {
        setDrillQuestions(res.data.questions);
      }
    } catch (e) {
      setDrillQuestions(DEFAULT_DRILL_QUESTIONS);
    }
  };

  const handleSelectDrillAnswer = (qIndex, optIndex) => {
    if (drillResult) return;
    setDrillAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitDrill = async (e) => {
    if (e) e.preventDefault();
    setSubmittingDrill(true);
    try {
      const res = await api.submitDrill(drillAnswers);
      setDrillResult(res.data);
    } catch (err) {
      // Local evaluation fallback so modal never breaks
      let score = 0;
      const correctMap = { 0: 1, 1: 0, 2: 2, 3: 1, 4: 1 };
      const feedback = drillQuestions.map((q, idx) => {
        const isCorr = drillAnswers[idx] === correctMap[idx];
        if (isCorr) score++;
        return { question_index: idx, is_correct: isCorr, correct_option: correctMap[idx], explanation: q.explanation };
      });
      setDrillResult({
        score,
        total: drillQuestions.length,
        percentage: Math.round((score / drillQuestions.length) * 100),
        feedback,
        weak_topics: score < drillQuestions.length ? ['Computer Networks', 'Dynamic Programming'] : [],
        summary: `Drill completed! Score: ${score}/${drillQuestions.length} (${Math.round((score / drillQuestions.length) * 100)}%).`
      });
    } finally {
      setSubmittingDrill(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Synthesizing personalized study plan from courses, modules, timetable, and assignments..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage
          title="Could not load Study Plan"
          message={error}
          onRetry={fetchStudyPlan}
        />
      </div>
    );
  }

  const enrolledCourses = Array.isArray(planData?.enrolled_courses) ? planData.enrolled_courses : [];
  const timetableSlots = Array.isArray(planData?.timetable) ? planData.timetable : [];
  const assignmentsList = Array.isArray(planData?.assignments) ? planData.assignments : [];
  const deadlinesList = Array.isArray(planData?.deadlines) ? planData.deadlines : [];
  const weeklySchedule = Array.isArray(planData?.weekly_schedule) && planData.weekly_schedule.length > 0 ? planData.weekly_schedule : [
    { day: 'Monday', focus: 'Data Structures & Algorithms', task: 'Lecture & Lab Session - Room 101', time: '1.5 hrs', priority: 'High' },
    { day: 'Tuesday', focus: 'Database Systems', task: 'B+ Tree Indexing & Query Tuning', time: '1.5 hrs', priority: 'Medium' },
    { day: 'Wednesday', focus: 'Cloud Systems', task: 'Distributed Systems & Microservices', time: '1.5 hrs', priority: 'Medium' },
    { day: 'Thursday', focus: 'Algorithms Practice', task: 'DP on Trees & Rerooting Lab', time: '1.5 hrs', priority: 'High' },
    { day: 'Friday', focus: 'Review & Assignments', task: 'Solve Pending Coursework Tasks', time: '2.0 hrs', priority: 'Critical' },
    { day: 'Saturday', focus: 'Weekly Assessment', task: 'Comprehensive 60-Minute Diagnostic Drill', time: '1.5 hrs', priority: 'Medium' }
  ];
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  const totalModulesCount = enrolledCourses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
  const pendingAssignmentsCount = assignmentsList.filter(a => a.status === 'Pending' || a.status === 'Overdue').length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Personalized Student Study Plan</h1>
          <p className="page-subtitle">
            Dynamic study execution plan synchronized with your enrolled courses, sequential modules, weekly timetable, and deadlines
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="badge badge-purple" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            <Sparkles size={14} /> AI Recommendation Engine Active
          </div>
          <button onClick={handleOpenDrill} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
            <Play size={13} />
            <span>Start 5-Min Drill</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <DashboardCard
          title="Enrolled Courses"
          value={`${enrolledCourses.length}`}
          trend="Active Curriculum"
          trendType="neutral"
          subtitle="Semester 5 Cohort"
          color="primary"
          icon={BookOpen}
          onClick={() => setActiveTab('courses')}
        />
        <DashboardCard
          title="Sequential Modules"
          value={`${totalModulesCount}`}
          trend="Learning Units"
          trendType="up"
          subtitle="Structured syllabus modules"
          color="purple"
          icon={Layers}
          onClick={() => setActiveTab('courses')}
        />
        <DashboardCard
          title="Weekly Timetable"
          value={`${timetableSlots.length} Classes`}
          trend="Scheduled Sessions"
          trendType="neutral"
          subtitle="Mon - Fri Lecture Hall"
          color="info"
          icon={Calendar}
          onClick={() => setActiveTab('timetable')}
        />
        <DashboardCard
          title="Course Assignments"
          value={`${assignmentsList.length}`}
          trend={`${pendingAssignmentsCount} Pending`}
          trendType={pendingAssignmentsCount > 0 ? 'down' : 'up'}
          subtitle="Coursework Deadlines"
          color="warning"
          icon={FileSpreadsheet}
          onClick={() => setActiveTab('assignments')}
        />
      </div>

      {/* View Filter Tabs */}
      <div className="tabs-container" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Sparkles size={15} /> Complete Roadmap
        </button>
        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={15} /> Enrolled Courses &amp; Modules ({enrolledCourses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setActiveTab('timetable')}
        >
          <Calendar size={15} /> Class Timetable ({timetableSlots.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FileSpreadsheet size={15} /> Assignments &amp; Deadlines ({assignmentsList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <CheckSquare size={15} /> Weekly Study Schedule
        </button>
      </div>

      {/* SECTION 1: ENROLLED COURSES & SEQUENTIAL LEARNING MODULES */}
      {(activeTab === 'all' || activeTab === 'courses') && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Enrolled Courses &amp; Sequential Learning Modules
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Mastery syllabus units configured by faculty for your registered subjects
              </p>
            </div>
            <span className="badge badge-primary">{enrolledCourses.length} Registered Courses</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {enrolledCourses.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No registered courses found.
              </div>
            ) : (
              enrolledCourses.map(course => (
                <div key={course.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="badge badge-primary">{course.code}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {course.credits} Credits • {course.department || 'Computer Science'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {course.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Instructor: <strong>{course.faculty_name}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/student/courses/${course.id}/materials`)}
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <span>Open Course Materials</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Modules List */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Sequential Modules ({course.modules?.length || 0})
                    </div>

                    {(course.modules || []).length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {course.modules.map((mod, mIdx) => (
                          <div
                            key={mod.id || mIdx}
                            style={{
                              padding: '0.85rem',
                              backgroundColor: '#f8fafc',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                                Module {mod.sequence_order || mIdx + 1}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Clock size={12} /> {mod.duration || '1 Week'}
                              </span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                              {mod.title}
                            </div>
                            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                              {mod.description || 'Core lecture materials and practice resources.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        General course module: Complete syllabus available in Course Materials.
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: CLASS TIMETABLE INTEGRATION */}
      {(activeTab === 'all' || activeTab === 'timetable') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Calendar size={18} color="var(--primary)" />
                Weekly Class Timetable Schedule
              </h3>
              <p className="card-subtitle">
                Scheduled lecture halls, lab sessions, and timing windows for your enrolled courses
              </p>
            </div>
            <button
              onClick={() => navigate('/student/timetable')}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <span>Full Timetable View</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time Window</th>
                  <th>Course / Subject</th>
                  <th>Cohort Section</th>
                  <th>Hall / Room</th>
                  <th>Instructor</th>
                </tr>
              </thead>
              <tbody>
                {timetableSlots.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No timetable slots configured for your enrolled courses yet.
                    </td>
                  </tr>
                ) : (
                  timetableSlots.map(slot => (
                    <tr key={slot.id}>
                      <td>
                        <span className="badge badge-primary">{slot.day || slot.day_of_week}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                          <Clock size={13} color="var(--primary)" />
                          <span>{slot.start_time} - {slot.end_time}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{slot.course_code}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{slot.course_title}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{slot.section || slot.class_section || 'Section A'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={13} color="#f59e0b" />
                          <span>{slot.room}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <User size={13} color="#10b981" />
                          <span>{slot.faculty_name}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: ASSIGNMENTS & RELEVANT DEADLINES */}
      {(activeTab === 'all' || activeTab === 'assignments') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <FileSpreadsheet size={18} color="var(--primary)" />
                Assignments &amp; Relevant Deadlines
              </h3>
              <p className="card-subtitle">
                Coursework problem statements, prompt file downloads, and upcoming submission due dates
              </p>
            </div>
            <button
              onClick={() => navigate('/student/assignments')}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <span>All Assignments</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Assignment Title</th>
                  <th>Deadline / Due Date</th>
                  <th>Max Points</th>
                  <th>Question File</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignmentsList.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No active assignments published for your courses.
                    </td>
                  </tr>
                ) : (
                  assignmentsList.map(asg => (
                    <tr key={asg.id}>
                      <td>
                        <span className="badge badge-primary">{asg.course_code}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{asg.title}</div>
                        <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {asg.description}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                          <Calendar size={13} color="var(--danger)" />
                          <span>{asg.due_display || asg.due_date}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{asg.max_marks} Pts</span>
                      </td>
                      <td>
                        {asg.attachment_path ? (
                          <a
                            href={asg.attachment_path.startsWith('http') ? asg.attachment_path : `http://localhost:8000${asg.attachment_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          >
                            <Download size={12} />
                            <span>{asg.attachment_name || 'Question File'}</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None attached</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            asg.status === 'Graded'
                              ? 'badge-success'
                              : asg.status === 'Submitted'
                              ? 'badge-info'
                              : asg.status === 'Overdue'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {asg.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/student/assignments/${asg.id}/submit`)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                        >
                          {asg.is_submitted ? 'View Submission' : 'Submit'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: AI RECOMMENDED WEEKLY STUDY SCHEDULE */}
      {(activeTab === 'all' || activeTab === 'schedule') && (
        <div id="study-plan-schedule" className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CheckSquare size={18} color="var(--primary)" />
                AI Recommended Weekly Study Plan Schedule
              </h3>
              <p className="card-subtitle">
                Synthesized to balance your lectures, pending assignments, and concept revision targets
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Focus Subject</th>
                  <th>Target Learning Task</th>
                  <th>Estimated Time</th>
                  <th>Priority</th>
                  <th>Execution Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.map((item, idx) => {
                  const isDone = completedDrills[idx];
                  return (
                    <tr key={idx} style={{ opacity: isDone ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 700 }}>{item.day}</td>
                      <td>
                        <span className="badge badge-neutral">{item.focus}</span>
                      </td>
                      <td style={{ fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none' }}>
                        {item.task}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <Clock size={13} /> {item.time}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.priority === 'Critical'
                              ? 'badge-danger'
                              : item.priority === 'High'
                              ? 'badge-warning'
                              : 'badge-primary'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleDrillComplete(idx)}
                          className={`btn btn-sm ${isDone ? 'btn-success' : 'btn-outline'}`}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          {isDone ? (
                            <>
                              <Check size={12} /> Completed
                            </>
                          ) : (
                            'Mark Done'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: REMEDIAL RECOMMENDATION MODULES */}
      {(activeTab === 'all' || activeTab === 'schedule') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Adaptive Remediation Recommendations
          </h3>
          <div className="grid-3">
            {safeRecommendations.length === 0 ? (
              <div className="card" style={{ gridColumn: 'span 3', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active remediation items required. All subject areas are performing within safe benchmark ranges!
              </div>
            ) : (
              safeRecommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} onOpenStudyPlan={handleOpenStudyPlan} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Interactive Micro-Drill Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <span className="badge badge-info" style={{ marginBottom: '0.4rem' }}>
            5-Minute Rapid Intervention
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0369a1' }}>
            Test Your Knowledge: Remediation &amp; Algorithmic Drill
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#0c4a6e', maxWidth: '600px' }}>
            Quick 5-question micro-quiz to reinforce network addressing and algorithmic complexity optimization.
          </p>
        </div>

        <button
          onClick={handleOpenDrill}
          className="btn btn-primary"
        >
          <Play size={16} /> Start 5-Min Drill
        </button>
      </div>

      {/* Interactive 5-Minute Drill Modal */}
      {isDrillOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span className="badge badge-purple">5-Min Rapid Drill</span>
                  <span className="badge badge-neutral">Cognitive Check</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Targeted Weakness Remediation Drill
                </h3>
              </div>
              <button
                onClick={() => setIsDrillOpen(false)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
            </div>

            {/* Drill Results Banner */}
            {drillResult && (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: drillResult.percentage >= 70 ? 'var(--success-light)' : 'var(--warning-light)',
                  border: `1px solid ${drillResult.percentage >= 70 ? 'var(--success-border)' : 'var(--warning-border)'}`,
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 800, color: drillResult.percentage >= 70 ? '#065f46' : '#92400e' }}>
                    {drillResult.summary}
                  </h4>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: drillResult.percentage >= 70 ? '#065f46' : '#92400e' }}>
                    {drillResult.score} / {drillResult.total}
                  </span>
                </div>
                {drillResult.weak_topics?.length > 0 && (
                  <p style={{ fontSize: '0.85rem', color: '#92400e', marginTop: '0.35rem' }}>
                    <strong>Detected Focus Areas: </strong> {drillResult.weak_topics.join(', ')}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmitDrill}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {drillQuestions.map((q, qIndex) => {
                  const feedbackItem = drillResult?.feedback?.find(f => f.question_index === qIndex);
                  return (
                    <div
                      key={qIndex}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-main)',
                        borderRadius: 'var(--radius-md)',
                        border: feedbackItem
                          ? (feedbackItem.is_correct ? '1px solid var(--success-border)' : '1px solid var(--danger-border)')
                          : '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                        Q{qIndex + 1}. {q.question}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.options.map((opt, optIndex) => {
                          const isSelected = drillAnswers[qIndex] === optIndex;
                          let optBg = '#ffffff';
                          let optBorder = 'var(--border-color)';

                          if (drillResult) {
                            if (optIndex === feedbackItem?.correct_option) {
                              optBg = 'var(--success-light)';
                              optBorder = 'var(--success-border)';
                            } else if (isSelected && !feedbackItem?.is_correct) {
                              optBg = 'var(--danger-light)';
                              optBorder = 'var(--danger-border)';
                            }
                          } else if (isSelected) {
                            optBg = '#eff6ff';
                            optBorder = 'var(--primary)';
                          }

                          return (
                            <label
                              key={optIndex}
                              onClick={() => handleSelectDrillAnswer(qIndex, optIndex)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.65rem',
                                padding: '0.6rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid ${optBorder}`,
                                backgroundColor: optBg,
                                cursor: drillResult ? 'default' : 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              <input
                                type="radio"
                                name={`q_${qIndex}`}
                                checked={isSelected}
                                onChange={() => handleSelectDrillAnswer(qIndex, optIndex)}
                                disabled={drillResult !== null}
                                style={{ accentColor: 'var(--primary)' }}
                              />
                              <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {feedbackItem && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.65rem',
                            backgroundColor: '#ffffff',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `3px solid ${feedbackItem.is_correct ? 'var(--success)' : 'var(--danger)'}`,
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)'
                          }}
                        >
                          <strong>Explanation:</strong> {feedbackItem.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!drillResult ? (
                <button
                  type="submit"
                  disabled={submittingDrill || Object.keys(drillAnswers).length < drillQuestions.length}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
                >
                  {submittingDrill ? (
                    <LoadingSpinner message="Scoring Drill with AI..." size={16} centered={false} />
                  ) : (
                    `Submit Drill for Instant AI Grading (${Object.keys(drillAnswers).length}/${drillQuestions.length} Answered)`
                  )}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => { setDrillAnswers({}); setDrillResult(null); }}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Retake Drill
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrillOpen(false)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Done &amp; Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyRecommendations;
