// Comprehensive mock dataset for AI LMS and Analytics System

export const MOCK_USERS = {
  student: {
    id: 'std_101',
    name: 'Alex Morgan',
    email: 'alex.morgan@university.edu',
    role: 'student',
    rollNo: 'CS2023-048',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    batch: '2022-2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cgpa: '8.72',
    phone: '+1 (555) 234-5678',
    address: 'Campus Hostel 4, Room 312, Tech University'
  },
  teacher: {
    id: 'tch_201',
    name: 'Prof. Katherine Reed',
    email: 'k.reed@university.edu',
    role: 'teacher',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    facultyId: 'FAC-CS-109',
    specialization: 'Artificial Intelligence & Data Structures',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 987-6543'
  },
  admin: {
    id: 'adm_001',
    name: 'Dr. Robert Vance',
    email: 'admin.vance@university.edu',
    role: 'admin',
    designation: 'Dean of Academic Affairs & Systems Admin',
    department: 'Academic Administration',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7890'
  }
};

export const MOCK_STUDENT_METRICS = {
  overallPercentage: 86.4,
  averageMarks: 84.2,
  attendancePercentage: 91.5,
  improvementRate: '+14.2%',
  totalAssignments: 18,
  completedAssignments: 15,
  pendingAssignments: 3,
  strongSubjects: [
    { name: 'Data Structures & Algorithms', score: 93, grade: 'A+', icon: 'Code' },
    { name: 'Machine Learning', score: 89, grade: 'A', icon: 'Brain' },
    { name: 'Database Management Systems', score: 86, grade: 'A', icon: 'Database' }
  ],
  weakSubjects: [
    { name: 'Computer Networks', score: 68, grade: 'C+', needHelp: true, priority: 'High' },
    { name: 'Theory of Computation', score: 64, grade: 'C', needHelp: true, priority: 'Critical' }
  ],
  recentAssignments: [
    { id: 'asg_01', title: 'Dynamic Programming & Graph Optimizations', subject: 'Data Structures', score: 96, maxScore: 100, status: 'Graded', submittedDate: '2026-03-01' },
    { id: 'asg_02', title: 'CNN Architecture for Image Classification', subject: 'Machine Learning', score: 88, maxScore: 100, status: 'Graded', submittedDate: '2026-02-24' },
    { id: 'asg_03', title: 'SQL Query Optimization & Normalization', subject: 'DBMS', score: 84, maxScore: 100, status: 'Graded', submittedDate: '2026-02-18' },
    { id: 'asg_04', title: 'TCP Congestion Control Simulation', subject: 'Computer Networks', score: 67, maxScore: 100, status: 'Graded', submittedDate: '2026-02-10' }
  ],
  performanceTrend: [
    { month: 'Sep', studentScore: 74, classAverage: 71 },
    { month: 'Oct', studentScore: 78, classAverage: 73 },
    { month: 'Nov', studentScore: 81, classAverage: 75 },
    { month: 'Dec', studentScore: 83, classAverage: 76 },
    { month: 'Jan', studentScore: 84, classAverage: 78 },
    { month: 'Feb', studentScore: 89, classAverage: 79 },
    { month: 'Mar', studentScore: 92, classAverage: 80 }
  ],
  aiRecommendations: [
    {
      id: 'rec_1',
      title: 'Master TCP Congestion Algorithms',
      subject: 'Computer Networks',
      category: 'Concept Review',
      priority: 'High',
      difficulty: 'Medium',
      estimatedHours: '3.5 hrs',
      description: 'Your recent quiz identified confusion between Tahoe, Reno, and CUBIC congestion control mechanisms. Review sliding window calculations.',
      actionUrl: '/student/recommendations'
    },
    {
      id: 'rec_2',
      title: 'Practice Turing Machine Reduction Proofs',
      subject: 'Theory of Computation',
      category: 'Problem Set',
      priority: 'Critical',
      difficulty: 'Hard',
      estimatedHours: '4.0 hrs',
      description: 'AI model predicts a 25% risk in upcoming midterms for Undecidability proofs. Recommended: 8 step-by-step reduction drills.',
      actionUrl: '/student/recommendations'
    },
    {
      id: 'rec_3',
      title: 'Advanced Heuristics in A* Search',
      subject: 'Machine Learning & AI',
      category: 'Strengths Booster',
      priority: 'Low',
      difficulty: 'Medium',
      estimatedHours: '2.0 hrs',
      description: 'You excel at tree search algorithms. Explore admissibility and consistency of heuristics for bonus capstone credit.',
      actionUrl: '/student/recommendations'
    }
  ]
};

