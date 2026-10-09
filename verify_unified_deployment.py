import sys
import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, method, url, expected_status=200, **kwargs):
    try:
        with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
            resp = client.request(method, url, **kwargs)
            if resp.status_code == expected_status:
                print(f"[OK] {name}: Status {resp.status_code}")
                return resp
            else:
                print(f"[FAIL] {name}: Expected {expected_status}, got {resp.status_code}")
                print("  Response:", resp.text[:200])
                return None
    except Exception as e:
        print(f"[FAIL] {name}: Exception {e}")
        return None

def main():
    print("=== Testing Single Unified LMS Deployment on " + BASE_URL + " ===")
    
    # 1. Root route
    r_root = test_endpoint("Root URL (/) serves index.html", "GET", "/")
    assert r_root is not None and "<div id=\"root\">" in r_root.text, "Root does not serve React HTML"

    # Test static assets referenced in index.html
    import re
    scripts = re.findall(r'src="(/assets/[^"]+)"', r_root.text)
    styles = re.findall(r'href="(/assets/[^"]+)"', r_root.text)
    for s in scripts:
        r_s = test_endpoint(f"Static JS bundle ({s})", "GET", s)
        assert r_s is not None and "javascript" in r_s.headers.get("content-type", "")
    for st in styles:
        r_st = test_endpoint(f"Static CSS bundle ({st})", "GET", st)
        assert r_st is not None and "css" in r_st.headers.get("content-type", "")

    # 2. Direct SPA routes (Deep Linking)
    spa_routes = [
        "/login", "/register",
        "/student/dashboard", "/student/courses", "/student/materials", "/student/marks", "/student/assignments", "/student/timetable", "/student/doubt", "/student/quiz",
        "/faculty/dashboard", "/faculty/courses", "/faculty/files", "/faculty/attendance", "/faculty/exams", "/faculty/gradebook", "/faculty/quiz",
        "/admin/dashboard", "/admin/users", "/admin/courses", "/admin/departments", "/admin/timetable"
    ]
    for route in spa_routes:
        r_spa = test_endpoint(f"SPA Deep Link: {route}", "GET", route)
        assert r_spa is not None and '<div id="root">' in r_spa.text, f"Failed deep link for {route}"

    # 3. Health check
    r_health = test_endpoint("API Health Check (/api/health)", "GET", "/api/health")
    assert r_health is not None and r_health.json().get("status") == "healthy"

    # 4. Student Login
    r_s_login = test_endpoint("Student Login", "POST", "/api/auth/login", json={"email": "student@lms.edu", "password": "student123"})
    assert r_s_login is not None
    s_token = r_s_login.json()["access_token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}

    # 5. Student Dashboard API
    r_s_dash = test_endpoint("Student Dashboard API", "GET", "/api/student/dashboard", headers=s_headers)
    assert r_s_dash is not None
    print(f"  -> Student loaded with attendance: {r_s_dash.json().get('metrics', {}).get('attendance')}%")

    # 6. Faculty Login
    r_f_login = test_endpoint("Faculty Login", "POST", "/api/auth/login", json={"email": "faculty@lms.edu", "password": "faculty123"})
    assert r_f_login is not None
    f_token = r_f_login.json()["access_token"]
    f_headers = {"Authorization": f"Bearer {f_token}"}

    # 7. Faculty Dashboard API
    r_f_dash = test_endpoint("Faculty Dashboard API", "GET", "/api/faculty/dashboard", headers=f_headers)
    assert r_f_dash is not None
    print(f"  -> Faculty loaded with active courses: {r_f_dash.json().get('metrics', {}).get('active_courses')}")

    # 8. Admin Login
    r_a_login = test_endpoint("Admin Login", "POST", "/api/auth/login", json={"email": "admin@lms.edu", "password": "admin123"})
    assert r_a_login is not None
    a_token = r_a_login.json()["access_token"]
    a_headers = {"Authorization": f"Bearer {a_token}"}

    # 9. Admin Dashboard API
    r_a_dash = test_endpoint("Admin Dashboard API", "GET", "/api/admin/dashboard", headers=a_headers)
    assert r_a_dash is not None
    print(f"  -> Admin loaded with total users: {r_a_dash.json().get('stats', {}).get('total_users')}")

    # 10. Role Security Guard
    test_endpoint("Role Security (Student blocked from Admin API)", "GET", "/api/admin/users", expected_status=403, headers=s_headers)

    # 11. AI Doubt Assistant API
    r_ai = test_endpoint("AI Assistant API (/api/student/doubt)", "POST", "/api/student/doubt", headers=s_headers, json={"question": "Explain dynamic programming memoization.", "topic": "Algorithms"})
    assert r_ai is not None and "answer" in r_ai.json()
    print("  -> AI Assistant Response received successfully: " + r_ai.json()["answer"][:60] + "...")

    print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    main()
