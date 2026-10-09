import requests
import uuid

BASE_URL = "http://localhost:8000"

def test_subject_dropdown():
    session = requests.Session()

    # 1. Login as Faculty
    print("[1] Logging in as Faculty (faculty@lms.edu)...")
    login_res = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "faculty@lms.edu",
        "password": "faculty123"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(" -> Faculty logged in successfully!")

    # 2. Get current LMS courses
    print("\n[2] Fetching initial LMS courses from backend...")
    courses_res = session.get(f"{BASE_URL}/api/faculty/all-courses", headers=headers)
    assert courses_res.status_code == 200, f"Failed to get courses: {courses_res.text}"
    initial_courses = courses_res.json()
    initial_count = len(initial_courses)
    print(f" -> Found {initial_count} existing courses:")
    for c in initial_courses:
        print(f"    * [{c['id']}] {c['code']}: {c['title']}")

    # 3. Create a brand new course in the LMS
    unique_suffix = uuid.uuid4().hex[:4].upper()
    new_code = f"QML{unique_suffix}"
    new_title = f"Quantum Computing & Information Theory {unique_suffix}"
    print(f"\n[3] Creating brand new course in LMS: {new_code} - {new_title}...")
    create_course_res = session.post(f"{BASE_URL}/api/faculty/courses", json={
        "code": new_code,
        "title": new_title,
        "description": "Exploration of quantum circuits, qubits, and quantum entanglement.",
        "department": "Computer Science & Engineering",
        "credits": 4,
        "semester": "Semester 6",
        "academic_year": "2025-2026"
    }, headers=headers)
    assert create_course_res.status_code == 200, f"Failed to create course: {create_course_res.text}"
    new_course_id = create_course_res.json()["course_id"]
    print(f" -> Newly created course ID: {new_course_id}")

    # 4. Verify newly created course appears in all-courses automatically
    print("\n[4] Querying all LMS courses to verify newly created course appears automatically...")
    updated_courses_res = session.get(f"{BASE_URL}/api/faculty/all-courses", headers=headers)
    assert updated_courses_res.status_code == 200
    updated_courses = updated_courses_res.json()
    assert len(updated_courses) == initial_count + 1, f"Expected {initial_count + 1} courses, got {len(updated_courses)}"

    new_course_match = next((c for c in updated_courses if c["id"] == new_course_id), None)
    assert new_course_match is not None, "Newly created course did not appear in all-courses!"
    assert new_course_match["code"] == new_code
    assert new_course_match["title"] == new_title
    print(f" -> VERIFIED: Brand new course '{new_code}: {new_title}' appears automatically in the course list!")

    # 5. Create New Course Assignment selecting the brand new course
    print(f"\n[5] Creating new course assignment associated with {new_code}...")
    asg_res = session.post(f"{BASE_URL}/api/faculty/assignments", json={
        "course_id": new_course_id,
        "title": f"Lab 1: Quantum Teleportation Protocol ({new_code})",
        "description": "Simulate EPR Bell state pairs and quantum gate matrices using Qiskit.",
        "due_date": "2026-05-20",
        "max_marks": 100
    }, headers=headers)
    assert asg_res.status_code == 200, f"Failed to create assignment: {asg_res.text}"
    asg_data = asg_res.json()
    new_asg_id = asg_data["assignment_id"]
    assert asg_data["course_id"] == new_course_id, "Assignment not associated with the newly created course!"
    print(f" -> Assignment created successfully (ID: {new_asg_id}) correctly associated with course_id: {new_course_id}!")

    # 6. Verify assignment in faculty assignments
    print("\n[6] Verifying assignment in faculty assignments list...")
    asgs_res = session.get(f"{BASE_URL}/api/faculty/assignments", headers=headers)
    assert asgs_res.status_code == 200
    asgs_list = asgs_res.json()
    found_asg = next((a for a in asgs_list if a["id"] == new_asg_id), None)
    assert found_asg is not None, "Assignment not found in faculty assignments!"
    assert found_asg["course_id"] == new_course_id
    assert found_asg["course_code"] == new_code or found_asg["code"] == new_code
    print(f" -> VERIFIED: Assignment is accurately listed with Subject '{found_asg['subject']}' ({found_asg['code']})!")

    print("\n=== ALL SUBJECT DROPDOWN TESTS PASSED WITH 100% SUCCESS ===")

if __name__ == "__main__":
    test_subject_dropdown()