export const MOCK_PERFORMANCE_ANALYTICS = {
  subjectMarks: [
    { subject: 'DSA', fullSubject: 'Data Structures & Algorithms', marks: 93, average: 76, maxMarks: 100 },
    { subject: 'ML', fullSubject: 'Machine Learning', marks: 89, average: 74, maxMarks: 100 },
    { subject: 'DBMS', fullSubject: 'Database Systems', marks: 86, average: 77, maxMarks: 100 },
    { subject: 'OS', fullSubject: 'Operating Systems', marks: 81, average: 72, maxMarks: 100 },
    { subject: 'CN', fullSubject: 'Computer Networks', marks: 68, average: 70, maxMarks: 100 },
    { subject: 'TOC', fullSubject: 'Theory of Computation', marks: 64, average: 66, maxMarks: 100 }
  ],
  topicMarks: [
    { topic: 'Dynamic Programming', subject: 'DSA', score: 95, status: 'Strong' },
    { topic: 'Graph Theory', subject: 'DSA', score: 92, status: 'Strong' },
    { topic: 'Neural Networks', subject: 'ML', score: 88, status: 'Strong' },
    { topic: 'Indexing & B+ Trees', subject: 'DBMS', score: 87, status: 'Strong' },
    { topic: 'Process Scheduling', subject: 'OS', score: 83, status: 'Moderate' },
    { topic: 'Paging & Virtual Memory', subject: 'OS', score: 78, status: 'Moderate' },
    { topic: 'Routing Protocols (BGP/OSPF)', subject: 'CN', score: 69, status: 'Weak' },
    { topic: 'Subnetting & CIDR', subject: 'CN', score: 62, status: 'Weak' },
    { topic: 'Context-Free Grammars', subject: 'TOC', score: 66, status: 'Weak' },
    { topic: 'Turing Machines & Decidability', subject: 'TOC', score: 58, status: 'Weak' }
  ],
  strongTopics: [
    { name: 'Dynamic Programming & Memoization', subject: 'DSA', mastery: '95%', tag: 'Advanced' },
    { name: 'Graph Traversal & Shortest Paths', subject: 'DSA', mastery: '92%', tag: 'Advanced' },
    { name: 'Convolutional Neural Networks', subject: 'ML', mastery: '88%', tag: 'Proficient' },
    { name: 'Relational Schema Normalization', subject: 'DBMS', mastery: '87%', tag: 'Proficient' }
  ],
  weakTopics: [
    { name: 'Turing Machines & Halting Problem', subject: 'TOC', mastery: '58%', tag: 'Action Required', urgency: 'Immediate' },
    { name: 'IP Subnet Masking & CIDR Math', subject: 'CN', mastery: '62%', tag: 'Action Required', urgency: 'High' },
    { name: 'Chomsky Normal Form Conversions', subject: 'TOC', mastery: '66%', tag: 'Review Suggested', urgency: 'Medium' },
    { name: 'OSPF vs BGP Routing Metric calculations', subject: 'CN', mastery: '69%', tag: 'Review Suggested', urgency: 'Medium' }
  ],
  improvementMetrics: {
    percentageGain: 14.2,
    studyHoursLogged: 84,
    problemSetsSolved: 142,
    percentileRank: 'Top 8.5%'
  },
  skillRadar: [
    { subject: 'Coding Proficiency', student: 94, benchmark: 75 },
    { subject: 'Algorithmic Logic', student: 91, benchmark: 72 },
    { subject: 'System Design', student: 79, benchmark: 70 },
    { subject: 'Theoretical Proofs', student: 61, benchmark: 68 },
    { subject: 'Networking Protocols', student: 66, benchmark: 74 },
    { subject: 'Database Architecture', student: 86, benchmark: 76 }
  ]
};

