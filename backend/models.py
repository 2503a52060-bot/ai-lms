from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # "student", "faculty", "admin"
    department = Column(String(100), default="Computer Science & Engineering")
    identifier = Column(String(50), nullable=True)  # Roll number or Employee ID
    avatar = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    semester = Column(String(50), nullable=True, default="3rd Semester")
    batch = Column(String(50), nullable=True, default="2024-2028")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="student", cascade="all, delete-orphan")
    taught_courses = relationship("Course", back_populates="faculty")
    attendances = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan", foreign_keys="AttendanceRecord.student_id")
    marks = relationship("Mark", back_populates="student", cascade="all, delete-orphan", foreign_keys="Mark.student_id")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    head_faculty_name = Column(String(100), nullable=True)


class ClassSection(Base):
    __tablename__ = "class_sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # e.g., "Section A"
    academic_year = Column(String(20), default="2025-2026")
    semester = Column(String(20), default="Fall 2026")
    department_name = Column(String(100), default="Computer Science & Engineering")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String(100), default="Computer Science & Engineering")
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    credits = Column(Integer, default=3)
    semester = Column(String(20), default="Semester 5")
    academic_year = Column(String(20), default="2025-2026")
    enrollment_start = Column(DateTime, nullable=True)
    enrollment_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    faculty = relationship("User", back_populates="taught_courses")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.sequence_order")
    resources = relationship("Resource", back_populates="course", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="course", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="course", cascade="all, delete-orphan")
    attendances = relationship("AttendanceRecord", back_populates="course", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(String(50), default="2 Weeks")  # e.g., "3 hours", "2 Weeks"
    sequence_order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="modules")
    resources = relationship("Resource", back_populates="module", cascade="all, delete-orphan")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    title = Column(String(150), nullable=False)
    resource_type = Column(String(20), default="file")  # "file" or "url"
    file_path = Column(String(255), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(String(50), nullable=True)
    file_type = Column(String(50), nullable=True)  # "pdf", "docx", "pptx", "image"
    url = Column(String(500), nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="resources")
    module = relationship("Module", back_populates="resources")


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=False)
    max_marks = Column(Integer, default=100)
    attachment_path = Column(String(255), nullable=True)
    attachment_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String(255), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(30), default="submitted")  # "submitted", "evaluated"

    # Faculty Final Evaluation
    marks_obtained = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    weak_topics = Column(Text, nullable=True)  # comma separated or json

    # AI Auto-Evaluation Suggestions
    ai_suggested_marks = Column(Float, nullable=True)
    ai_suggested_feedback = Column(Text, nullable=True)
    ai_suggested_weak_topics = Column(Text, nullable=True)
    ai_review_status = Column(String(30), default="pending")  # "pending", "approved", "rejected", "edited"

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(20), nullable=False)  # YYYY-MM-DD
    status = Column(String(20), default="Present")  # "Present", "Absent", "Late"
    marked_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    course = relationship("Course", back_populates="attendances")
    student = relationship("User", back_populates="attendances", foreign_keys=[student_id])


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(150), nullable=False)
    exam_type = Column(String(50), default="Midterm")  # "Midterm", "Final", "Quiz", "Unit Test"
    exam_date = Column(String(30), nullable=False)  # YYYY-MM-DD or formatted string
    total_marks = Column(Integer, default=100)
    room = Column(String(50), default="Hall 302")
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="exams")
    marks = relationship("Mark", back_populates="exam", cascade="all, delete-orphan")


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    marks_obtained = Column(Float, nullable=False)
    max_marks = Column(Float, default=100.0)
    remarks = Column(String(255), nullable=True)
    graded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    graded_at = Column(DateTime, default=datetime.utcnow)

    exam = relationship("Exam", back_populates="marks")
    student = relationship("User", back_populates="marks", foreign_keys=[student_id])


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    target_role = Column(String(20), default="all")  # "all", "student", "faculty"
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(20), default="Medium")  # Easy, Medium, Hard
    questions_json = Column(Text, nullable=False)  # JSON string of questions
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    answers_json = Column(Text, nullable=True)
    weak_topics_json = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("User", back_populates="quiz_attempts")


class TimetableSlot(Base):
    __tablename__ = "timetable_slots"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    class_section = Column(String(50), default="Section A")
    day_of_week = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    start_time = Column(String(20), nullable=False)   # 09:00 AM
    end_time = Column(String(20), nullable=False)     # 10:30 AM
    room = Column(String(50), default="Room 401")


class DoubtQuery(Base):
    __tablename__ = "doubt_queries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    topic = Column(String(100), default="General")
    created_at = Column(DateTime, default=datetime.utcnow)


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    target_hours = Column(Integer, default=15)
    weekly_schedule_json = Column(Text, nullable=True)
    weak_topics_json = Column(Text, nullable=True)
    recommendations_json = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
