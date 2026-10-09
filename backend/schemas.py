from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    email: str
    password: str
    role: Optional[str] = None  # optional hint or check

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"
    department: Optional[str] = "Computer Science & Engineering"
    identifier: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None
    identifier: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    semester: Optional[str] = None
    batch: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    semester: Optional[str] = None
    batch: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Course & Module Schemas ---
class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    duration: Optional[str] = "2 Weeks"
    sequence_order: Optional[int] = 1

class ModuleOut(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    duration: Optional[str]
    sequence_order: int
    resources: List[Any] = []

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    code: str
    title: str
    description: Optional[str] = None
    department: Optional[str] = "Computer Science & Engineering"
    credits: Optional[int] = 3
    semester: Optional[str] = "Semester 5"
    academic_year: Optional[str] = "2025-2026"
    faculty_id: Optional[int] = None
    enrollment_start: Optional[datetime] = None
    enrollment_end: Optional[datetime] = None

class CourseOut(BaseModel):
    id: int
    code: str
    title: str
    description: Optional[str]
    department: str
    credits: int
    semester: str
    academic_year: str
    faculty_id: Optional[int]
    faculty_name: Optional[str] = None
    student_count: Optional[int] = 0
    modules_count: Optional[int] = 0
    enrollment_start: Optional[datetime] = None
    enrollment_end: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Resource Schemas ---
class ResourceURLCreate(BaseModel):
    course_id: int
    module_id: Optional[int] = None
    title: str
    url: str

class VideoCreate(BaseModel):
    title: str
    url: str
    module_id: Optional[int] = None

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    module_id: Optional[int] = None

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    module_id: Optional[int] = None

class ResourceOut(BaseModel):
    id: int
    course_id: int
    module_id: Optional[int]
    title: str
    resource_type: str
    file_path: Optional[str]
    file_name: Optional[str]
    file_size: Optional[str]
    file_type: Optional[str]
    url: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# --- Assignment Schemas ---
class AssignmentCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    due_date: str # ISO string or YYYY-MM-DD
    max_marks: Optional[int] = 100

class AssignmentOut(BaseModel):
    id: int
    course_id: int
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    title: str
    description: Optional[str]
    due_date: datetime
    max_marks: int
    attachment_path: Optional[str]
    attachment_name: Optional[str]
    submissions_count: Optional[int] = 0
    submission: Optional[Any] = None

    class Config:
        from_attributes = True

# --- Submission Schemas ---
class SubmissionEvaluation(BaseModel):
    marks_obtained: float
    feedback: str
    weak_topics: Optional[str] = None
    action: Optional[str] = "approve"  # approve, edit, reject

# --- Attendance Schemas ---
class AttendanceEntry(BaseModel):
    student_id: int
    status: str # "Present", "Absent", "Late"

class AttendanceBulkSave(BaseModel):
    course_id: int
    date: str  # YYYY-MM-DD
    records: List[AttendanceEntry]

# --- Exam & Marks Schemas ---
class ExamCreate(BaseModel):
    course_id: int
    title: str
    exam_type: str = "Midterm"
    exam_date: str
    total_marks: int = 100
    room: Optional[str] = "Hall 302"

class MarkEntry(BaseModel):
    student_id: int
    marks_obtained: float
    remarks: Optional[str] = None

class MarkBulkSave(BaseModel):
    exam_id: int
    course_id: int
    marks: List[MarkEntry]

# --- Announcement Schemas ---
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target_role: Optional[str] = "all"
    course_id: Optional[int] = None

# --- AI & Doubt Schemas ---
class DoubtAsk(BaseModel):
    question: str
    topic: Optional[str] = "General"
    course_id: Optional[int] = None

class AIQuizGenerateRequest(BaseModel):
    course_id: Optional[int] = None
    topic: str
    difficulty: Optional[str] = "Medium"
    num_questions: Optional[int] = 5

class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: dict  # { question_index: selected_option }

class EnrollStudentsRequest(BaseModel):
    student_ids: List[int]