export const MOCK_MARKS_DATA = [
  { id: 1, code: 'CS601', name: 'Data Structures & Algorithms', credits: 4, internal: 29, midterm: 28, endsem: 37, total: 94, max: 100, grade: 'O', status: 'Passed' },
  { id: 2, code: 'CS602', name: 'Machine Learning', credits: 4, internal: 28, midterm: 26, endsem: 35, total: 89, max: 100, grade: 'A+', status: 'Passed' },
  { id: 3, code: 'CS603', name: 'Database Management Systems', credits: 3, internal: 27, midterm: 25, endsem: 34, total: 86, max: 100, grade: 'A+', status: 'Passed' },
  { id: 4, code: 'CS604', name: 'Operating Systems', credits: 4, internal: 25, midterm: 24, endsem: 32, total: 81, max: 100, grade: 'A', status: 'Passed' },
  { id: 5, code: 'CS605', name: 'Computer Networks', credits: 3, internal: 21, midterm: 20, endsem: 27, total: 68, max: 100, grade: 'B', status: 'Passed' },
  { id: 6, code: 'CS606', name: 'Theory of Computation', credits: 3, internal: 20, midterm: 18, endsem: 26, total: 64, max: 100, grade: 'B', status: 'Passed' },
  { id: 7, code: 'CS607L', name: 'Machine Learning Lab', credits: 2, internal: 48, midterm: 0, endsem: 47, total: 95, max: 100, grade: 'O', status: 'Passed' }
];

export const MOCK_ASSIGNMENTS = [
  {
    id: 'asg-101',
    title: 'Distributed Hash Table Implementation',
    subject: 'Data Structures & Algorithms',
    code: 'CS601',
    dueDate: '2026-03-25',
    maxMarks: 100,
    status: 'Pending',
    description: 'Implement a consistent hashing algorithm for distributed key-value storage with replication factor of 3.',
    difficulty: 'Hard',
    submissionType: 'Code Zip / Git Link'
  },
  {
    id: 'asg-102',
    title: 'Transformer Attention Mechanism Analysis',
    subject: 'Machine Learning',
    code: 'CS602',
    dueDate: '2026-03-28',
    maxMarks: 100,
    status: 'Pending',
    description: 'Write a detailed analytical breakdown of Self-Attention vs Multi-Head Attention equations with complexity analysis.',
    difficulty: 'Medium',
    submissionType: 'PDF Document'
  },
  {
    id: 'asg-103',
    title: 'Subnetting & VLAN Routing Simulation',
    subject: 'Computer Networks',
    code: 'CS605',
    dueDate: '2026-03-20',
    maxMarks: 50,
    status: 'Submitted',
    description: 'Configure Cisco Packet Tracer network topology for 4 departments with isolated VLANs and inter-VLAN routing.',
    difficulty: 'Medium',
    submissionType: 'Simulation File (.pkt)'
  },
  {
    id: 'asg-104',
    title: 'Dynamic Programming: Knapsack Variations',
    subject: 'Data Structures & Algorithms',
    code: 'CS601',
    dueDate: '2026-03-01',
    maxMarks: 100,
    status: 'Graded',
    grade: 96,
    feedbackAvailable: true,
    description: 'Solve 0/1 knapsack, fractional knapsack, and bounded knapsack using space-optimized dynamic programming.',
    difficulty: 'Hard',
    submissionType: 'Code'
  },
  {
    id: 'asg-105',
    title: 'Relational Database Schema for E-Commerce',
    subject: 'Database Management Systems',
    code: 'CS603',
    dueDate: '2026-02-18',
    maxMarks: 100,
    status: 'Graded',
    grade: 84,
    feedbackAvailable: true,
    description: 'Design BCNF normalized schema with indexing strategies for fast analytical read-heavy queries.',
    difficulty: 'Medium',
    submissionType: 'SQL Script'
  }
];

