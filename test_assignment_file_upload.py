import requests
import io

BASE_URL = "http://localhost:8000"

def test_assignment_file_upload():
    faculty_session = requests.Session()

    # 1. Faculty Login
    print("[1] Logging in as Faculty (faculty@lms.edu)...")
    login_res = faculty_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "faculty@lms.edu",
        "password": "faculty123"
    })
    assert login_res.status_code == 200, f"Faculty login failed: {login_res.text}"
    faculty_token = login_res.json()["access_token"]
    faculty_headers = {"Authorization": f"Bearer {faculty_token}"}
    print(" -> Faculty logged in successfully!")

    # 2. Get Course to attach assignment to
    courses_res = faculty_session.get(f"{BASE_URL}/api/faculty/all-courses", headers=faculty_headers)
    assert courses_res.status_code == 200
    courses = courses_res.json()
    assert len(courses) > 0
    target_course = courses[0] # e.g. CS301
    print(f" -> Selected Course: [{target_course['id']}] {target_course['code']} - {target_course['title']}")

    # 3. Create Assignment with Uploaded Question File
    print("\n[2] Creating Assignment with attached question/assignment file (PDF)...")
    file_content = b"%PDF-1.4\n1 0 obj\n<<\n/Title (Problem Set 4: Dynamic Programming & Graphs)\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF"
    file_name = "Problem_Set_4_Dynamic_Programming.pdf"

    form_data = {
        "course_id": str(target_course["id"]),
        "title": "Problem Set 4: Advanced Dynamic Programming & Graph Theory",
        "description": "Please download the attached PDF question file. Solve problems 1-5 and submit your solution code and complexity proofs.",
        "due_date": "2026-05-30",
        "max_marks": "100"
    }

    files = {
        "file": (file_name, io.BytesIO(file_content), "application/pdf")
    }

    create_res = faculty_session.post(
        f"{BASE_URL}/api/faculty/assignments",
        data=form_data,
        files=files,
        headers=faculty_headers
    )
    assert create_res.status_code == 200, f"Failed to create assignment: {create_res.text}"
    create_data = create_res.json()
    new_asg_id = create_data["assignment_id"]
    att_path = create_data["attachment_path"]
    att_name = create_data["attachment_name"]

    print(f" -> Assignment created successfully! ID: {new_asg_id}")
    print(f" -> Saved Attachment Name: {att_name}")
    print(f" -> Saved Attachment Path: {att_path}")
    assert att_name == file_name
    assert att_path is not None and "/uploads/" in att_path

    # 4. Verify Faculty can access the uploaded file
    file_download_res = faculty_session.get(f"{BASE_URL}{att_path}")
    assert file_download_res.status_code == 200
    assert file_download_res.content == file_content
    print(" -> Verified faculty can access uploaded assignment file over HTTP!")

    # 5. Verify Student Login and Access
    print("\n[3] Logging in as Student (student@lms.edu)...")
    student_session = requests.Session()
    stu_login = student_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "student@lms.edu",
        "password": "student123"
    })
    assert stu_login.status_code == 200
    stu_token = stu_login.json()["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_token}"}
    print(" -> Student logged in successfully!")

    # 6. Verify Student retrieves assignment with question file attachment
    print("\n[4] Fetching student assignments to verify question file is available to student...")
    stu_asg_res = student_session.get(f"{BASE_URL}/api/student/assignments", headers=stu_headers)
    assert stu_asg_res.status_code == 200
    stu_asgs = stu_asg_res.json()
    found_stu_asg = next((a for a in stu_asgs if a["id"] == new_asg_id), None)
    assert found_stu_asg is not None, "Created assignment not found for enrolled student!"
    assert found_stu_asg["attachment_path"] == att_path
    assert found_stu_asg["attachment_name"] == file_name
    print(f" -> Student sees assignment with attachment: {found_stu_asg['attachment_name']}")

    # 7. Verify Student can download the uploaded question file
    stu_file_res = student_session.get(f"{BASE_URL}{found_stu_asg['attachment_path']}")
    assert stu_file_res.status_code == 200
    assert stu_file_res.content == file_content
    print(f" -> Student successfully downloaded question file ({len(stu_file_res.content)} bytes) and content verified byte-for-byte!")

    print("\n=== ALL FACULTY ASSIGNMENT FILE UPLOAD & STUDENT DOWNLOAD TESTS PASSED 100%! ===")

if __name__ == "__main__":
    test_assignment_file_upload()
