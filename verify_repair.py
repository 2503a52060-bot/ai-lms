import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000"

def test_lms():
    print("--- 1. Health & Root ---")
    res = requests.get(f"{BASE_URL}/api/health")
    print(f"Health Check: {res.status_code} -> {res.json()}")
    assert res.status_code == 200

    res = requests.get(f"{BASE_URL}/")
    print(f"Root URL (SPA index.html): {res.status_code}, content-type: {res.headers.get('content-type')}")
    assert res.status_code == 200
    assert "text/html" in res.headers.get("content-type", "")

    print("\n--- 2. Auth Tests ---")
    # Invalid login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "wrong@lms.edu", "password": "wrong"})
    print(f"Invalid login response: {res.status_code} (Expect 401)")
    assert res.status_code == 401

    # Student login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "student@lms.edu", "password": "student123"})
    print(f"Student login response: {res.status_code}")
    assert res.status_code == 200
    student_data = res.json()
    student_token = student_data["access_token"]
    student_role = student_data["user"]["role"]
    print(f"Logged in student: {student_data['user']['name']}, role: {student_role}")
    assert student_role == "student"

    # Faculty login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "faculty@lms.edu", "password": "faculty123"})
    assert res.status_code == 200
    faculty_token = res.json()["access_token"]
    print(f"Faculty login: {res.json()['user']['name']}, role: {res.json()['user']['role']}")

    # Admin login
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@lms.edu", "password": "admin123"})
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    print(f"Admin login: {res.json()['user']['name']}, role: {res.json()['user']['role']}")

    print("\n--- 3. Role Security Enforcement ---")
    # Student accessing faculty route
    h_student = {"Authorization": f"Bearer {student_token}"}
    res = requests.get(f"{BASE_URL}/api/faculty/dashboard", headers=h_student)
    print(f"Student accessing /api/faculty/dashboard: {res.status_code} (Expect 403)")
    assert res.status_code == 403

    # Student accessing admin route
    res = requests.get(f"{BASE_URL}/api/admin/users", headers=h_student)
    print(f"Student accessing /api/admin/users: {res.status_code} (Expect 403)")
    assert res.status_code == 403

    # Unauthenticated accessing student route
    res = requests.get(f"{BASE_URL}/api/student/dashboard")
    print(f"Unauthenticated accessing /api/student/dashboard: {res.status_code} (Expect 401)")
    assert res.status_code == 401

    print("\n--- 4. Student Attendance Verification ---")
    res = requests.get(f"{BASE_URL}/api/student/attendance", headers=h_student)
    print(f"Attendance status: {res.status_code}")
    assert res.status_code == 200
    att = res.json()
    print(f"  Overall %: {att.get('overallPercentage')}")
    print(f"  Attended Classes: {att.get('attendedClasses')}")
    print(f"  Missed Classes: {att.get('missedClasses')}")
    print(f"  Total Classes: {att.get('totalClasses')}")
    print(f"  Min Required %: {att.get('minRequiredPercentage')}")
    print(f"  Subjects Count: {len(att.get('subjects', []))}")
    assert att.get('overallPercentage') is not None
    assert att.get('attendedClasses') is not None
    assert att.get('missedClasses') is not None
    assert att.get('totalClasses') is not None
    assert len(att.get('subjects', [])) > 0
    sub1 = att['subjects'][0]
    print(f"  Subject 1: {sub1.get('code')} - {sub1.get('name')}: {sub1.get('attended')}/{sub1.get('total')} ({sub1.get('percentage')}%)")

    print("\n--- 5. Student Marks & Results Verification ---")
    res = requests.get(f"{BASE_URL}/api/student/marks", headers=h_student)
    print(f"Marks status: {res.status_code}")
    assert res.status_code == 200
    m_data = res.json()
    print(f"  SGPA: {m_data.get('sgpa')}")
    print(f"  Total Credits: {m_data.get('total_credits')}")
    print(f"  Average %: {m_data.get('average_percentage')}")
    print(f"  Marks count: {len(m_data.get('marks', []))}")
    assert len(m_data.get('marks', [])) > 0
    m1 = m_data['marks'][0]
    print(f"  Mark 1: {m1.get('code')} - {m1.get('name')}: {m1.get('total')}/100 Grade: {m1.get('grade')} Status: {m1.get('status')}")

    print("\n--- 6. AI Recommendations & Study Plan Verification ---")
    res = requests.get(f"{BASE_URL}/api/student/recommendations", headers=h_student)
    print(f"Recommendations status: {res.status_code}")
    assert res.status_code == 200
    recs_data = res.json()
    recs = recs_data if isinstance(recs_data, list) else recs_data.get("recommendations", [])
    print(f"  Recommendations Count: {len(recs)}")
    assert isinstance(recs, list)
    if recs:
        print(f"  Sample Rec: {recs[0].get('title')} ({recs[0].get('category')})")

    print("\n--- 7. Assignments & Submission Flow ---")
    res = requests.get(f"{BASE_URL}/api/student/assignments", headers=h_student)
    print(f"Assignments status: {res.status_code}")
    assert res.status_code == 200
    asgs = res.json()
    print(f"  Found {len(asgs)} assignments")
    assert len(asgs) > 0

    target_asg = asgs[0]
    asg_id = target_asg["id"]
    print(f"  Testing submission on assignment {asg_id}: '{target_asg['title']}'")

    # Submit with multipart file & notes
    test_file_content = b"PDF dummy solution: DP recurrence algorithm implementation."
    files = {"file": ("my_solution.pdf", test_file_content, "application/pdf")}
    data = {"notes": "Implemented bottom-up memoization table with O(N) space."}
    res = requests.post(f"{BASE_URL}/api/student/assignments/{asg_id}/submit", headers=h_student, files=files, data=data)
    print(f"  Submit response: {res.status_code} -> {res.json()}")
    assert res.status_code == 200

    # Verify status changed
    res = requests.get(f"{BASE_URL}/api/student/assignments", headers=h_student)
    asgs_after = res.json()
    updated_asg = next(a for a in asgs_after if a["id"] == asg_id)
    print(f"  Assignment status after submit: {updated_asg['status']}")
    print(f"  Submission details: file_name={updated_asg['submission']['file_name']}, notes='{updated_asg['submission']['notes']}'")
    assert updated_asg['status'] == "Submitted"
    assert updated_asg['submission']['file_name'] == "my_solution.pdf"

    # Replace submission
    replace_content = b"Updated PDF: O(1) space optimization."
    files = {"file": ("my_solution_v2.pdf", replace_content, "application/pdf")}
    data = {"notes": "Optimized to space complexity O(1)."}
    res = requests.post(f"{BASE_URL}/api/student/assignments/{asg_id}/submit", headers=h_student, files=files, data=data)
    print(f"  Replace response: {res.status_code} -> {res.json()['message']}")
    assert res.status_code == 200

    # Delete submission
    res = requests.delete(f"{BASE_URL}/api/student/assignments/{asg_id}/submission", headers=h_student)
    print(f"  Delete response: {res.status_code} -> {res.json()['message']}")
    assert res.status_code == 200

    # Re-submit for a clean state
    files = {"file": ("my_final_solution.pdf", test_file_content, "application/pdf")}
    data = {"notes": "Final complete solution submitted."}
    res = requests.post(f"{BASE_URL}/api/student/assignments/{asg_id}/submit", headers=h_student, files=files, data=data)
    assert res.status_code == 200
    print("  Re-submitted clean solution successfully.")

    print("\n--- 8. SPA Direct Routes Verification ---")
    routes_to_test = [
        "/student/dashboard",
        "/student/attendance",
        "/student/marks",
        "/student/assignments",
        f"/student/assignments/{asg_id}/submit",
        "/student/recommendations",
        "/student/study-plan",
        "/faculty/dashboard",
        "/admin/dashboard"
    ]
    for route in routes_to_test:
        r = requests.get(f"{BASE_URL}{route}")
        assert r.status_code == 200
        assert "text/html" in r.headers.get("content-type", "")
        print(f"  Direct URL {route}: HTTP {r.status_code} (Served SPA successfully)")

    print("\n ALL LMS REPAIR TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_lms()
