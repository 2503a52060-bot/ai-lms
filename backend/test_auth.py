from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

users_to_test = [
    ("admin", "admin@lms.edu", "admin123"),
    ("faculty", "faculty@lms.edu", "faculty123"),
    ("student", "student@lms.edu", "student123")
]

for role, email, pwd in users_to_test:
    res = client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert res.status_code == 200, f"{role} login failed: {res.text}"
    data = res.json()
    token = data["access_token"]
    user = data["user"]
    print(f"SUCCESS: {role.upper()} logged in: {user['name']} (role: {user['role']})")

    headers = {"Authorization": f"Bearer {token}"}
    if role == "student":
        d_res = client.get("/api/student/dashboard", headers=headers)
        assert d_res.status_code == 200, d_res.text
        print("  -> Student dashboard OK, GPA:", d_res.json()["stats"]["gpa"])
        # Cross-role security check: student cannot access faculty or admin
        fac_res = client.get("/api/faculty/dashboard", headers=headers)
        assert fac_res.status_code == 403, "Security breach: student could access faculty!"
        print("  -> Role security OK: Student blocked from faculty dashboard (403 Forbidden)")
    elif role == "faculty":
        d_res = client.get("/api/faculty/dashboard", headers=headers)
        assert d_res.status_code == 200, d_res.text
        print("  -> Faculty dashboard OK, active courses:", d_res.json()["stats"]["active_courses"])
        # Faculty cannot access admin
        adm_res = client.get("/api/admin/dashboard", headers=headers)
        assert adm_res.status_code == 403, "Security breach: faculty could access admin!"
        print("  -> Role security OK: Faculty blocked from admin dashboard (403 Forbidden)")
    elif role == "admin":
        d_res = client.get("/api/admin/dashboard", headers=headers)
        assert d_res.status_code == 200, d_res.text
        print("  -> Admin dashboard OK, total users:", d_res.json()["stats"]["total_users"])

print("\nALL VERIFICATIONS PASSED: 3 ROLES, JWT AUTHENTICATION, AND ROLE-BASED ACCESS CONTROL ARE 100% OPERATIONAL!")
