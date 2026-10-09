import requests
import json

BASE_URL = "http://localhost:8000"

def test_quiz_and_assignment():
    session = requests.Session()

    # 1. Faculty Login
    print("--- Testing Faculty Login ---")
    login_res = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "faculty@lms.edu",
        "password": "faculty123"
    })
    assert login_res.status_code == 200, f"Faculty login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    faculty_headers = {"Authorization": f"Bearer {token}"}
    print("Faculty login successful!")

    # 2. Test AI Quiz Generation (Issue 1)
    print("\n--- Testing AI Quiz Generation ---")
    quiz_res = session.post(f"{BASE_URL}/api/faculty/ai/generate-quiz", json={
        "topic": "Neural Network Architectures",
        "difficulty": "Medium",
        "num_questions": 3
    }, headers=faculty_headers)
    assert quiz_res.status_code == 200, f"Quiz generation failed: {quiz_res.text}"
    quiz_data = quiz_res.json()
    quiz_id = quiz_data["quiz_id"]
    print(f"Quiz generated successfully with ID: {quiz_id}")

    # Check that returned questions do NOT expose correct_answer or answer keys
    for i, q in enumerate(quiz_data["questions"]):
        assert "correct_answer" not in q, f"Exposed correct_answer in question {i}!"
        assert "explanation" not in q, f"Exposed explanation in question {i}!"
        print(f"Question {i+1} verified: {q['question']} - No correct_answer exposed.")

    # 3. Test Student Quiz View and Submit (Issue 1)
    print("\n--- Testing Student Quiz View & Evaluation ---")
    stu_session = requests.Session()
    stu_login = stu_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "student@lms.edu",
        "password": "student123"
    })
    assert stu_login.status_code == 200, f"Student login failed: {stu_login.text}"
    stu_token = stu_login.json()["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_token}"}

    # Fetch quiz details as student
    stu_quiz_res = stu_session.get(f"{BASE_URL}/api/student/quizzes/{quiz_id}", headers=stu_headers)
    assert stu_quiz_res.status_code == 200, f"Student get quiz failed: {stu_quiz_res.text}"
    stu_quiz_data = stu_quiz_res.json()

    for i, q in enumerate(stu_quiz_data["questions"]):
        assert "correct_answer" not in q, f"Student saw correct_answer in question {i}!"
        assert "explanation" not in q, f"Student saw explanation in question {i}!"
    print("Student quiz view verified: options clean, answers hidden.")

    # Submit quiz as student
    submit_res = stu_session.post(f"{BASE_URL}/api/student/quizzes/{quiz_id}/submit", json={
        "answers": {"0": 1, "1": 0, "2": 2}
    }, headers=stu_headers)
    assert submit_res.status_code == 200, f"Quiz submit failed: {submit_res.text}"
    submit_data = submit_res.json()
    assert "score" in submit_data and "percentage" in submit_data, "Scoring missing from submit response"
    print(f"Quiz evaluation verified: Student scored {submit_data['score']}/{submit_data['total']} ({submit_data['percentage']}%) using internal answer key!")

    # 4. Test All LMS Courses in Subject Dropdown (Issue 2)
    print("\n--- Testing All Courses in LMS Catalog ---")
    courses_res = session.get(f"{BASE_URL}/api/faculty/all-courses", headers=faculty_headers)
    assert courses_res.status_code == 200, f"Get all courses failed: {courses_res.text}"
    courses = courses_res.json()
    print(f"Total LMS courses retrieved: {len(courses)}")
    assert len(courses) >= 6, f"Expected at least 6 LMS courses, got {len(courses)}"
    for c in courses:
        print(f" - [{c['id']}] {c['code']}: {c['title']}")

    # 5. Test Creating Assignment for any LMS course (Issue 2)
    # Pick a specific course like the last one
    target_course = courses[-1]
    print(f"\n--- Creating Assignment for Course: [{target_course['id']}] {target_course['code']} - {target_course['title']} ---")

    asg_payload = {
        "course_id": target_course["id"],
        "title": f"Automated Lab Assessment for {target_course['code']}",
        "description": "Implement complete solution with benchmarks and design documentation.",
        "due_date": "2026-05-15",
        "max_marks": 100
    }
    create_asg_res = session.post(f"{BASE_URL}/api/faculty/assignments", json=asg_payload, headers=faculty_headers)
    assert create_asg_res.status_code == 200, f"Assignment creation failed: {create_asg_res.text}"
    create_asg_data = create_asg_res.json()
    new_asg_id = create_asg_data["assignment_id"]
    assert create_asg_data["course_id"] == target_course["id"], "Assignment course_id does not match selected course!"
    print(f"Assignment created successfully (ID: {new_asg_id}) associated with course_id: {create_asg_data['course_id']} ({create_asg_data['course_code']})")

    # 6. Verify assignment appears in faculty assignments list
    faculty_asgs_res = session.get(f"{BASE_URL}/api/faculty/assignments", headers=faculty_headers)
    assert faculty_asgs_res.status_code == 200
    faculty_asgs = faculty_asgs_res.json()
    found_asg = next((a for a in faculty_asgs if a["id"] == new_asg_id), None)
    assert found_asg is not None, "Created assignment not found in faculty assignments list!"
    assert found_asg["course_id"] == target_course["id"]
    print(f"Assignment association verified in faculty assignments list: Course {found_asg['course_code']} ({found_asg['course_title']})")

    print("\nALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED!")

if __name__ == "__main__":
    test_quiz_and_assignment()
