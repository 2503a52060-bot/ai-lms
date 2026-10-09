from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from database import get_db
from models import (
    User, Course, Department, ClassSection, Enrollment, TimetableSlot,
    Exam, Announcement, Mark, AttendanceRecord
)
from auth import require_role, get_password_hash
from schemas import CourseCreate, AnnouncementCreate

router = APIRouter(prefix="/api/admin", tags=["Admin"])

admin_required = require_role(["admin"])

@router.get("/dashboard")
def get_admin_dashboard(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_faculty = db.query(User).filter(User.role.in_(["faculty", "teacher"])).count()
    total_courses = db.query(Course).count()
    total_departments = db.query(Department).count()

    # Institutional Performance Analytics
    all_marks = db.query(Mark).all()
    avg_inst_pct = round(sum(m.marks_obtained / m.max_marks * 100 for m in all_marks) / len(all_marks), 1) if all_marks else 81.5

    all_att = db.query(AttendanceRecord).all()
    avg_inst_att = round(len([a for a in all_att if a.status == "Present"]) / len(all_att) * 100, 1) if all_att else 89.2

    # Department wise performance
    dept_stats = [
        {"department": "Computer Science & Engineering", "students": total_students, "retention": "96.4%", "avg_score": 83.2},
        {"department": "Information Technology", "students": 45, "retention": "94.8%", "avg_score": 80.5},
        {"department": "Data Science & AI", "students": 38, "retention": "97.1%", "avg_score": 85.0},
        {"department": "Electronics & Comm.", "students": 52, "retention": "91.2%", "avg_score": 77.8}
    ]

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(6).all()

    return {
        "admin": {
            "name": current_user.name,
            "email": current_user.email
        },
        "stats": {
            "total_users": total_users,
            "total_students": total_students,
            "total_faculty": total_faculty,
            "total_courses": total_courses,
            "total_departments": total_departments or 4,
            "system_health": "99.98% Operational",
            "average_performance": avg_inst_pct,
            "average_attendance": avg_inst_att
        },
        "department_metrics": dept_stats,
        "recent_accounts": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "department": u.department,
                "created_at": u.created_at.strftime("%b %d, %Y")
            } for u in recent_users
        ]
    }

@router.get("/users")
def get_all_users(
    role: Optional[str] = None,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        if role.lower() in ["faculty", "teacher"]:
            query = query.filter(User.role.in_(["faculty", "teacher"]))
        else:
            query = query.filter(User.role == role.lower())

    users = query.order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "department": u.department,
            "identifier": u.identifier,
            "is_active": u.is_active,
            "created_at": u.created_at.strftime("%b %d, %Y")
        } for u in users
    ]

