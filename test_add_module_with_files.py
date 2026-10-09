import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_add_module_with_files():
    print("=== TESTING ADD SEQUENTIAL LEARNING MODULE WITH FILE UPLOADS ===")

    s = requests.Session()

    # 1. Login as Faculty
    print("[1] Logging in as Faculty (faculty@lms.edu)...")
    login_res = s.post(f"{BASE_URL}/api/auth/login", json={"email": "faculty@lms.edu", "password": "faculty123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(" -> Logged in successfully!")

    # 2. Get Faculty Courses
    print("[2] Fetching faculty courses...")
    c_res = s.get(f"{BASE_URL}/api/faculty/courses", headers=headers)
    assert c_res.status_code == 200
    courses = c_res.json()
    assert len(courses) > 0, "No courses found"
    course_id = courses[0]["id"]
    print(f" -> Selected Course ID: {course_id} ({courses[0]['title']})")

    # 3. Create a Sequential Learning Module with Title, Duration, Description AND Uploaded Files
    print("[3] Creating new module with file uploads via multipart/form-data...")
    module_title = "Module 4: Advanced Dynamic Programming & Memoization"
    duration = "3 Weeks"
    description = "Covers recursive memoization, tabulation, state space optimization, and knapsack variants."

    files = [
        ("files", ("dp_lecture_slides.pdf", b"%PDF-1.5 Dummy PDF content for DP lecture slides", "application/pdf")),
        ("files", ("knapsack_cheatsheet.docx", b"PK\x03\x04 Dummy DOCX content for knapsack cheatsheet", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
    ]
    data = {
        "title": module_title,
        "duration": duration,
        "description": description
    }

    add_res = s.post(
        f"{BASE_URL}/api/faculty/courses/{course_id}/modules",
        headers=headers,
        data=data,
        files=files
    )
    assert add_res.status_code == 200, f"Failed to add module: {add_res.text}"
    add_data = add_res.json()
    new_module_id = add_data.get("module_id")
    files_count = add_data.get("files_count", 0)
    print(f" -> Module created! ID: {new_module_id}, Attached Files Count: {files_count}")
    assert new_module_id, "Missing module_id in response"
    assert files_count == 2, f"Expected 2 files attached, got {files_count}"

    # 4. Immediate Check: Query course modules
    print("[4] Verifying immediate availability of new module and attached files...")
    mod_res = s.get(f"{BASE_URL}/api/faculty/courses/{course_id}/modules", headers=headers)
    assert mod_res.status_code == 200
    mod_list = mod_res.json().get("modules", [])
    created_mod = next((m for m in mod_list if m["id"] == new_module_id), None)
    assert created_mod is not None, "Created module not found in modules list!"
    assert created_mod["title"] == module_title
    assert created_mod["duration"] == duration
    assert created_mod["description"] == description

    attached_resources = created_mod.get("resources", [])
    print(f" -> Found {len(attached_resources)} resources attached to module:")
    for r in attached_resources:
        print(f"    * {r['title']} ({r['file_name']}, {r['file_size']}, path: {r['file_path']})")
    assert len(attached_resources) == 2, f"Expected 2 attached resources, got {len(attached_resources)}"

    # 5. Verify Static File Download
    print("[5] Testing downloading the uploaded module files...")
    for r in attached_resources:
        file_path = r["file_path"]
        dl_res = s.get(f"{BASE_URL}{file_path}")
        assert dl_res.status_code == 200, f"Failed to download {file_path}: {dl_res.status_code}"
        print(f" -> Successfully downloaded {r['file_name']} ({len(dl_res.content)} bytes)")

    # 6. Simulate Page Refresh: New session and query
    print("[6] Simulating page refresh & re-querying...")
    s2 = requests.Session()
    refresh_res = s2.get(f"{BASE_URL}/api/faculty/courses/{course_id}/modules", headers=headers)
    assert refresh_res.status_code == 200
    refreshed_mods = refresh_res.json().get("modules", [])
    persistent_mod = next((m for m in refreshed_mods if m["id"] == new_module_id), None)
    assert persistent_mod is not None, "Module missing after page refresh!"
    assert len(persistent_mod.get("resources", [])) == 2, "Attached files missing after page refresh!"
    print(" -> Persistently verified from SQLite DB after page refresh!")

    # 7. Student View Check: Enrolled student sees the module and materials
    print("[7] Verifying student view sees new module and files...")
    stu_login = s.post(f"{BASE_URL}/api/auth/login", json={"email": "student@lms.edu", "password": "student123"})
    assert stu_login.status_code == 200
    stu_headers = {"Authorization": f"Bearer {stu_login.json()['access_token']}"}

    stu_mat_res = s.get(f"{BASE_URL}/api/student/courses/{course_id}/materials", headers=stu_headers)
    assert stu_mat_res.status_code == 200
    stu_modules = stu_mat_res.json().get("modules", [])
    stu_mod = next((m for m in stu_modules if m["id"] == new_module_id), None)
    assert stu_mod is not None, "Student cannot see the newly created module!"
    assert len(stu_mod.get("resources", [])) == 2, "Student cannot see the uploaded materials!"
    print(f" -> Student successfully sees module '{stu_mod['title']}' with {len(stu_mod['resources'])} materials!")

    print("\n=== ALL ADD MODULE AND FILE UPLOAD TESTS PASSED 100%! ===")

if __name__ == "__main__":
    test_add_module_with_files()