export const MOCK_AI_FEEDBACK = {
  assignmentId: 'asg-104',
  title: 'Dynamic Programming: Knapsack Variations',
  score: 96,
  maxScore: 100,
  rubricScores: [
    { criterion: 'Algorithmic Correctness', score: 39, max: 40, percentage: 97.5 },
    { criterion: 'Time & Space Optimization', score: 29, max: 30, percentage: 96.6 },
    { criterion: 'Code Modularity & Style', score: 18, max: 20, percentage: 90.0 },
    { criterion: 'Edge Case & Robustness', score: 10, max: 10, percentage: 100.0 }
  ],
  summary: 'Outstanding submission! The space-optimized 1D array approach for the 0/1 knapsack variant demonstrates thorough conceptual mastery. The transition functions and recurrence explanations were mathematically sound.',
  strengths: [
    'Reduced memory footprint from O(N*W) down to O(W) using reverse loop traversal.',
    'Clear corner-case handling for zero weights, exceeding capacities, and negative value validations.',
    'Well-annotated complexity trade-off documentation.'
  ],
  improvements: [
    'Add unit test coverage for fractional decimal inputs in the continuous knapsack solver.',
    'Modularize helper methods into a standalone optimization utility class.'
  ],
  suggestedReadings: [
    { title: 'Advanced Bitmask Dynamic Programming', link: 'https://cp-algorithms.com' },
    { title: 'Tree DP & Rerooting Techniques', link: 'https://leetcode.com' }
  ]
};

export const MOCK_ATTENDANCE = {
  overallPercentage: 91.5,
  totalClasses: 212,
  attendedClasses: 194,
  missedClasses: 18,
  minRequiredPercentage: 75,
  subjects: [
    { code: 'CS601', name: 'Data Structures & Algorithms', total: 42, attended: 40, percentage: 95.2, status: 'Safe' },
    { code: 'CS602', name: 'Machine Learning', total: 38, attended: 36, percentage: 94.7, status: 'Safe' },
    { code: 'CS603', name: 'Database Management Systems', total: 34, attended: 31, percentage: 91.1, status: 'Safe' },
    { code: 'CS604', name: 'Operating Systems', total: 36, attended: 33, percentage: 91.6, status: 'Safe' },
    { code: 'CS605', name: 'Computer Networks', total: 32, attended: 28, percentage: 87.5, status: 'Safe' },
    { code: 'CS606', name: 'Theory of Computation', total: 30, attended: 26, percentage: 86.6, status: 'Safe' }
  ],
  monthlyTrend: [
    { month: 'Sep', percentage: 96 },
    { month: 'Oct', percentage: 93 },
    { month: 'Nov', percentage: 89 },
    { month: 'Dec', percentage: 92 },
    { month: 'Jan', percentage: 90 },
    { month: 'Feb', percentage: 92 },
    { month: 'Mar', percentage: 94 }
  ]
};

export const MOCK_TEACHER_DATA = {
  overview: {
    totalStudents: 64,
    averageClassScore: 78.4,
    pendingSubmissionsCount: 14,
    atRiskStudentsCount: 6,
    activeAssignmentsCount: 4
  },
  students: [
    { id: 'std_101', rollNo: 'CS2023-048', name: 'Alex Morgan', marksAvg: 86.4, attendance: 91.5, status: 'Good', atRisk: false },
    { id: 'std_102', rollNo: 'CS2023-012', name: 'Brian Chen', marksAvg: 92.1, attendance: 96.0, status: 'Top Performer', atRisk: false },
    { id: 'std_103', rollNo: 'CS2023-019', name: 'Chloe Davis', marksAvg: 59.2, attendance: 68.0, status: 'Critical', atRisk: true, reason: 'Low attendance & failing midterm' },
    { id: 'std_104', rollNo: 'CS2023-033', name: 'Daniel Miller', marksAvg: 64.5, attendance: 72.0, status: 'At Risk', atRisk: true, reason: 'Consecutive low scores in Networks' },
    { id: 'std_105', rollNo: 'CS2023-041', name: 'Elena Rostova', marksAvg: 88.3, attendance: 94.2, status: 'Good', atRisk: false },
    { id: 'std_106', rollNo: 'CS2023-055', name: 'Farhan Zaidi', marksAvg: 76.8, attendance: 88.0, status: 'Average', atRisk: false }
  ],
  gradeDistribution: [
    { grade: 'O (90-100)', count: 12, percentage: 18.75 },
    { grade: 'A+ (80-89)', count: 24, percentage: 37.5 },
    { grade: 'A (70-79)', count: 16, percentage: 25.0 },
    { grade: 'B (60-69)', count: 8, percentage: 12.5 },
    { grade: 'Below 60', count: 4, percentage: 6.25 }
  ],
  submissionsToReview: [
    { id: 'sub_1', studentName: 'Alex Morgan', rollNo: 'CS2023-048', assignmentTitle: 'Subnetting & VLAN Routing Simulation', submittedOn: '2026-03-08', aiConfidence: '92%', aiSuggestedScore: 46, status: 'Pending Review' },
    { id: 'sub_2', studentName: 'Brian Chen', rollNo: 'CS2023-012', assignmentTitle: 'Subnetting & VLAN Routing Simulation', submittedOn: '2026-03-07', aiConfidence: '96%', aiSuggestedScore: 49, status: 'Pending Review' },
    { id: 'sub_3', studentName: 'Chloe Davis', rollNo: 'CS2023-019', assignmentTitle: 'Subnetting & VLAN Routing Simulation', submittedOn: '2026-03-09', aiConfidence: '84%', aiSuggestedScore: 32, status: 'Needs Teacher Intervention' }
  ]
};

