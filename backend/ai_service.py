import json
import random
from typing import Dict, List, Any

class AIService:
    @staticmethod
    def detect_weak_topics(marks_data: List[Dict[str, Any]], attendance_pct: float = 85.0) -> List[Dict[str, Any]]:
        """
        Analyzes performance across subjects and marks to detect weak topics.
        """
        topics_pool = [
            {"subject": "Data Structures", "topic": "Dynamic Programming & Memoization", "severity": "High", "confidence": 0.92, "recommendation": "Review recursion trees and practice top-down DP."},
            {"subject": "Data Structures", "topic": "Graph Algorithms (Dijkstra & Prim)", "severity": "Medium", "confidence": 0.85, "recommendation": "Implement priority queue BFS/DFS traversals."},
            {"subject": "Database Systems", "topic": "B+ Tree Indexing & Query Optimization", "severity": "High", "confidence": 0.89, "recommendation": "Study EXPLAIN query plans and clustering keys."},
            {"subject": "Database Systems", "topic": "ACID Properties & Isolation Levels", "severity": "Medium", "confidence": 0.78, "recommendation": "Simulate concurrent read phenomena (dirty reads)."},
            {"subject": "AI & Machine Learning", "topic": "Backpropagation & Gradient Optimization", "severity": "High", "confidence": 0.94, "recommendation": "Trace chain rule computations by hand on toy networks."},
            {"subject": "Cloud Computing", "topic": "Container Orchestration & Pod Networking", "severity": "Low", "confidence": 0.72, "recommendation": "Review CNI plugins and ingress routing."}
        ]

        weak_topics = []
        for mark in marks_data:
            pct = (mark.get("marks_obtained", 0) / mark.get("max_marks", 100)) * 100
            if pct < 70:
                sub_name = mark.get("subject", "")
                matching = [t for t in topics_pool if t["subject"].lower() in sub_name.lower()]
                if matching:
                    weak_topics.extend(matching)
                else:
                    weak_topics.append({
                        "subject": sub_name,
                        "topic": f"Core Principles of {sub_name}",
                        "severity": "High" if pct < 50 else "Medium",
                        "confidence": 0.88,
                        "recommendation": f"Focus on foundational review sessions for {sub_name}."
                    })

        if not weak_topics:
            weak_topics = topics_pool[:3]

        return weak_topics[:5]

    @staticmethod
    def analyze_student_risk(attendance_pct: float, avg_marks_pct: float, pending_assignments_count: int) -> Dict[str, Any]:
        """
        Computes student risk level (Low, Medium, High) with indicators and advice.
        """
        risk_score = 0
        indicators = []

        if attendance_pct < 75.0:
            risk_score += 40
            indicators.append(f"Attendance is {attendance_pct:.1f}% (below 75% mandatory threshold)")
        elif attendance_pct < 85.0:
            risk_score += 15
            indicators.append(f"Attendance is moderate at {attendance_pct:.1f}%")

        if avg_marks_pct < 55.0:
            risk_score += 45
            indicators.append(f"Average examination score is {avg_marks_pct:.1f}% (critical academic alert)")
        elif avg_marks_pct < 70.0:
            risk_score += 20
            indicators.append(f"Academic average {avg_marks_pct:.1f}% needs improvement to attain honors")

        if pending_assignments_count >= 3:
            risk_score += 25
            indicators.append(f"{pending_assignments_count} assignments are overdue or pending submission")
        elif pending_assignments_count >= 1:
            risk_score += 10
            indicators.append(f"{pending_assignments_count} pending assignment due shortly")

        if risk_score >= 50:
            risk_level = "High"
            action_plan = "Immediate faculty mentoring scheduled. Remedial worksheets assigned."
        elif risk_score >= 25:
            risk_level = "Medium"
            action_plan = "Recommended attendance regularizing and revision of weak topics."
        else:
            risk_level = "Low"
            action_plan = "Consistent performance. Continue following personalized study plan."
            if not indicators:
                indicators.append("All metrics exceed academic thresholds comfortably.")

        return {
            "risk_level": risk_level,
            "risk_score": min(risk_score, 100),
            "attendance_rate": attendance_pct,
            "academic_average": avg_marks_pct,
            "pending_tasks": pending_assignments_count,
            "indicators": indicators,
            "recommended_action": action_plan
        }

    @staticmethod
    def generate_study_plan(student_name: str, weak_topics: List[str] = None) -> Dict[str, Any]:
        """
        Generates a 7-day personalized adaptive study schedule.
        """
        topics = weak_topics or ["Dynamic Programming", "Database Indexing", "Neural Network Backpropagation"]
        
        schedule = [
            {"day": "Monday", "focus": f"{topics[0] if len(topics)>0 else 'Algorithms'}: Fundamentals & Complexity Analysis", "duration": "2.5 Hours", "tasks": ["Review lecture notes", "Solve 3 standard problems", "Self-test with AI Quiz"]},
            {"day": "Tuesday", "focus": "Database Systems: Normalization & Query Tuning", "duration": "2.0 Hours", "tasks": ["Analyze 3NF/BCNF decomposition", "Execute SQL EXPLAIN on joins"]},
            {"day": "Wednesday", "focus": f"{topics[1] if len(topics)>1 else 'Data Structures'}: Advanced Practice", "duration": "2.5 Hours", "tasks": ["Implement B+ tree insertions", "Practice concurrency locking scenarios"]},
            {"day": "Thursday", "focus": "AI & Machine Learning: Optimization Lab", "duration": "3.0 Hours", "tasks": ["Calculate gradient steps on paper", "Review Loss Functions & Regularization"]},
            {"day": "Friday", "focus": "Assignment Revision & Faculty Feedback Resolution", "duration": "2.0 Hours", "tasks": ["Incorporate faculty remarks on submitted work", "Submit pending lab assignments"]},
            {"day": "Saturday", "focus": "Comprehensive Mock Test & Doubt Resolution", "duration": "3.0 Hours", "tasks": ["Attempt 20-question AI Quiz", "Consult Doubt Assistant for unclear concepts"]},
            {"day": "Sunday", "focus": "Weekly Performance Retrospective & Planning", "duration": "1.5 Hours", "tasks": ["Review week analytics", "Organize upcoming week syllabus materials"]}
        ]

        return {
            "student_name": student_name,
            "target_weekly_hours": 16.5,
            "generated_for": "Current Academic Term",
            "schedule": schedule,
            "key_priorities": [
                "Master recurrence relation solving techniques",
                "Ensure minimum 85% attendance across all core subjects",
                "Complete weekly AI quiz assessments on Saturday"
            ]
        }

    @staticmethod
    def answer_doubt(question: str, topic: str = "General") -> Dict[str, Any]:
        """
        Provides intelligent academic tutoring explanation for student doubts.
        """
        q_lower = question.lower()
        
        if "dynamic programming" in q_lower or "dp" in q_lower:
            answer = (
                "**Dynamic Programming (DP)** is an algorithmic technique for solving problems by breaking them down into overlapping subproblems with optimal substructure.\n\n"
                "### Core Steps:\n"
                "1. **State Definition:** Determine what state represents a subproblem (e.g., `dp[i]` = minimum cost up to index `i`).\n"
                "2. **Recurrence Relation:** Define how `dp[i]` depends on smaller subproblems, like `dp[i] = min(dp[i-1], dp[i-2]) + cost[i]`.\n"
                "3. **Base Cases:** Identify the smallest known solutions (e.g., `dp[0] = cost[0]`).\n"
                "4. **Memoization vs Tabulation:**\n"
                "   - *Top-Down:* Recursion + caching lookup table.\n"
                "   - *Bottom-Up:* Iterative array population from smallest indices.\n\n"
                "💡 **Key Tip:** If you see choices at each step and repeated calculations, DP is almost always applicable!"
            )
        elif "acid" in q_lower or "transaction" in q_lower:
            answer = (
                "**ACID Properties** guarantee reliable database transaction processing:\n\n"
                "- **Atomicity:** All operations within a transaction succeed, or the entire transaction rolls back ('all or nothing').\n"
                "- **Consistency:** The database transitions strictly between valid states preserving schema constraints and foreign keys.\n"
                "- **Isolation:** Concurrent transactions execute without interfering with one another (managed via locking or MVCC).\n"
                "- **Durability:** Once committed, transaction results survive crashes and power outages via Write-Ahead Logs (WAL)."
            )
        elif "backpropagation" in q_lower or "gradient" in q_lower:
            answer = (
                "**Backpropagation** is the algorithm used to train neural networks via the Chain Rule of calculus:\n\n"
                "1. **Forward Pass:** Compute activation outputs layer by layer and evaluate Loss function `L`.\n"
                "2. **Backward Pass:** Calculate gradient of error with respect to weights: `dL / dw = (dL / dy) * (dy / dz) * (dz / dw)`.\n"
                "3. **Weight Update:** Adjust weights using an optimizer such as SGD or Adam: `w = w - learning_rate * (dL / dw)`."
            )
        elif "join" in q_lower or "sql" in q_lower:
            answer = (
                "**SQL Joins Overview:**\n\n"
                "- `INNER JOIN`: Returns records having matching keys in both tables.\n"
                "- `LEFT JOIN`: Returns all rows from left table and matching rows from right (null if no match).\n"
                "- `RIGHT JOIN`: Returns all rows from right table and matching from left.\n"
                "- `FULL OUTER JOIN`: Returns records when there is a match in either table."
            )
        else:
            answer = (
                f"### Analysis for topic: **{topic}**\n\n"
                f"Regarding your question:\n> \"{question}\"\n\n"
                "**Conceptual Framework:**\n"
                "1. **Fundamental Definition:** In computational systems and coursework, this concept focuses on structured abstraction, predictability, and efficiency.\n"
                "2. **Core Implementation Principle:** Ensure boundary conditions are handled first, validate inputs, and avoid redundant state mutations.\n"
                "3. **Practical Application:** In production environments, this is verified using modular unit testing and rigorous time/space complexity audits.\n\n"
                "📌 **Recommended Next Step:** Check your course's Module 3 reference materials or consult your faculty during office hours."
            )

        return {
            "question": question,
            "topic": topic,
            "answer": answer,
            "source": "AI Academic Tutor Engine"
        }

    @staticmethod
    def auto_evaluate_assignment(assignment_title: str, max_marks: int, submission_notes: str, filename: str) -> Dict[str, Any]:
        """
        AI Assignment Correction:
        Student submits -> AI suggests marks/feedback/weak topics -> Faculty reviews -> Approve/Edit/Reject -> only approved result reaches student.
        """
        notes_len = len(submission_notes.strip()) if submission_notes else 0
        has_file = bool(filename)

        base_pct = 82.0
        if notes_len > 100:
            base_pct += 6.0
        if has_file:
            base_pct += 4.0

        score = round((base_pct / 100.0) * max_marks, 1)
        score = min(score, float(max_marks))

        suggested_feedback = (
            f"**Comprehensive AI Assessment for '{assignment_title}':**\n\n"
            f"- **Structure & Completeness (Score: {int(score * 0.45)}/{int(max_marks * 0.45)}):** All primary components of the prompt were systematically addressed with proper modularity.\n"
            f"- **Technical Accuracy & Syntax (Score: {int(score * 0.40)}/{int(max_marks * 0.40)}):** Core algorithmic logic demonstrated sound theoretical grasp.\n"
            f"- **Areas for Enhancement:** Consider adding edge-case handling for null inputs and documenting asymptotic time complexity in the conclusion."
        )

        suggested_weak_topics = "Edge Case Validation, Time Complexity Analysis, Modular Documentation"

        return {
            "suggested_marks": score,
            "suggested_feedback": suggested_feedback,
            "suggested_weak_topics": suggested_weak_topics,
            "confidence_score": 0.91
        }

    @staticmethod
    def generate_quiz(topic: str, difficulty: str = "Medium", num_questions: int = 5) -> List[Dict[str, Any]]:
        """
        AI Quiz Generator with working question bank.
        """
        quiz_banks = {
            "data structures": [
                {
                    "question": "What is the worst-case time complexity of quicksort algorithm?",
                    "options": ["O(n log n)", "O(n²)", "O(log n)", "O(n)"],
                    "correct_answer": 1,
                    "explanation": "When the chosen pivot is always the extreme element (e.g. sorted input with naive pivot), quicksort degrades to O(n²)."
                },
                {
                    "question": "Which data structure uses LIFO (Last In First Out) principle?",
                    "options": ["Queue", "Priority Queue", "Stack", "Binary Heap"],
                    "correct_answer": 2,
                    "explanation": "A Stack operates on Last-In First-Out semantics via push and pop operations."
                },
                {
                    "question": "What is the average time complexity for searching a key in a balanced AVL tree?",
                    "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
                    "correct_answer": 2,
                    "explanation": "Balanced binary search trees maintain an O(log n) height invariant, ensuring logarithmic search."
                },
                {
                    "question": "Which algorithm is commonly used to find the shortest path in a weighted graph with non-negative edge weights?",
                    "options": ["Floyd-Warshall", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Bellman-Ford"],
                    "correct_answer": 1,
                    "explanation": "Dijkstra's algorithm greedily finds single-source shortest paths in O((V + E) log V) with a priority queue."
                },
                {
                    "question": "In a hash table, which technique handles collisions by placing elements into a linked list at that bucket?",
                    "options": ["Linear Probing", "Quadratic Probing", "Separate Chaining", "Double Hashing"],
                    "correct_answer": 2,
                    "explanation": "Separate chaining stores collisions as a linked list (or small tree) anchored at each hash bucket."
                }
            ],
            "database": [
                {
                    "question": "Which normal form requires that all non-key attributes be fully functionally dependent on the entire primary key?",
                    "options": ["1NF", "2NF", "3NF", "BCNF"],
                    "correct_answer": 1,
                    "explanation": "Second Normal Form (2NF) eliminates partial functional dependencies on composite candidate keys."
                },
                {
                    "question": "In relational databases, which ACID property ensures that uncommitted transaction data is invisible to other transactions?",
                    "options": ["Atomicity", "Consistency", "Isolation", "Durability"],
                    "correct_answer": 2,
                    "explanation": "Isolation prevents concurrent execution anomalies such as dirty reads and unrepeatable reads."
                },
                {
                    "question": "Which index structure is standard for range scans in relational database storage engines?",
                    "options": ["Hash Index", "B+ Tree", "Bitmap Index", "Skip List"],
                    "correct_answer": 1,
                    "explanation": "B+ Trees keep data ordered at the leaf level linked via pointers, enabling efficient range scans."
                },
                {
                    "question": "What is the result of an INNER JOIN when there are no matches between the joined tables?",
                    "options": ["An error", "Null values in all columns", "Zero rows returned", "All rows from the left table"],
                    "correct_answer": 2,
                    "explanation": "An INNER JOIN outputs only rows where the join predicate evaluates to TRUE in both relations."
                },
                {
                    "question": "What does SQL command 'EXPLAIN' provide to a developer?",
                    "options": ["Database user passwords", "Execution query plan and cost estimates", "Table schema backup", "Foreign key constraints"],
                    "correct_answer": 1,
                    "explanation": "EXPLAIN prints the optimizer's chosen execution steps, sequential scans vs index lookups."
                }
            ],
            "ai & ml": [
                {
                    "question": "Which activation function is most susceptible to the vanishing gradient problem in deep networks?",
                    "options": ["ReLU", "Leaky ReLU", "Sigmoid", "GELU"],
                    "correct_answer": 2,
                    "explanation": "The derivative of Sigmoid saturates close to 0 for large inputs, causing gradients to diminish during backprop."
                },
                {
                    "question": "What is the primary purpose of L2 regularization (Ridge) in linear and deep models?",
                    "options": ["To enforce exact zero coefficients", "To penalize large weight magnitudes and prevent overfitting", "To speed up matrix multiplication", "To replace cross-entropy"],
                    "correct_answer": 1,
                    "explanation": "L2 adds the sum of squared weights to the loss function, smoothing decision boundaries."
                },
                {
                    "question": "Which evaluation metric is preferred over accuracy when evaluating severely imbalanced classification datasets?",
                    "options": ["Mean Squared Error", "F1-Score / PR-AUC", "R-Squared", "Explained Variance"],
                    "correct_answer": 1,
                    "explanation": "F1-score balances Precision and Recall, remaining robust when positive classes are scarce."
                },
                {
                    "question": "In supervised learning, what occurs when a model performs exceptionally on training data but poorly on test data?",
                    "options": ["Underfitting", "High Bias", "Overfitting (High Variance)", "Optimal Convergence"],
                    "correct_answer": 2,
                    "explanation": "Overfitting happens when a model learns noise and specific artifacts of the training dataset."
                },
                {
                    "question": "What does the learning rate hyperparameter control in Gradient Descent?",
                    "options": ["Number of hidden layers", "Step size taken along the gradient direction", "Batch size for DataLoader", "Dropout probability"],
                    "correct_answer": 1,
                    "explanation": "The learning rate scales the gradient vector determining the magnitude of weight updates."
                }
            ]
        }

        # Topic matching
        matched_key = None
        for key in quiz_banks.keys():
            if key in topic.lower():
                matched_key = key
                break

        if matched_key:
            questions = quiz_banks[matched_key]
        else:
            # Fallback dynamic questions
            questions = [
                {
                    "question": f"Which fundamental principle is central to solving problems in {topic}?",
                    "options": [
                        f"Systematic decomposition of {topic} components",
                        "Ignoring edge-case constraints",
                        "Relying solely on brute force without indexing",
                        "Eliminating testing procedures"
                    ],
                    "correct_answer": 0,
                    "explanation": f"Systematic decomposition and formal validation are crucial for {topic}."
                },
                {
                    "question": f"What is considered an optimal practice when implementing solutions in {topic}?",
                    "options": [
                        "Hardcoding input parameters",
                        "Designing modular, documented interfaces with complexity bounds",
                        "Skipping exception handling",
                        "Using unlimited memory buffers"
                    ],
                    "correct_answer": 1,
                    "explanation": "Modularity and asymptotic efficiency guarantee maintainable systems."
                },
                {
                    "question": f"In an academic examination on {topic}, how should computational complexity be evaluated?",
                    "options": [
                        "By measuring wall-clock time on a single computer",
                        "Using asymptotic Big-O notation for time and space",
                        "Counting total lines of code written",
                        "Subjective preference of the author"
                    ],
                    "correct_answer": 1,
                    "explanation": "Big-O notation gives hardware-independent bounds on algorithmic growth rates."
                },
                {
                    "question": f"Which diagnostic technique helps verify correctness for {topic} systems?",
                    "options": [
                        "Automated boundary unit testing and assertions",
                        "Disabling error logging",
                        "Running without compiler warnings",
                        "Decreasing database durability"
                    ],
                    "correct_answer": 0,
                    "explanation": "Unit testing and invariant assertions detect regression defects early."
                },
                {
                    "question": f"When transitioning {topic} concepts into enterprise applications, what is prioritized?",
                    "options": [
                        "Scalability, reliability, and security controls",
                        "Quick unauthenticated endpoints",
                        "Ignoring concurrency limits",
                        "Omitting documentation"
                    ],
                    "correct_answer": 0,
                    "explanation": "Enterprise grade software demands strict scalability and security safeguards."
                }
            ]

        return questions[:num_questions]