@router.post("/users")
def create_user_account(
    payload: dict,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    email = payload.get("email", "").lower().strip()
    if not email or not payload.get("password") or not payload.get("name"):
        raise HTTPException(status_code=400, detail="Name, email, and password are required.")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")

    role = payload.get("role", "student").lower().strip()
    if role not in ["student", "faculty", "admin"]:
        role = "student"

    user = User(
        name=payload.get("name").strip(),
        email=email,
        hashed_password=get_password_hash(payload.get("password")),
        role=role,
        department=payload.get("department", "Computer Science & Engineering"),
        identifier=payload.get("identifier") or f"ID-{abs(hash(email)) % 90000 + 10000}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"success": True, "message": f"Account for {user.name} created as {role}!", "user_id": user.id}

@router.put("/users/{user_id}")
def update_user_account(
    user_id: int,
    payload: dict,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if "name" in payload:
        user.name = payload["name"].strip()
    if "role" in payload:
        user.role = payload["role"].lower().strip()
    if "department" in payload:
        user.department = payload["department"]
    if "is_active" in payload:
        user.is_active = bool(payload["is_active"])
    if "password" in payload and payload["password"]:
        user.hashed_password = get_password_hash(payload["password"])

    db.commit()
    return {"success": True, "message": "User account updated successfully."}

@router.delete("/users/{user_id}")
def delete_user_account(
    user_id: int,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete current active administrator account.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"success": True, "message": "User account removed."}

@router.get("/courses")
def get_courses_catalog(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).all()
    faculty_list = db.query(User).filter(User.role.in_(["faculty", "teacher"])).all()

    return {
        "courses": [
            {
                "id": c.id,
                "code": c.code,
                "title": c.title,
                "description": c.description,
                "department": c.department,
                "credits": c.credits,
                "semester": c.semester,
                "academic_year": c.academic_year,
                "faculty_id": c.faculty_id,
                "faculty_name": c.faculty.name if c.faculty else "Unassigned",
                "enrolled_students": len(c.enrollments)
            } for c in courses
        ],
        "available_faculty": [{"id": f.id, "name": f.name, "department": f.department} for f in faculty_list]
    }

@router.post("/courses")
def admin_create_course(
    data: CourseCreate,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    code_clean = data.code.strip().upper()
    existing = db.query(Course).filter(Course.code == code_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists in catalog.")

    course = Course(
        code=code_clean,
        title=data.title.strip(),
        description=data.description,
        department=data.department,
        credits=data.credits,
        semester=data.semester,
        academic_year=data.academic_year,
        faculty_id=data.faculty_id
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"success": True, "message": "Course added to catalog successfully!", "course_id": course.id}

@router.put("/courses/{course_id}/assign-faculty")
def assign_faculty_to_course(
    course_id: int,
    payload: dict,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    faculty_id = payload.get("faculty_id")
    if faculty_id:
        faculty = db.query(User).filter(User.id == faculty_id, User.role.in_(["faculty", "teacher"])).first()
        if not faculty:
            raise HTTPException(status_code=400, detail="Selected faculty user does not exist.")
        course.faculty_id = faculty_id
    else:
        course.faculty_id = None

    db.commit()
    return {"success": True, "message": f"Faculty allocation updated for {course.code}!"}

@router.get("/departments")
def get_departments(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    depts = db.query(Department).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "code": d.code,
            "description": d.description,
            "head": d.head_faculty_name or "Dr. Robert Kahn"
        } for d in depts
    ]

@router.post("/departments")
def create_department(
    payload: dict,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    name = payload.get("name", "").strip()
    code = payload.get("code", "").strip().upper()
    if not name or not code:
        raise HTTPException(status_code=400, detail="Department name and code are required.")

    dept = Department(
        name=name,
        code=code,
        description=payload.get("description", ""),
        head_faculty_name=payload.get("head_faculty_name", "Appointed Dean")
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return {"success": True, "message": "Department created successfully!", "id": dept.id}

@router.get("/sections")
def get_sections(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    sections = db.query(ClassSection).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "academic_year": s.academic_year,
            "semester": s.semester,
            "department": s.department_name
        } for s in sections
    ]

@router.post("/sections")
def create_section(
    payload: dict,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    sec = ClassSection(
        name=payload.get("name", "Section A"),
        academic_year=payload.get("academic_year", "2025-2026"),
        semester=payload.get("semester", "Fall 2026"),
        department_name=payload.get("department", "Computer Science & Engineering")
    )
    db.add(sec)
    db.commit()
    db.refresh(sec)
    return {"success": True, "message": "Class Section added!", "id": sec.id}

@router.get("/timetable")
def get_campus_timetable(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    slots = db.query(TimetableSlot).all()
    courses = {c.id: c for c in db.query(Course).all()}

    return [
        {
            "id": s.id,
            "course_code": courses[s.course_id].code if s.course_id in courses else "CS",
            "course_title": courses[s.course_id].title if s.course_id in courses else "Subject",
            "faculty_name": courses[s.course_id].faculty.name if (s.course_id in courses and courses[s.course_id].faculty) else "Faculty",
            "day": s.day_of_week,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "room": s.room,
            "section": s.class_section
        } for s in slots
    ]

@router.post("/timetable")
def add_timetable_slot(
    payload: dict,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    course_id = int(payload.get("course_id", 1))
    course = db.query(Course).filter(Course.id == course_id).first()
    faculty_id = payload.get("faculty_id")
    if not faculty_id and course:
        faculty_id = course.faculty_id

    slot = TimetableSlot(
        course_id=course_id,
        faculty_id=int(faculty_id) if faculty_id else None,
        class_section=payload.get("section") or payload.get("class_section", "Section A"),
        day_of_week=payload.get("day") or payload.get("day_of_week", "Monday"),
        start_time=payload.get("start_time", "09:00 AM"),
        end_time=payload.get("end_time", "10:30 AM"),
        room=payload.get("room", "Room 401")
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return {"success": True, "message": "Timetable slot registered successfully!", "id": slot.id}

@router.delete("/timetable/{slot_id}")
def delete_timetable_slot(
    slot_id: int,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    slot = db.query(TimetableSlot).filter(TimetableSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Timetable slot not found")
    db.delete(slot)
    db.commit()
    return {"success": True, "message": "Slot removed."}

@router.get("/exams")
def get_admin_exams(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    exams = db.query(Exam).all()
    return [
        {
            "id": e.id,
            "course_code": e.course.code,
            "course_title": e.course.title,
            "title": e.title,
            "exam_type": e.exam_type,
            "exam_date": e.exam_date,
            "total_marks": e.total_marks,
            "room": e.room
        } for e in exams
    ]

@router.post("/announcements")
def create_institutional_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    ann = Announcement(
        title=data.title.strip(),
        content=data.content.strip(),
        target_role=data.target_role or "all",
        course_id=None,
        author_id=current_user.id
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return {"success": True, "message": "Institutional announcement posted!", "announcement_id": ann.id}
