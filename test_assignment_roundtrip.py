import urllib.request
import json

def test_ai_assignment_roundtrip():
    # 1. Student logs in
    login_data = json.dumps({"email": "student@lms.edu", "password": "student123"}).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/login", data=login_data, headers={"Content-Type": "application/json"})
    student_token = json.loads(urllib.request.urlopen(req).read().decode())["access_token"]

    # 2. Student checks assignments
    asg_req = urllib.request.Request("http://127.0.0.1:8000/api/student/assignments", headers={"Authorization": f"Bearer {student_token}"})
    assignments = json.loads(urllib.request.urlopen(asg_req).read().decode())
    asg1 = assignments[0]
    print("[OK] Assignment retrieved:", asg1["title"])
    assert asg1["is_submitted"] == True
    # Prior to approval, marks_obtained is hidden from student
    print("  -> Student view: is_approved =", asg1["submission"]["is_approved"], "| marks =", asg1["submission"]["marks_obtained"])

    # 3. Faculty logs in
    fac_login = json.dumps({"email": "faculty@lms.edu", "password": "faculty123"}).encode('utf-8')
    f_req = urllib.request.Request("http://127.0.0.1:8000/api/auth/login", data=fac_login, headers={"Content-Type": "application/json"})
    faculty_token = json.loads(urllib.request.urlopen(f_req).read().decode())["access_token"]

    # 4. Faculty reviews submissions
    sub_req = urllib.request.Request(f"http://127.0.0.1:8000/api/faculty/assignments/{asg1['id']}/submissions", headers={"Authorization": f"Bearer {faculty_token}"})
    submissions = json.loads(urllib.request.urlopen(sub_req).read().decode())["submissions"]
    sub1 = submissions[0]
    print("  -> Faculty view: AI suggested marks =", sub1["ai_suggested_marks"], "| review status =", sub1["ai_review_status"])

    # 5. Faculty approves submission
    review_payload = json.dumps({
        "action": "approve",
        "marks_obtained": 94.0,
        "feedback": "Approved by Prof. Alan Turing. High quality memoized implementation.",
        "weak_topics": "Disjoint Sequence Bounds"
    }).encode('utf-8')
    rev_req = urllib.request.Request(
        f"http://127.0.0.1:8000/api/faculty/submissions/{sub1['id']}/review",
        data=review_payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {faculty_token}"}
    )
    rev_res = json.loads(urllib.request.urlopen(rev_req).read().decode())
    print("  -> Faculty approved submission:", rev_res["message"])

    # 6. Student re-checks assignments: Now approved marks are visible!
    asg_req2 = urllib.request.Request("http://127.0.0.1:8000/api/student/assignments", headers={"Authorization": f"Bearer {student_token}"})
    assignments2 = json.loads(urllib.request.urlopen(asg_req2).read().decode())
    sub_now = assignments2[0]["submission"]
    print(f"  -> Student view after Faculty Approval: is_approved = {sub_now['is_approved']}, marks = {sub_now['marks_obtained']}/100, feedback = '{sub_now['feedback']}'")
    assert sub_now["is_approved"] == True
    assert sub_now["marks_obtained"] == 94.0
    print("[OK] COMPLETE AI ASSIGNMENT CORRECTION ROUNDTRIP VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_ai_assignment_roundtrip()
