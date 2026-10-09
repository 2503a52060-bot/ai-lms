import os
import json
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import (
    User, Department, ClassSection, Course, Enrollment, Module, Resource,
    Assignment, Submission, AttendanceRecord, Exam, Mark, Announcement,
    Notification, Quiz, QuizAttempt, TimetableSlot, StudyPlan
)
from auth import get_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def create_sample_file(filename: str, content: str):
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return path

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Ensure all core accounts exist with valid credentials
    core_users_data = [
        {"email": "admin@lms.edu", "name": "Dr. Eleanor Vance", "role": "admin", "password": "admin123", "department": "Academic Administration", "identifier": "ADM-001"},
        {"email": "faculty@lms.edu", "name": "Prof. Alan Turing", "role": "faculty", "password": "faculty123", "department": "Computer Science & Engineering", "identifier": "FAC-102"},
        {"email": "ada@lms.edu", "name": "Dr. Ada Lovelace", "role": "faculty", "password": "password123", "department": "Data Science & AI", "identifier": "FAC-105"},
        {"email": "student@lms.edu", "name": "Sowmya", "role": "student", "password": "student123", "department": "Computer Science & Engineering", "identifier": "CS-2024-042", "semester": "3rd Semester"},
        {"email": "marcus@lms.edu", "name": "Marcus Vance", "role": "student", "password": "student123", "department": "Computer Science & Engineering", "identifier": "CS-2024-043"},
        {"email": "aisha@lms.edu", "name": "Aisha Patel", "role": "student", "password": "student123", "department": "Computer Science & Engineering", "identifier": "CS-2024-044"},
    ]

    for cu in core_users_data:
        existing = db.query(User).filter(User.email == cu["email"]).first()
        if not existing:
            new_u = User(
                name=cu["name"],
                email=cu["email"],
                hashed_password=get_password_hash(cu["password"]),
                role=cu["role"],
                department=cu.get("department", "Computer Science & Engineering"),
                identifier=cu.get("identifier"),
                semester=cu.get("semester")
            )
            db.add(new_u)
            db.commit()

    # Check if courses/data already seeded
    if db.query(Course).first():
        print("Database already seeded with demo courses and academic data.")
        db.close()
        return

    print("Seeding LMS Database with complete demo accounts and academic data...")

    # Create dummy files for preview/download
    create_sample_file(
        "CS301_Module1_Notes.pdf",
        "%PDF-1.4\n1 0 obj\n<< /Title (CS301 Module 1: Asymptotic Analysis & Big-O Notation) /Author (Prof. Alan Turing) >>\nendobj\nStream: Complete lecture notes on time & space complexity, recurrence relations, and Master Theorem.\n%%EOF"
    )
    create_sample_file(
        "CS304_Database_Optimization_Guide.pdf",
        "%PDF-1.4\n1 0 obj\n<< /Title (CS304 Database Architecture & Query Plans) /Author (Prof. Alan Turing) >>\nendobj\nStream: B+ Tree index structures, clustered indexes, and query execution plans analysis.\n%%EOF"
    )
    create_sample_file(
        "Sophia_Assignment1_Submission.py",
        "# CS301 Dynamic Programming Submission by Sophia Martinez\n# Roll: CS-2024-042\n\ndef longest_common_subsequence(text1: str, text2: str) -> int:\n    m, n = len(text1), len(text2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if text1[i-1] == text2[j-1]:\n                dp[i][j] = 1 + dp[i-1][j-1]\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[m][n]\n"
    )

    # 1. USERS (Admin, Faculty, Student)
    admin = User(
        name="Dr. Eleanor Vance",
        email="admin@lms.edu",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        department="Academic Administration",
        identifier="ADM-001"
    )

    faculty_turing = User(
        name="Prof. Alan Turing",
        email="faculty@lms.edu",
        hashed_password=get_password_hash("faculty123"),
        role="faculty",
        department="Computer Science & Engineering",
        identifier="FAC-102"
    )

    faculty_lovelace = User(
        name="Dr. Ada Lovelace",
        email="ada@lms.edu",
        hashed_password=get_password_hash("password123"),
        role="faculty",
        department="Data Science & AI",
        identifier="FAC-105"
    )

    student_sophia = User(
        name="Sowmya",
        email="student@lms.edu",
        hashed_password=get_password_hash("student123"),
        role="student",
        department="Computer Science & Engineering",
        identifier="CS-2024-042",
        semester="3rd Semester"
    )

    student_marcus = User(
        name="Marcus Vance",
        email="marcus@lms.edu",
        hashed_password=get_password_hash("student123"),
        role="student",
        department="Computer Science & Engineering",
        identifier="CS-2024-043"
    )

    student_aisha = User(
        name="Aisha Patel",
        email="aisha@lms.edu",
        hashed_password=get_password_hash("student123"),
        role="student",
        department="Computer Science & Engineering",
        identifier="CS-2024-044"
    )

    db.add_all([admin, faculty_turing, faculty_lovelace, student_sophia, student_marcus, student_aisha])
    db.commit()

    # 2. DEPARTMENTS
    dept_cse = Department(
        name="Computer Science & Engineering",
        code="CSE",
        description="Core computing, algorithms, systems, and engineering.",
        head_faculty_name="Prof. Alan Turing"
    )
    dept_ai = Department(
        name="Data Science & Artificial Intelligence",
        code="DSAI",
        description="Machine learning, neural networks, predictive analytics.",
        head_faculty_name="Dr. Ada Lovelace"
    )
    dept_it = Department(
        name="Information Technology",
        code="IT",
        description="Network security, cloud computing, enterprise software.",
        head_faculty_name="Dr. Robert Kahn"
    )
    db.add_all([dept_cse, dept_ai, dept_it])
    db.commit()

    # 3. CLASS SECTIONS
    sec_a = ClassSection(name="CSE Section A", academic_year="2025-2026", semester="Semester 5", department_name="Computer Science & Engineering")
    sec_b = ClassSection(name="CSE Section B", academic_year="2025-2026", semester="Semester 5", department_name="Computer Science & Engineering")
    db.add_all([sec_a, sec_b])
    db.commit()

    # 4. COURSES
    now_dt = datetime.utcnow()
    course_ds = Course(
        code="CS301",
        title="Data Structures & Advanced Algorithms",
        description="Comprehensive study of algorithmic asymptotic efficiency, balanced tree variants, dynamic programming, and network flow optimization.",
        department="Computer Science & Engineering",
        credits=4,
        semester="Semester 5",
        academic_year="2025-2026",
        faculty_id=faculty_turing.id,
        enrollment_start=now_dt - timedelta(days=30),
        enrollment_end=now_dt + timedelta(days=60)
    )

    course_db = Course(
        code="CS304",
        title="Database Systems Architecture",
        description="Relational calculus, concurrency control mechanisms, ACID isolation, indexing algorithms, and scalable distributed storage engines.",
        department="Computer Science & Engineering",
        credits=3,
        semester="Semester 5",
        academic_year="2025-2026",
        faculty_id=faculty_turing.id,
        enrollment_start=now_dt - timedelta(days=30),
        enrollment_end=now_dt + timedelta(days=60)
    )

    course_ai = Course(
        code="CS402",
        title="Artificial Intelligence & Neural Systems",
        description="Supervised learning paradigms, gradient backpropagation, convolution kernels, attention models, and transformer architectures.",
        department="Data Science & AI",
        credits=4,
        semester="Semester 5",
        academic_year="2025-2026",
        faculty_id=faculty_lovelace.id,
        enrollment_start=now_dt - timedelta(days=30),
        enrollment_end=now_dt + timedelta(days=60)
    )

    course_cloud = Course(
        code="CS405",
        title="Cloud Infrastructure & Distributed Systems",
        description="Containerization, Kubernetes pod orchestration, microservices service meshes, and resilient cloud-native engineering.",
        department="Computer Science & Engineering",
        credits=3,
        semester="Semester 5",
        academic_year="2025-2026",
        faculty_id=faculty_turing.id,
        enrollment_start=now_dt - timedelta(days=30),
        enrollment_end=now_dt + timedelta(days=60)
    )

    db.add_all([course_ds, course_db, course_ai, course_cloud])
    db.commit()

    # 5. ENROLLMENTS
    for c in [course_ds, course_db, course_ai, course_cloud]:
        db.add(Enrollment(student_id=student_sophia.id, course_id=c.id))
        db.add(Enrollment(student_id=student_marcus.id, course_id=c.id))
        db.add(Enrollment(student_id=student_aisha.id, course_id=c.id))
    db.commit()

    # 6. SEQUENTIAL MODULES FOR CS301
    mod1 = Module(
        course_id=course_ds.id,
        title="Module 1: Asymptotic Analysis & Recurrence Relations",
        description="Big-O, Omega, and Theta notations. Solving divide-and-conquer recurrences using substitution, recursion trees, and Master Theorem.",
        duration="2 Weeks",
        sequence_order=1
    )
    mod2 = Module(
        course_id=course_ds.id,
        title="Module 2: Self-Balancing Trees (AVL & Red-Black Trees)",
        description="Binary search tree invariants, single and double rotations, AVL height balancing, and Red-Black tree insertion colorings.",
        duration="3 Weeks",
        sequence_order=2
    )
    mod3 = Module(
        course_id=course_ds.id,
        title="Module 3: Graph Traversal & Shortest Path Algorithms",
        description="Breadth-First and Depth-First Search, topological sorting, Dijkstra's single-source shortest path, and Bellman-Ford negative cycle detection.",
        duration="2.5 Weeks",
        sequence_order=3
    )
    mod4 = Module(
        course_id=course_ds.id,
        title="Module 4: Dynamic Programming & Optimal Substructure",
        description="Memoization versus tabulation, knapsack 0/1 variations, Matrix Chain Multiplication, and Longest Common Subsequence.",
        duration="3 Weeks",
        sequence_order=4
    )
    db.add_all([mod1, mod2, mod3, mod4])
    db.commit()

    # 7. RESOURCES (FILES & URLS)
    res1 = Resource(
        course_id=course_ds.id,
        module_id=mod1.id,
        title="CS301 Lecture 1 Notes: Complexity Bounds",
        resource_type="file",
        file_path="/uploads/CS301_Module1_Notes.pdf",
        file_name="CS301_Module1_Notes.pdf",
        file_size="420 KB",
        file_type="pdf",
        uploader_id=faculty_turing.id
    )
    res2 = Resource(
        course_id=course_ds.id,
        module_id=mod1.id,
        title="MIT 6.006 Lecture: Introduction to Algorithms",
        resource_type="url",
        url="https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
        uploader_id=faculty_turing.id
    )
    res3 = Resource(
        course_id=course_ds.id,
        module_id=mod2.id,
        title="Visualizing AVL Tree Rotations (Interactive Tool)",
        resource_type="url",
        url="https://www.cs.usfca.edu/~galles/visualization/AVLtree.html",
        uploader_id=faculty_turing.id
    )
    res4 = Resource(
        course_id=course_db.id,
        module_id=None,
        title="Database Optimization & Query Plans Reference Manual",
        resource_type="file",
        file_path="/uploads/CS304_Database_Optimization_Guide.pdf",
        file_name="CS304_Database_Optimization_Guide.pdf",
        file_size="850 KB",
        file_type="pdf",
        uploader_id=faculty_turing.id
    )
    video1 = Resource(
        course_id=course_ds.id,
        module_id=mod4.id,
        title="Dynamic Programming: 0/1 Knapsack & Memoization Patterns",
        resource_type="video",
        url="https://www.youtube.com/watch?v=oBt53YbR9Kk",
        uploader_id=faculty_turing.id
    )
    video2 = Resource(
        course_id=course_ds.id,
        module_id=mod3.id,
        title="Dijkstra's Algorithm & Priority Queue Implementations",
        resource_type="video",
        url="https://www.youtube.com/watch?v=bZkzH5x0Ikk",
        uploader_id=faculty_turing.id
    )
    video3 = Resource(
        course_id=course_db.id,
        module_id=None,
        title="B+ Tree Indexing Architecture & Deep Storage Mechanics",
        resource_type="video",
        url="https://www.youtube.com/watch?v=aZjYr87r1b8",
        uploader_id=faculty_turing.id
    )
    video4 = Resource(
        course_id=course_ai.id,
        module_id=None,
        title="Neural Networks & Backpropagation Calculus Explained",
        resource_type="video",
        url="https://www.youtube.com/watch?v=Ilg3gGewQ5U",
        uploader_id=faculty_lovelace.id
    )
    db.add_all([res1, res2, res3, res4, video1, video2, video3, video4])
    db.commit()

    # 8. ASSIGNMENTS
    asg1 = Assignment(
        course_id=course_ds.id,
        faculty_id=faculty_turing.id,
        title="Assignment 1: Dynamic Programming Memoization Lab",
        description="Implement optimal solution for Longest Common Subsequence and 0/1 Knapsack. Analyze space complexity optimizations to O(n).",
        due_date=datetime.utcnow() + timedelta(days=5),
        max_marks=100,
        attachment_path="/uploads/CS301_Module1_Notes.pdf",
        attachment_name="Assignment_Specification.pdf"
    )
    asg2 = Assignment(
        course_id=course_db.id,
        faculty_id=faculty_turing.id,
        title="Assignment 2: B+ Tree Indexing & EXPLAIN Query Plan Tuning",
        description="Simulate 1,000,000 record insertions on B+ Tree and benchmark clustered vs non-clustered scan latency.",
        due_date=datetime.utcnow() + timedelta(days=12),
        max_marks=100
    )
    asg3 = Assignment(
        course_id=course_ai.id,
        faculty_id=faculty_lovelace.id,
        title="Assignment 3: Neural Network Backpropagation from Scratch",
        description="Construct a 2-layer perceptron with Sigmoid & ReLU activations. Compute manual Jacobian derivations.",
        due_date=datetime.utcnow() + timedelta(days=18),
        max_marks=100
    )
    db.add_all([asg1, asg2, asg3])
    db.commit()

    # 9. SUBMISSION FOR ASG1 (STUDENT SOPHIA) - AI Evaluated, pending faculty review
    sub1 = Submission(
        assignment_id=asg1.id,
        student_id=student_sophia.id,
        file_path="/uploads/Sophia_Assignment1_Submission.py",
        file_name="Sophia_Assignment1_Submission.py",
        file_size="12 KB",
        notes="Implemented 2D table LCS and space-optimized rolling array for knapsack. Handled all boundary test cases.",
        submitted_at=datetime.utcnow() - timedelta(hours=4),
        status="submitted",
        ai_suggested_marks=92.0,
        ai_suggested_feedback="Exemplary implementation of LCS with clean modular structure. Space complexity reduction logic is verified correctly. Suggested improvement: add test cases for completely disjoint strings.",
        ai_suggested_weak_topics="Disjoint Sequence Edge Cases, Rolling Buffer Constraints",
        ai_review_status="pending"
    )
    db.add(sub1)
    db.commit()

    # 10. ATTENDANCE RECORDS (Past 10 days)
    for i in range(10):
        dt = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        db.add(AttendanceRecord(course_id=course_ds.id, student_id=student_sophia.id, date=dt, status="Present" if i != 3 else "Late", marked_by=faculty_turing.id))
        db.add(AttendanceRecord(course_id=course_db.id, student_id=student_sophia.id, date=dt, status="Present" if i != 7 else "Absent", marked_by=faculty_turing.id))
        db.add(AttendanceRecord(course_id=course_ai.id, student_id=student_sophia.id, date=dt, status="Present", marked_by=faculty_lovelace.id))

        db.add(AttendanceRecord(course_id=course_ds.id, student_id=student_marcus.id, date=dt, status="Absent" if i % 2 == 0 else "Present", marked_by=faculty_turing.id))
    db.commit()

    # 11. EXAMS & MARKS
    exam1 = Exam(
        course_id=course_ds.id,
        title="Midterm Examination: Algorithms",
        exam_type="Midterm",
        exam_date="2026-09-15",
        total_marks=100,
        room="Hall 402"
    )
    exam2 = Exam(
        course_id=course_db.id,
        title="Midterm Examination: Relational Architecture",
        exam_type="Midterm",
        exam_date="2026-09-20",
        total_marks=100,
        room="Hall 305"
    )
    exam3 = Exam(
        course_id=course_ai.id,
        title="Quiz 1: Deep Learning Foundations",
        exam_type="Quiz",
        exam_date="2026-09-28",
        total_marks=50,
        room="Lab 101"
    )
    db.add_all([exam1, exam2, exam3])
    db.commit()

    # Marks for Sophia
    db.add(Mark(exam_id=exam1.id, course_id=course_ds.id, student_id=student_sophia.id, marks_obtained=88.5, max_marks=100, remarks="Strong grasp of divide-and-conquer and amortized bounds.", graded_by=faculty_turing.id))
    db.add(Mark(exam_id=exam2.id, course_id=course_db.id, student_id=student_sophia.id, marks_obtained=82.0, max_marks=100, remarks="Review B+ tree split conditions.", graded_by=faculty_turing.id))
    db.add(Mark(exam_id=exam3.id, course_id=course_ai.id, student_id=student_sophia.id, marks_obtained=46.0, max_marks=50, remarks="Excellent understanding of backprop gradient flow.", graded_by=faculty_lovelace.id))

    # Marks for Marcus (needs improvement)
    db.add(Mark(exam_id=exam1.id, course_id=course_ds.id, student_id=student_marcus.id, marks_obtained=52.0, max_marks=100, remarks="Struggled with tree rotations and recurrence relations.", graded_by=faculty_turing.id))
    db.commit()

    # 12. CAMPUS TIMETABLE
    db.add(TimetableSlot(course_id=course_ds.id, faculty_id=faculty_turing.id, class_section="Section A", day_of_week="Monday", start_time="09:00 AM", end_time="10:30 AM", room="Lecture Hall 101"))
    db.add(TimetableSlot(course_id=course_db.id, faculty_id=faculty_turing.id, class_section="Section A", day_of_week="Monday", start_time="11:00 AM", end_time="12:30 PM", room="Lab 204"))
    db.add(TimetableSlot(course_id=course_ai.id, faculty_id=faculty_lovelace.id, class_section="Section A", day_of_week="Tuesday", start_time="10:00 AM", end_time="11:30 AM", room="Hall 302"))
    db.add(TimetableSlot(course_id=course_cloud.id, faculty_id=faculty_turing.id, class_section="Section A", day_of_week="Wednesday", start_time="02:00 PM", end_time="03:30 PM", room="Cloud Lab 3"))
    db.add(TimetableSlot(course_id=course_ds.id, faculty_id=faculty_turing.id, class_section="Section A", day_of_week="Thursday", start_time="09:00 AM", end_time="10:30 AM", room="Lecture Hall 101"))
    db.add(TimetableSlot(course_id=course_db.id, faculty_id=faculty_turing.id, class_section="Section A", day_of_week="Friday", start_time="10:30 AM", end_time="12:00 PM", room="Lab 204"))
    db.commit()

    # 13. ANNOUNCEMENTS
    ann1 = Announcement(
        title="Mid-Semester Examination Schedule Announced",
        content="The examination timetable for Fall 2026 has been published. Midterms begin on October 25th in designated academic halls.",
        target_role="all",
        author_id=admin.id
    )
    ann2 = Announcement(
        title="CS301: Assignment 1 Office Hours & Submission Guidelines",
        content="Prof. Alan Turing will hold extended office hours on Thursday from 3:00 PM to 5:00 PM to assist with DP recurrence state designs.",
        target_role="student",
        course_id=course_ds.id,
        author_id=faculty_turing.id
    )
    db.add_all([ann1, ann2])
    db.commit()

    # 14. NOTIFICATIONS
    notif1 = Notification(
        user_id=student_sophia.id,
        title="Assignment 1 Submitted",
        message="Your submission for 'Dynamic Programming Memoization Lab' has been received. AI preliminary scan has processed your solution.",
        link="/student/assignments"
    )
    notif2 = Notification(
        user_id=student_sophia.id,
        title="AI Study Plan Updated",
        message="Based on your recent marks, new practice challenges have been populated in your study plan.",
        link="/student/recommendations"
    )
    db.add_all([notif1, notif2])
    db.commit()

    # 15. PRE-POPULATED AI QUIZZES
    quiz_ds_questions = [
        {
            "question": "What is the worst-case time complexity of quicksort algorithm?",
            "options": ["O(n log n)", "O(n²)", "O(log n)", "O(n)"],
            "correct_answer": 1,
            "explanation": "When the chosen pivot is always the extreme element (e.g. sorted input with naive pivot), quicksort degrades to O(n²)."
        },
        {
            "question": "Which data structure uses LIFO (Last In First Out) principle?",
            "options": ["Queue", "Priority Queue", "Stack", "Binary Heap"],
            "correct_answer": 2,
            "explanation": "A Stack operates on Last-In First-Out semantics via push and pop operations."
        },
        {
            "question": "What is the average time complexity for searching a key in a balanced AVL tree?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            "correct_answer": 2,
            "explanation": "Balanced binary search trees maintain an O(log n) height invariant, ensuring logarithmic search."
        },
        {
            "question": "Which algorithm is commonly used to find the shortest path in a weighted graph with non-negative edge weights?",
            "options": ["Floyd-Warshall", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Bellman-Ford"],
            "correct_answer": 1,
            "explanation": "Dijkstra's algorithm greedily finds single-source shortest paths in O((V + E) log V) with a priority queue."
        },
        {
            "question": "In a hash table, which technique handles collisions by placing elements into a linked list at that bucket?",
            "options": ["Linear Probing", "Quadratic Probing", "Separate Chaining", "Double Hashing"],
            "correct_answer": 2,
            "explanation": "Separate chaining stores collisions as a linked list (or small tree) anchored at each hash bucket."
        }
    ]

    quiz1 = Quiz(
        course_id=course_ds.id,
        faculty_id=faculty_turing.id,
        title="AI Diagnostic: Data Structures Mastery",
        topic="Data Structures",
        difficulty="Medium",
        questions_json=json.dumps(quiz_ds_questions)
    )
    db.add(quiz1)
    db.commit()

    print("Database seeding completed successfully.")
    db.close()

if __name__ == "__main__":
    seed_database()