export const MOCK_ADMIN_DATA = {
  stats: {
    totalUsers: 1420,
    totalStudents: 1250,
    totalTeachers: 85,
    totalCourses: 48,
    systemUptime: '99.98%',
    aiApiStatus: 'Operational (24ms latency)'
  },
  recentAudits: [
    { id: 1, action: 'Bulk Grade Publish', actor: 'Prof. Katherine Reed', time: '10 mins ago', type: 'info' },
    { id: 2, action: 'User Role Update: Student std_101', actor: 'Dr. Robert Vance', time: '1 hour ago', type: 'warning' },
    { id: 3, action: 'New Course Registered: CS702 AI Ethics', actor: 'Dr. Robert Vance', time: '3 hours ago', type: 'success' },
    { id: 4, action: 'Automated Backup Generated', actor: 'System Daemon', time: '6 hours ago', type: 'info' }
  ],
  allUsers: [
    { id: 'std_101', name: 'Alex Morgan', email: 'alex.morgan@university.edu', role: 'student', dept: 'CSE', status: 'Active' },
    { id: 'std_102', name: 'Brian Chen', email: 'brian.chen@university.edu', role: 'student', dept: 'CSE', status: 'Active' },
    { id: 'std_103', name: 'Chloe Davis', email: 'chloe.davis@university.edu', role: 'student', dept: 'CSE', status: 'Active' },
    { id: 'tch_201', name: 'Prof. Katherine Reed', email: 'k.reed@university.edu', role: 'teacher', dept: 'CSE', status: 'Active' },
    { id: 'tch_202', name: 'Dr. Marcus Holloway', email: 'm.holloway@university.edu', role: 'teacher', dept: 'ECE', status: 'Active' },
    { id: 'adm_001', name: 'Dr. Robert Vance', email: 'admin.vance@university.edu', role: 'admin', dept: 'Administration', status: 'Active' }
  ],
  subjectsList: [
    { code: 'CS601', name: 'Data Structures & Algorithms', department: 'Computer Science', credits: 4, faculty: 'Prof. Katherine Reed', studentsCount: 64 },
    { code: 'CS602', name: 'Machine Learning', department: 'Computer Science', credits: 4, faculty: 'Prof. Katherine Reed', studentsCount: 64 },
    { code: 'CS603', name: 'Database Management Systems', department: 'Computer Science', credits: 3, faculty: 'Dr. Anita Sharma', studentsCount: 64 },
    { code: 'CS604', name: 'Operating Systems', department: 'Computer Science', credits: 4, faculty: 'Prof. David Lin', studentsCount: 64 },
    { code: 'CS605', name: 'Computer Networks', department: 'Computer Science', credits: 3, faculty: 'Dr. Marcus Holloway', studentsCount: 64 },
    { code: 'CS606', name: 'Theory of Computation', department: 'Computer Science', credits: 3, faculty: 'Dr. Sarah Connor', studentsCount: 64 }
  ]
};
