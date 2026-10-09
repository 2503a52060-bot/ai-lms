import urllib.request
import json

def test_endpoints():
    # 1. Test unified frontend
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/")
        assert req.status == 200
        html = req.read().decode('utf-8')
        assert '<div id="root">' in html
        print("[OK] Unified LMS Web App is accessible directly on http://127.0.0.1:8000/ (HTTP 200)")
    except Exception as e:
        print("[FAIL] Unified Web App connection error:", e)

    # 2. Test backend health
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/health")
        assert req.status == 200
        data = json.loads(req.read().decode())
        print("[OK] Backend FastAPI Health Check:", data)
    except Exception as e:
        print("[FAIL] Backend health error:", e)

    # 3. Test Student Login & Dashboard
    try:
        login_data = json.dumps({"email": "student@lms.edu", "password": "student123"}).encode('utf-8')
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        auth_data = json.loads(res.read().decode())
        token = auth_data["access_token"]
        user = auth_data["user"]
        print(f"[OK] Student Login Success: {user['name']} ({user['email']}) [Role: {user['role']}]")

        # Test Student Dashboard with JWT
        dash_req = urllib.request.Request(
            "http://127.0.0.1:8000/api/student/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        dash_res = urllib.request.urlopen(dash_req)
        dash_data = json.loads(dash_res.read().decode())
        print(f"[OK] Student Dashboard: GPA {dash_data['stats']['gpa']}, Attendance {dash_data['stats']['attendance_rate']}%, Enrolled Courses: {dash_data['stats']['enrolled_courses_count']}")
    except Exception as e:
        print("[FAIL] Student API error:", e)

    # 4. Test Faculty Login & Course Management
    try:
        login_data = json.dumps({"email": "faculty@lms.edu", "password": "faculty123"}).encode('utf-8')
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        auth_data = json.loads(res.read().decode())
        token = auth_data["access_token"]
        user = auth_data["user"]
        print(f"[OK] Faculty Login Success: {user['name']} ({user['email']}) [Role: {user['role']}]")

        # Test Faculty Courses with JWT
        c_req = urllib.request.Request(
            "http://127.0.0.1:8000/api/faculty/courses",
            headers={"Authorization": f"Bearer {token}"}
        )
        c_res = urllib.request.urlopen(c_req)
        courses = json.loads(c_res.read().decode())
        print(f"[OK] Faculty Courses Count: {len(courses)} courses active")

        # Test AI Quiz Generator endpoint
        quiz_data = json.dumps({"topic": "Dynamic Programming", "difficulty": "Medium", "num_questions": 3}).encode('utf-8')
        quiz_req = urllib.request.Request(
            "http://127.0.0.1:8000/api/faculty/ai/generate-quiz",
            data=quiz_data,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
        )
        quiz_res = urllib.request.urlopen(quiz_req)
        quiz_json = json.loads(quiz_res.read().decode())
        print(f"[OK] AI Quiz Generation API OK: Generated {len(quiz_json['questions'])} items: '{quiz_json['title']}'")
    except Exception as e:
        print("[FAIL] Faculty API error:", e)

    # 5. Test Admin Login & Users
    try:
        login_data = json.dumps({"email": "admin@lms.edu", "password": "admin123"}).encode('utf-8')
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        auth_data = json.loads(res.read().decode())
        token = auth_data["access_token"]
        user = auth_data["user"]
        print(f"[OK] Admin Login Success: {user['name']} ({user['email']}) [Role: {user['role']}]")

        users_req = urllib.request.Request(
            "http://127.0.0.1:8000/api/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        users_res = urllib.request.urlopen(users_req)
        users = json.loads(users_res.read().decode())
        print(f"[OK] Admin Users Count: {len(users)} registered institutional accounts")
    except Exception as e:
        print("[FAIL] Admin API error:", e)

    # 6. Test File download endpoint
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/files/download/CS301_Module1_Notes.pdf")
        assert req.status == 200
        content = req.read()
        assert len(content) > 0
        print(f"[OK] File Download API OK: CS301_Module1_Notes.pdf served ({len(content)} bytes)")
    except Exception as e:
        print("[FAIL] File download error:", e)

if __name__ == "__main__":
    test_endpoints()
