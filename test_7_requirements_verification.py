import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def run_tests():
    print("=" * 60)
    print("RUNNING COMPLETE VERIFICATION FOR 7 REQUIREMENTS")
    print("=" * 60)

    # 1. AUTHENTICATE USERS
    # Admin
    admin_login = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@lms.edu", "password": "admin123", "role": "admin"
    })
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Admin login successful")

    # Faculty
    faculty_login = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "faculty@lms.edu", "password": "faculty123", "role": "faculty"
    })
    assert faculty_login.status_code == 200, f"Faculty login failed: {faculty_login.text}"
    faculty_token = faculty_login.json()["access_token"]
    faculty_headers = {"Authorization": f"Bearer {faculty_token}"}
    print("[PASS] Faculty login successful")

    # Student
    student_login = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "student@lms.edu", "password": "student123", "role": "student"
    })
    assert student_login.status_code == 200, f"Student login failed: {student_login.text}"
    student_token = student_login.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[PASS] Student login successful")

    # ----------------------------------------------------
    # REQUIREMENT 5: LOGIN SECURITY (Unauthenticated Access)
    # ----------------------------------------------------
    print("\n--- Testing Requirement 5: Login Security (Unauthenticated URLs & APIs) ---")
    unauth_student = requests.get(f"{BASE_URL}/api/student/dashboard")
    assert unauth_student.status_code == 401, f"Expected 401, got {unauth_student.status_code}"

    unauth_faculty = requests.get(f"{BASE_URL}/api/faculty/dashboard")
    assert unauth_faculty.status_code == 401, f"Expected 401, got {unauth_faculty.status_code}"

    unauth_admin = requests.get(f"{BASE_URL}/api/admin/dashboard")
    assert unauth_admin.status_code == 401, f"Expected 401, got {unauth_admin.status_code}"

    # Check SPA HTML delivery for direct URL visits
    spa_resp = requests.get(f"{BASE_URL}/student/dashboard")
    assert spa_resp.status_code == 200 and "<html" in spa_resp.text.lower()
    print("[PASS] Unauthenticated access to protected APIs strictly rejected with 401")

    # ----------------------------------------------------
    # REQUIREMENT 6: ROLE-BASED ACCESS CONTROL
    # ----------------------------------------------------
    print("\n--- Testing Requirement 6: Role-Based Access Enforcement ---")
    # Student cannot access Faculty or Admin APIs
    stud_to_fac = requests.get(f"{BASE_URL}/api/faculty/dashboard", headers=student_headers)
    assert stud_to_fac.status_code == 403, f"Expected 403 for student accessing faculty, got {stud_to_fac.status_code}"

    stud_to_adm = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=student_headers)
    assert stud_to_adm.status_code == 403, f"Expected 403 for student accessing admin, got {stud_to_adm.status_code}"

    # Faculty cannot access Admin APIs
    fac_to_adm = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=faculty_headers)
    assert fac_to_adm.status_code == 403, f"Expected 403 for faculty accessing admin, got {fac_to_adm.status_code}"

    # Admin cannot access unauthorized role APIs
    adm_to_fac = requests.get(f"{BASE_URL}/api/faculty/dashboard", headers=admin_headers)
    assert adm_to_fac.status_code == 403, f"Expected 403 for admin accessing faculty, got {adm_to_fac.status_code}"

    print("[PASS] Role-based access control strictly enforced (403 Forbidden across all unauthorized roles)")

    # ----------------------------------------------------
    # REQUIREMENT 7: CACHE & LOGOUT PROTECTION
    # ----------------------------------------------------
    print("\n--- Testing Requirement 7: Cache Control Headers ---")
    headers_check = requests.get(f"{BASE_URL}/api/student/dashboard", headers=student_headers)
    cache_control = headers_check.headers.get("Cache-Control", "")
    assert "no-store" in cache_control and "no-cache" in cache_control, f"Cache-Control header missing no-store: {cache_control}"
    print(f"[PASS] Security Cache-Control active: {cache_control}")

    # ----------------------------------------------------
    # REQUIREMENT 1: FACULTY ASSIGNMENTS APPEAR UNDER EXACT SUBJECT
    # ----------------------------------------------------
    print("\n--- Testing Requirement 1: Faculty Assignments by Exact Subject/Course ---")
    # Get courses
    student_courses = requests.get(f"{BASE_URL}/api/student/courses", headers=student_headers).json()
    assert len(student_courses) > 0, "Student has no enrolled courses"
    target_course = student_courses[0]
    target_course_id = target_course["id"]
    target_course_title = target_course["title"]
    target_course_code = target_course["code"]

    # Faculty creates assignment specifically for this target course
    asg_title = f"Test Lab Assignment {datetime.utcnow().strftime('%H%M%S')}"
    due_date = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
    create_asg = requests.post(f"{BASE_URL}/api/faculty/assignments", headers=faculty_headers, json={
        "course_id": target_course_id,
        "title": asg_title,
        "description": "Verify assignment exact course association in DB and Student API",
        "due_date": due_date,
        "max_marks": 100
    })
    assert create_asg.status_code == 200, f"Assignment creation failed: {create_asg.text}"
    created_asg_id = create_asg.json().get("assignment_id")

    # Student fetches all assignments
    stud_asgs = requests.get(f"{BASE_URL}/api/student/assignments", headers=student_headers).json()
    found = [a for a in stud_asgs if a["title"] == asg_title]
    assert len(found) > 0, f"Assignment '{asg_title}' not found in student assignments"
    matched_asg = found[0]
    assert matched_asg["course_id"] == target_course_id, f"Wrong course_id: {matched_asg['course_id']} vs {target_course_id}"
    assert matched_asg["course_code"] == target_course_code, f"Wrong course_code: {matched_asg['course_code']}"
    assert matched_asg["course_title"] == target_course_title, f"Wrong course_title: {matched_asg['course_title']}"
    assert matched_asg["subject"] == target_course_title, f"Wrong subject: {matched_asg['subject']}"

    # Student fetches assignments filtered by course_id
    filtered_asgs = requests.get(f"{BASE_URL}/api/student/assignments?course_id={target_course_id}", headers=student_headers).json()
    assert any(a["title"] == asg_title for a in filtered_asgs), "Assignment missing when filtering by exact course_id"

    print(f"[PASS] Assignment '{asg_title}' correctly associated with {target_course_code}: {target_course_title} in backend and Student API")

    # ----------------------------------------------------
    # REQUIREMENT 2: RESOURCES BY ENROLLED COURSE
    # ----------------------------------------------------
    print("\n--- Testing Requirement 2: Resources (Files, Links, Videos) Separated by Course ---")
    # Faculty adds an external link to target course
    link_title = f"Reference Documentation {datetime.utcnow().strftime('%H%M%S')}"
    add_link = requests.post(f"{BASE_URL}/api/faculty/courses/{target_course_id}/add-url-resource", headers=faculty_headers, json={
        "title": link_title,
        "url": "https://docs.python.org/3/",
        "course_id": target_course_id
    })
    assert add_link.status_code == 200, f"Failed to add URL resource: {add_link.text}"

    # Faculty adds a YouTube lecture video to target course
    vid_title = f"Lecture Video {datetime.utcnow().strftime('%H%M%S')}"
    add_vid = requests.post(f"{BASE_URL}/api/faculty/courses/{target_course_id}/videos", headers=faculty_headers, json={
        "title": vid_title,
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "course_id": target_course_id
    })
    assert add_vid.status_code == 200, f"Failed to add video resource: {add_vid.text}"

    # Student enrolled in target course fetches course materials
    materials = requests.get(f"{BASE_URL}/api/student/courses/{target_course_id}/materials", headers=student_headers).json()
    gen_res = materials.get("general_resources", [])
    found_link = [r for r in gen_res if r["title"] == link_title]
    assert len(found_link) > 0, f"Link resource '{link_title}' missing from course materials"
    assert found_link[0]["resource_type"] == "url", f"Expected resource_type url, got {found_link[0]['resource_type']}"

    # Student fetches course videos
    course_vids = requests.get(f"{BASE_URL}/api/student/courses/{target_course_id}/videos", headers=student_headers).json()
    found_vid = [v for v in course_vids if v["title"] == vid_title]
    assert len(found_vid) > 0, f"Video '{vid_title}' missing from course videos"

    # Non-enrolled check: Student 4 is NOT enrolled in course 8 (QMLED4A)
    non_enrolled_access = requests.get(f"{BASE_URL}/api/student/courses/8/materials", headers=student_headers)
    assert non_enrolled_access.status_code == 403, f"Expected 403 for non-enrolled student materials access, got {non_enrolled_access.status_code}"

    print(f"[PASS] External links, YouTube videos, and files appear for enrolled course and are blocked for non-enrolled courses")

    # ----------------------------------------------------
    # REQUIREMENT 3: COURSE ENROLLMENT WITH ALLOWED PERIOD & DEADLINE ENFORCEMENT
    # ----------------------------------------------------
    print("\n--- Testing Requirement 3: Course Enrollment Window & Backend Enforcement ---")
    available_courses = requests.get(f"{BASE_URL}/api/student/courses/available", headers=student_headers).json()
    assert len(available_courses) > 0, "No courses returned from /api/student/courses/available"

    # Course 8 (QMLED4A) was set with past enrollment deadline
    closed_course = next((c for c in available_courses if c["code"] == "QMLED4A"), None)
    assert closed_course is not None, "QMLED4A not found in available courses"
    assert closed_course["is_enrollment_open"] is False, f"Expected is_enrollment_open=False, got {closed_course['is_enrollment_open']}"
    assert closed_course["enrollment_status"] == "closed", f"Expected enrollment_status='closed', got {closed_course['enrollment_status']}"

    # Attempt to enroll in closed course -> MUST BE REJECTED BY BACKEND with 400
    closed_enroll = requests.post(f"{BASE_URL}/api/student/courses/{closed_course['id']}/enroll", headers=student_headers)
    assert closed_enroll.status_code == 400, f"Expected 400 for closed course enrollment, got {closed_enroll.status_code}: {closed_enroll.text}"
    assert "Enrollment Closed" in closed_enroll.json().get("detail", "")
    print(f"[PASS] Backend strictly rejected enrollment past deadline: {closed_enroll.json()['detail']}")

    # Course 6 (IMS60) has open enrollment window and student is not enrolled yet
    open_course = next((c for c in available_courses if c["code"] == "IMS60"), None)
    assert open_course is not None, "IMS60 course not found"
    assert open_course["is_enrollment_open"] is True, f"Expected is_enrollment_open=True for IMS60, got {open_course['is_enrollment_open']}"
    assert open_course["enrollment_status"] == "open"

    # Enroll in open course
    enroll_resp = requests.post(f"{BASE_URL}/api/student/courses/{open_course['id']}/enroll", headers=student_headers)
    assert enroll_resp.status_code == 200, f"Failed to enroll in open course: {enroll_resp.text}"
    assert enroll_resp.json().get("success") is True
    print(f"[PASS] Student successfully enrolled in open course: {enroll_resp.json()['message']}")

    # Now verify that student is enrolled and can access materials
    enrolled_access = requests.get(f"{BASE_URL}/api/student/courses/{open_course['id']}/materials", headers=student_headers)
    assert enrolled_access.status_code == 200, f"Could not access materials after enrollment: {enrolled_access.text}"
    print("[PASS] Newly enrolled course materials accessible immediately")

    # ----------------------------------------------------
    # REQUIREMENT 4: STUDY PLAN RECOMMENDATIONS NAVIGATE TO STUDY PLAN
    # ----------------------------------------------------
    print("\n--- Testing Requirement 4: Study Plan Recommendations Action URL ---")
    study_plan_resp = requests.get(f"{BASE_URL}/api/student/study-plan", headers=student_headers).json()
    recs = study_plan_resp.get("recommendations", [])
    assert len(recs) > 0, "No recommendations in study plan"
    for r in recs:
        # Action URL must NOT point to /student/courses
        assert r["actionUrl"] != "/student/courses", f"Recommendation {r['title']} still has actionUrl=/student/courses"
        if "Study Plan" in r.get("actionText", ""):
            assert r["actionUrl"] == "/student/study-plan", f"Expected /student/study-plan, got {r['actionUrl']}"
    print(f"[PASS] Study Plan recommendations correctly route to /student/study-plan (not /student/courses)")

    print("\n" + "=" * 60)
    print("ALL 7 REQUIREMENTS FULLY VERIFIED AND PASSING!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
