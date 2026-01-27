# 🛡️ Production-Quality Anti-Cheating Exam Platform

A **secure, scalable, production-ready online examination system** supporting **MCQ and Coding Assessments** with **AI-powered anti-cheating**, **automatic code evaluation**, and a **backend-authoritative architecture**.

---

## ✨ Overview

This platform enables organizations and institutions to conduct **secure online exams** with strong cheating prevention, real-time monitoring, and automated evaluation for both **objective (MCQ)** and **subjective (Coding)** assessments.

**Key highlights**
- MCQ + Coding exams in a single platform
- Automatic code evaluation with test cases
- AI-based proctoring & violation tracking
- Backend-authoritative security model
- Enterprise-grade architecture & scalability

---

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication (Access & Refresh tokens)
- Secure password hashing using bcrypt
- Rate limiting to prevent brute-force attacks
- Server-side validation with express-validator
- Security headers via Helmet
- Role-based access (Admin / Student)

---

### 📋 Exam Management
- Create and manage exams (Draft → Published → Active → Closed)
- Assign exams to students
- Strict time-window enforcement (backend controlled)
- Auto-submit on time expiry
- Mix MCQ and Coding questions in the same exam
- Real-time exam progress tracking

---

### 🧠 Coding Questions (Automatic Evaluation)

Admins can create coding problems with:
- Multiple language support (Python, Java, C++, JavaScript)
- Starter code templates per language
- Sample test cases (visible to students)
- Hidden test cases (evaluation only)
- Configurable scoring

Students can:
- Choose preferred programming language
- View sample test cases
- Write and submit code in-browser
- Get instant feedback on test results
- Re-submit multiple times (last submission counts)

---

### 🚨 AI-Powered Anti-Cheating System

#### Frontend Detection
- Tab switch detection
- Window blur detection
- Fullscreen enforcement
- Copy / Paste blocking
- Right-click disabled
- Screenshot (Print Screen) blocking
- Developer tools blocking
- AI face detection using TensorFlow.js + MediaPipe

#### Violation Handling
- Real-time violation logging
- Visual violation counter (max 5)
- Warning modals
- Automatic exam submission after repeated violations
- Complete audit trail

**Violation Types**
- TAB_SWITCH
- WINDOW_BLUR
- FULLSCREEN_EXIT
- COPY_PASTE
- FACE_NOT_DETECTED
- MULTIPLE_FACES

---

## 👥 User Workflows

### 👨‍💼 Admin Workflow
Login
→ Create Exam
→ Add MCQ / Coding Questions
→ Configure Test Cases
→ Publish Exam
→ Assign Students
→ Monitor Submissions
→ Review Results & Violations


### 👨‍🎓 Student Workflow


Login
→ Start Exam
→ Enter Fullscreen
→ Answer MCQs / Solve Coding Problems
→ Submit Exam
→ View Results


### 🧪 Code Execution Flow


Submit Code
→ Backend Sandbox
→ Compile
→ Run Test Cases
→ Store Results
→ Instant Feedback

---

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- Tailwind CSS
- Framer Motion
- Axios
- TensorFlow.js
- MediaPipe Face Mesh
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt
- express-validator
- express-rate-limit
- Helmet

## 📁 Project Structure

```
exam-app/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
└── README.md
```

---

## 🧩 Data Models (Simplified)

### Question Schema
```js
{
  type: "MCQ" | "CODING",
  question: "Problem description",
  options?: [],
  correctAnswer?: number,
  languages?: ["python", "java", "cpp", "javascript"],
  starterCode?: { python: "..." },
  testCases?: [
    { input: "5", expectedOutput: "120", isSample: true }
  ],
  maxScore: 10
}
```

### Code Submission Schema
```js
{
  user,
  exam,
  language,
  sourceCode,
  status: "queued" | "running" | "completed" | "error",
  score,
  testResults
}
```

---

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 🔌 API Highlights

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Exams

```
GET /api/exams/assigned
POST /api/exams/:examId/start
POST /api/exams/:examId/submit
```

### Coding

```
POST /api/exams/:examId/coding/submit
GET /api/exams/:examId/code-submissions (Admin)
```

### Violations

```
POST /api/violations/log
```

---

## 🧪 Test Credentials(for demo but u can also register and signin)

- User: student1
- Password: password123

---

## 🏗️ Backend-Authoritative Architecture

### Core Principle

Frontend only captures events. Backend makes all decisions.

### Why this matters

- Prevents time manipulation
- Prevents fake submissions
- Ensures accurate violation handling
- Enables auditing & compliance


---

## 📊 Success Metrics

- 95%+ test coverage
- Zero critical security vulnerabilities
- <200ms average API response time
- 99.9% code execution success rate
- Full audit trail for exams

---

## 🔒 Production Checklist

- HTTPS enabled (camera access required)
- Secure JWT secrets
- MongoDB Atlas / secured database
- Dockerized code execution sandbox
- Centralized logging & monitoring

---

## 🚀 Future Enhancements

- WebSocket-based real-time updates
- Plagiarism detection
- Code diff viewer between submissions
- Per-test-case scoring
- Analytics export (PDF / CSV)
- Multi-file coding problems
