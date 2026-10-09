import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def run_tests():
    s = requests.Session()

    # 1. Test Unauthenticated access
    log("Testing unauthenticated access to /api/faculty/courses...")
    r = s.get(f"{BASE_URL}/api/faculty/courses")
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    log("PASS: Unauthenticated /api/faculty/courses returned 401")

    # 2. Login as Faculty 1 (faculty@lms.edu)
    log("Logging in as Faculty 1 (faculty@lms.edu)...")
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": "faculty@lms.edu", "password": "faculty123"})
    assert r.status_code == 200, f"Faculty login failed: {r.text}"
    fac1_data = r.json()
    fac1_token = fac1_data["access_token"]
    fac1_user = fac1_data["user"]
    fac1_headers = {"Authorization": f"Bearer {fac1_token}"}
    log(f"PASS: Logged in as Faculty 1 (ID: {fac1_user['id']}, Name: {fac1_user['name']})")

    # Get Faculty 1 courses
    r = s.get(f"{BASE_URL}/api/faculty/courses", headers=fac1_headers)
    assert r.status_code == 200, f"Failed to get faculty courses: {r.text}"
    courses = r.json()
    assert len(courses) > 0, "No courses found for faculty"
    course_id = courses[0]["id"]
    log(f"Using Course ID: {course_id} ({courses[0]['title']})")

    # Get modules & general resources
    r = s.get(f"{BASE_URL}/api/faculty/courses/{course_id}/modules", headers=fac1_headers)
    assert r.status_code == 200, f"Failed to get course modules: {r.text}"
    mod_data = r.json()
    assert "modules" in mod_data, "Missing 'modules' key in response"
    assert "general_resources" in mod_data, "Missing 'general_resources' key in response"
    modules = mod_data["modules"]
    target_module_id = modules[0]["id"] if modules else None
    log(f"PASS: modules and general_resources verified. Target Module ID: {target_module_id}")

    # 3. Faculty uploads a file resource
    log("Testing faculty file upload...")
    file_payload = {"title": "Test Syllabus Handout"}
    if target_module_id:
        file_payload["module_id"] = str(target_module_id)
    files = {"file": ("test_handout.pdf", b"%PDF-1.4 test dummy content for handout", "application/pdf")}
    r = s.post(
        f"{BASE_URL}/api/faculty/courses/{course_id}/upload-resource",
        data=file_payload,
        files=files,
        headers=fac1_headers
    )
    assert r.status_code == 200, f"File upload failed: {r.text}"
    uploaded_file_id = r.json().get("resource_id")
    assert uploaded_file_id, "Missing resource_id in file upload response"
    log(f"PASS: File uploaded successfully with Resource ID: {uploaded_file_id}")

    # 4. Faculty links an external URL
    log("Testing faculty adding URL resource...")
    url_payload = {
        "course_id": course_id,
        "module_id": target_module_id,
        "title": "Interactive Algorithms Visualizer",
        "url": "https://visualgo.net/en"
    }
    r = s.post(f"{BASE_URL}/api/faculty/courses/{course_id}/add-url-resource", json=url_payload, headers=fac1_headers)
    assert r.status_code == 200, f"URL add failed: {r.text}"
    url_res_id = r.json().get("resource_id")
    assert url_res_id, "Missing resource_id in URL response"
    log(f"PASS: URL resource added with Resource ID: {url_res_id}")

    # 5. Faculty adds a YouTube video
    log("Testing faculty adding YouTube video...")
    vid_payload = {
        "title": "Lecture 1: Introduction to System Design",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "module_id": target_module_id
    }
    r = s.post(f"{BASE_URL}/api/faculty/courses/{course_id}/videos", json=vid_payload, headers=fac1_headers)
    assert r.status_code == 200, f"Video add failed: {r.text}"
    video_id = r.json().get("video_id")
    assert video_id, "Missing video_id in video response"
    log(f"PASS: Video resource added with Video ID: {video_id}")

    # 6. Faculty edits URL resource
    log(f"Testing editing URL resource ID {url_res_id}...")
    edit_payload = {
        "title": "Updated Algorithm Visualizer (Advanced)",
        "url": "https://visualgo.net/en/sorting"
    }
    r = s.put(f"{BASE_URL}/api/faculty/resources/{url_res_id}", json=edit_payload, headers=fac1_headers)
    assert r.status_code == 200, f"Resource edit failed: {r.text}"
    log("PASS: Resource edited successfully")

    # 7. Faculty edits Video
    log(f"Testing editing Video ID {video_id}...")
    vid_edit_payload = {
        "title": "Lecture 1 (Updated): System Design Architecture",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
    r = s.put(f"{BASE_URL}/api/faculty/videos/{video_id}", json=vid_edit_payload, headers=fac1_headers)
    assert r.status_code == 200, f"Video edit failed: {r.text}"
    log("PASS: Video edited successfully")

    # 8. Test Ownership Enforcement:
    # Register/login a second faculty user to verify they cannot edit or delete Faculty 1's resources!
    log("Testing ownership security: creating second faculty user...")
    fac2_email = "fac2_test@lms.edu"
    # Register or login
    r = s.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Prof. Secondus",
        "email": fac2_email,
        "password": "password123",
        "role": "faculty",
        "department": "Computer Science"
    })
    if r.status_code != 200:
        # maybe already exists
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": fac2_email, "password": "password123"})
    assert r.status_code == 200, f"Second faculty login failed: {r.text}"
    fac2_token = r.json()["access_token"]
    fac2_headers = {"Authorization": f"Bearer {fac2_token}"}

    # Second faculty attempts to EDIT Faculty 1's resource -> must get 403 Forbidden!
    log("Second faculty attempting to edit Faculty 1's resource...")
    r = s.put(f"{BASE_URL}/api/faculty/resources/{url_res_id}", json={"title": "Hacked Title"}, headers=fac2_headers)
    assert r.status_code == 403, f"Expected 403 Forbidden, got {r.status_code}: {r.text}"
    log("PASS: Second faculty correctly forbidden (403) from editing resource")

    # Second faculty attempts to DELETE Faculty 1's resource -> must get 403 Forbidden!
    log("Second faculty attempting to delete Faculty 1's resource...")
    r = s.delete(f"{BASE_URL}/api/faculty/resources/{url_res_id}", headers=fac2_headers)
    assert r.status_code == 403, f"Expected 403 Forbidden, got {r.status_code}: {r.text}"
    log("PASS: Second faculty correctly forbidden (403) from deleting resource")

    # Second faculty attempts to DELETE Faculty 1's video -> must get 403 Forbidden!
    log("Second faculty attempting to delete Faculty 1's video...")
    r = s.delete(f"{BASE_URL}/api/faculty/videos/{video_id}", headers=fac2_headers)
    assert r.status_code == 403, f"Expected 403 Forbidden, got {r.status_code}: {r.text}"
    log("PASS: Second faculty correctly forbidden (403) from deleting video")

    # 9. Student views materials and videos
    log("Testing Student View (student@lms.edu)...")
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": "student@lms.edu", "password": "student123"})
    assert r.status_code == 200, f"Student login failed: {r.text}"
    stu_token = r.json()["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_token}"}

    # Student cannot call faculty endpoints
    r = s.delete(f"{BASE_URL}/api/faculty/resources/{url_res_id}", headers=stu_headers)
    assert r.status_code == 403, f"Expected 403 for student calling faculty endpoint, got {r.status_code}"
    log("PASS: Student forbidden (403) from accessing faculty resource endpoints")

    # Student fetches materials for this course
    r = s.get(f"{BASE_URL}/api/student/courses/{course_id}/materials", headers=stu_headers)
    assert r.status_code == 200, f"Student get materials failed: {r.text}"
    stu_mat = r.json()
    all_res_ids = []
    for m in stu_mat.get("modules", []):
        for res in m.get("resources", []):
            all_res_ids.append(res["id"])
    for res in stu_mat.get("general_resources", []):
        all_res_ids.append(res["id"])
    assert url_res_id in all_res_ids, f"Resource {url_res_id} not visible to student!"
    assert uploaded_file_id in all_res_ids, f"Resource {uploaded_file_id} not visible to student!"
    log(f"PASS: Student can view all faculty resources: {all_res_ids}")

    # Student fetches videos
    r = s.get(f"{BASE_URL}/api/student/courses/{course_id}/videos", headers=stu_headers)
    assert r.status_code == 200, f"Student get videos failed: {r.text}"
    stu_vids = r.json()
    stu_vid_ids = [v["id"] for v in stu_vids]
    assert video_id in stu_vid_ids, f"Video {video_id} not found in student videos!"
    log(f"PASS: Student can view course videos: {stu_vid_ids}")

    # 10. Faculty 1 deletes the created test resources cleanly
    log("Faculty 1 deleting test resources...")
    r = s.delete(f"{BASE_URL}/api/faculty/resources/{url_res_id}", headers=fac1_headers)
    assert r.status_code == 200, f"Faculty 1 delete URL resource failed: {r.text}"

    r = s.delete(f"{BASE_URL}/api/faculty/resources/{uploaded_file_id}", headers=fac1_headers)
    assert r.status_code == 200, f"Faculty 1 delete file resource failed: {r.text}"

    r = s.delete(f"{BASE_URL}/api/faculty/videos/{video_id}", headers=fac1_headers)
    assert r.status_code == 200, f"Faculty 1 delete video failed: {r.text}"
    log("PASS: Faculty 1 cleanly deleted own resources")

    # 11. Test Frontend SPA single URL & routing
    log("Testing frontend routes at http://127.0.0.1:8000...")
    r = s.get(f"{BASE_URL}/")
    assert r.status_code == 200 and "<html" in r.text.lower(), "Root / did not return HTML"
    r = s.get(f"{BASE_URL}/login")
    assert r.status_code == 200 and "<html" in r.text.lower(), "/login did not return HTML"
    r = s.get(f"{BASE_URL}/faculty/courses")
    assert r.status_code == 200 and "<html" in r.text.lower(), "/faculty/courses did not return HTML"
    r = s.get(f"{BASE_URL}/student/courses")
    assert r.status_code == 200 and "<html" in r.text.lower(), "/student/courses did not return HTML"
    log("PASS: All SPA routes serve single web application successfully")

    print("\nALL COURSE MATERIALS & AUTHENTICATION TESTS PASSED 100%!")

if __name__ == "__main__":
    run_tests()
