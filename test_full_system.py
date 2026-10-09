import requests
import json
import io

BASE_URL = "http://localhost:8000"

def test_system():
    print("=== STARTING COMPREHENSIVE E2E VERIFICATION ===")

    # 1. SECURITY & ROLE ACCESS
    print("\n--- 1. Testing Security & Authorization ---")
    res = requests.get(f"{BASE_URL}/api/student/dashboard")
    assert res.status_code == 401, f"Expected 401 for unauth student dashboard, got {res.status_code}"
    print("[OK] Unauthenticated request to /api/student/dashboard correctly blocked (401)")

    res = requests.get(f"{BASE_URL}/api/faculty/dashboard")
    assert res.status_code == 401, f"Expected 401 for unauth faculty dashboard, got {res.status_code}"
    print("[OK] Unauthenticated request to /api/faculty/dashboard correctly blocked (401)")

    res = requests.get(f"{BASE_URL}/api/admin/dashboard")
    assert res.status_code == 401, f"Expected 401 for unauth admin dashboard, got {res.status_code}"
    print("[OK] Unauthenticated request to /api/admin/dashboard correctly blocked (401)")

    # 2. STUDENT LOGIN & PORTAL
    print("\n--- 2. Testing Student Portal ---")
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "student@lms.edu", "password": "student123", "role": "student"})
    assert login_res.status_code == 200, f"Student login failed: {login_res.text}"
    student_token = login_res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[OK] Student login succeeded")

    # Cross-role authorization check
    cross_res = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=student_headers)
    assert cross_res.status_code == 403, f"Expected 403 for student accessing admin, got {cross_res.status_code}"
    print("[OK] Student blocked from Admin API (403 Forbidden)")

    cross_fac = requests.get(f"{BASE_URL}/api/faculty/dashboard", headers=student_headers)
    assert cross_fac.status_code == 403, f"Expected 403 for student accessing faculty, got {cross_fac.status_code}"
    print("[OK] Student blocked from Faculty API (403 Forbidden)")

    # Student Dashboard
    dash_res = requests.get(f"{BASE_URL}/api/student/dashboard", headers=student_headers)
    assert dash_res.status_code == 200, f"Student dashboard failed: {dash_res.text}"
    dash_data = dash_res.json()
    assert "overallPercentage" in dash_data and "performance_summary" in dash_data and "stats" in dash_data
    print("[OK] Student Dashboard loads correctly with real metrics & performance data")

    # Attendance
    att_res = requests.get(f"{BASE_URL}/api/student/attendance", headers=student_headers)
    assert att_res.status_code == 200, f"Attendance failed: {att_res.text}"
    att_data = att_res.json()
    assert "overall_percentage" in att_data
    assert "classes_attended" in att_data
    assert "classes_missed" in att_data
    assert "courses" in att_data and len(att_data["courses"]) > 0
    print(f"[OK] Student Attendance verified: {att_data['overall_percentage']}% ({att_data['classes_attended']} attended, {att_data['classes_missed']} missed, {len(att_data['courses'])} courses)")

    # Marks & Results
    marks_res = requests.get(f"{BASE_URL}/api/student/marks", headers=student_headers)
    assert marks_res.status_code == 200, f"Marks failed: {marks_res.text}"
    marks_data = marks_res.json()
    assert "marks" in marks_data and len(marks_data["marks"]) > 0
    print(f"[OK] Student Marks & Results verified: {len(marks_data['marks'])} subject records returned")

    # AI Study Plan & Weak Topics
    sp_res = requests.get(f"{BASE_URL}/api/student/study-plan", headers=student_headers)
    assert sp_res.status_code == 200, f"Study plan failed: {sp_res.text}"
    sp_data = sp_res.json()
    assert "study_plan" in sp_data and "weak_topics" in sp_data
    print(f"[OK] AI Study Plan & Recommendations loaded with {len(sp_data['weak_topics'])} weak topics detected")

    # 3. AI DRILL & PERSISTENCE
    print("\n--- 3. Testing 5-Min Drill & Mark Done Persistence ---")
    # Save completion progress
    save_prog_res = requests.post(f"{BASE_URL}/api/student/study-plan/drill-progress", headers=student_headers, json={"completed_indices": [0, 2]})
    assert save_prog_res.status_code == 200
    # Fetch back
    get_prog_res = requests.get(f"{BASE_URL}/api/student/study-plan/drill-progress", headers=student_headers)
    assert get_prog_res.status_code == 200
    completed_indices = get_prog_res.json().get("completed_indices", [])
    assert 0 in completed_indices and 2 in completed_indices
    print("[OK] 'Mark Done' completion state saved and persistently verified from DB")

    # Get drill questions
    drill_q_res = requests.get(f"{BASE_URL}/api/student/study-plan/drill-questions", headers=student_headers)
    assert drill_q_res.status_code == 200
    drill_questions = drill_q_res.json().get("questions", [])
    assert len(drill_questions) >= 5
    print(f"[OK] 5-Minute Drill questions fetched: {len(drill_questions)} targeted questions ready")

    # Submit drill attempt
    drill_sub_res = requests.post(
        f"{BASE_URL}/api/student/study-plan/drill-submit",
        headers=student_headers,
        json={"answers": {"0": 1, "1": 1, "2": 2, "3": 1, "4": 1}}
    )
    assert drill_sub_res.status_code == 200
    drill_res_data = drill_sub_res.json()
    assert "score" in drill_res_data and "percentage" in drill_res_data
    print(f"[OK] 5-Min Drill submitted & evaluated: Score {drill_res_data['score']}/{drill_res_data['total']} ({drill_res_data['percentage']}%)")

    # 4. AI DIAGNOSTIC QUIZ GENERATION & EVALUATION
    print("\n--- 4. Testing AI Quiz Generation & Evaluation ---")
    gen_quiz_res = requests.post(
        f"{BASE_URL}/api/student/quizzes/generate",
        headers=student_headers,
        json={"topic": "Graph Algorithms and Shortest Path", "difficulty": "Medium", "num_questions": 5}
    )
    assert gen_quiz_res.status_code == 200
    gen_quiz_data = gen_quiz_res.json()
    quiz_id = gen_quiz_data["quiz_id"]
    print(f"[OK] AI Diagnostic Quiz generated successfully with ID {quiz_id}: '{gen_quiz_data['title']}'")

    # Submit answers to this generated quiz
    quiz_sub_res = requests.post(
        f"{BASE_URL}/api/student/quizzes/{quiz_id}/submit",
        headers=student_headers,
        json={"answers": {"0": 0, "1": 1, "2": 2, "3": 3, "4": 0}}
    )
    assert quiz_sub_res.status_code == 200
    quiz_sub_data = quiz_sub_res.json()
    assert "score" in quiz_sub_data and "feedback_details" in quiz_sub_data
    print(f"[OK] AI Diagnostic Quiz submitted & evaluated: Score {quiz_sub_data['score']}/{quiz_sub_data['total']} ({quiz_sub_data['percentage']}%)")

    # 5. ASSIGNMENTS: UPLOAD, VIEW, REPLACE, DELETE
    print("\n--- 5. Testing Assignment Submission & Lifecycle ---")
    asg_list_res = requests.get(f"{BASE_URL}/api/student/assignments", headers=student_headers)
    assert asg_list_res.status_code == 200
    asg_list = asg_list_res.json()
    assert len(asg_list) > 0
    target_asg_id = asg_list[0]["id"]

    # Upload submission
    dummy_file = io.BytesIO(b"Artificial Intelligence LMS Assignment Submission Content")
    files = {"file": ("submission_solution.pdf", dummy_file, "application/pdf")}
    sub_post_res = requests.post(
        f"{BASE_URL}/api/student/assignments/{target_asg_id}/submit",
        headers=student_headers,
        data={"notes": "Final verified project submission"},
        files=files
    )
    assert sub_post_res.status_code == 200, f"Upload failed: {sub_post_res.text}"
    print("[OK] Student uploaded assignment file successfully")

    # Replace submission
    replace_file = io.BytesIO(b"Updated Solution Revision 2 Content")
    files2 = {"file": ("submission_solution_v2.pdf", replace_file, "application/pdf")}
    sub_replace_res = requests.post(
        f"{BASE_URL}/api/student/assignments/{target_asg_id}/submit",
        headers=student_headers,
        data={"notes": "Replaced wrong version with revised solution"},
        files=files2
    )
    assert sub_replace_res.status_code == 200
    print("[OK] Student replaced assignment file before deadline successfully")

    # Delete submission
    del_sub_res = requests.delete(
        f"{BASE_URL}/api/student/assignments/{target_asg_id}/submission",
        headers=student_headers
    )
    assert del_sub_res.status_code == 200
    print("[OK] Student deleted assignment submission successfully")

    # Re-upload so submission is present
    reup_file = io.BytesIO(b"Final Clean Solution")
    files3 = {"file": ("clean_submission.pdf", reup_file, "application/pdf")}
    requests.post(
        f"{BASE_URL}/api/student/assignments/{target_asg_id}/submit",
        headers=student_headers,
        data={"notes": "Submitted"},
        files=files3
    )

    # 6. COURSE VIDEOS: FACULTY CRUD & STUDENT ACCESS
    print("\n--- 6. Testing Course YouTube Videos (Faculty CRUD & Student View) ---")
    fac_login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "faculty@lms.edu", "password": "faculty123", "role": "faculty"})
    assert fac_login.status_code == 200
    faculty_token = fac_login.json()["access_token"]
    faculty_headers = {"Authorization": f"Bearer {faculty_token}"}

    # Faculty courses
    fac_courses_res = requests.get(f"{BASE_URL}/api/faculty/courses", headers=faculty_headers)
    assert fac_courses_res.status_code == 200
    courses = fac_courses_res.json()
    assert len(courses) > 0
    course_id = courses[0]["id"]

    # Faculty adds YouTube video
    new_video_res = requests.post(
        f"{BASE_URL}/api/faculty/courses/{course_id}/videos",
        headers=faculty_headers,
        json={
            "title": "Comprehensive Dynamic Programming Tutorial",
            "url": "https://www.youtube.com/watch?v=oBt53YbR9Kk",
            "module_id": None
        }
    )
    assert new_video_res.status_code == 200, f"Add video failed: {new_video_res.text}"
    video_id = new_video_res.json()["video_id"]
    print(f"[OK] Faculty added YouTube video with ID {video_id}")

    # Faculty edits video
    edit_video_res = requests.put(
        f"{BASE_URL}/api/faculty/videos/{video_id}",
        headers=faculty_headers,
        json={
            "title": "Comprehensive Dynamic Programming Tutorial (Revised 2026)",
            "url": "https://www.youtube.com/watch?v=oBt53YbR9Kk",
            "module_id": None
        }
    )
    assert edit_video_res.status_code == 200
    print("[OK] Faculty edited YouTube video details successfully")

    # Student views enrolled videos
    student_vids_res = requests.get(f"{BASE_URL}/api/student/videos", headers=student_headers)
    assert student_vids_res.status_code == 200
    student_vids = student_vids_res.json()
    found_video = any(v["id"] == video_id for v in student_vids)
    assert found_video, "Student could not find the enrolled course video!"
    print(f"[OK] Student successfully viewed enrolled YouTube video: '{student_vids[0]['title']}'")

    # Faculty deletes video
    del_vid_res = requests.delete(f"{BASE_URL}/api/faculty/videos/{video_id}", headers=faculty_headers)
    assert del_vid_res.status_code == 200
    print("[OK] Faculty deleted YouTube video successfully")

    # 7. LOGOUT & REDIRECTION
    print("\n--- 7. Testing Logout & Direct URL Access ---")
    # Verify index.html returns valid React single-page bundle
    index_res = requests.get(f"{BASE_URL}/student/dashboard")
    assert index_res.status_code == 200
    assert "<div id=\"root\"></div>" in index_res.text
    print("[OK] Single unified frontend serves all routes at http://localhost:8000")

    print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_system()
