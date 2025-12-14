# Production-Quality Anti-Cheating Exam Application

A comprehensive, production-ready web application for conducting secure online examinations with advanced AI-powered anti-cheating mechanisms.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Token Authentication** - Secure login and session management
- **User Registration** - Complete registration flow with validation
- **Password Hashing** - bcrypt for secure password storage
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Server-side validation with express-validator
- **Helmet Security** - Security headers and protection

### 📋 Exam Management
- **Student Dashboard** - View all assigned exams
- **Timeslot Validation** - Exams can only be started during valid time windows
- **Exam Instructions** - Detailed instructions page before starting
- **MCQ Questions** - Multiple choice question interface
- **Real-time Progress** - Track answered questions and progress
- **Timer Countdown** - Visual countdown with auto-submit
- **Results Page** - Detailed results with score and violations

### 🚨 Comprehensive Anti-Cheating System

#### Frontend Detection:
- ✅ **Tab Switch Detection** - Detects when user switches tabs
- ✅ **Window Blur Detection** - Detects when window loses focus
- ✅ **Fullscreen Enforcement** - Automatically enters and maintains fullscreen
- ✅ **Copy/Paste Prevention** - Blocks Ctrl+C, Ctrl+V, Ctrl+X
- ✅ **Right-Click Disabled** - Prevents context menu
- ✅ **Screenshot Prevention** - Blocks Print Screen key
- ✅ **Developer Tools Block** - Prevents F12, Ctrl+Shift+I/J
- ✅ **AI Face Detection** - Real-time face monitoring using TensorFlow.js

#### Violation Management:
- **Real-time Violation Logging** - Every violation logged instantly
- **Violation Counter** - Visual counter showing violations (max 3)
- **Warning Modals** - Animated warning popups for violations
- **Auto-Submit** - Exam automatically submitted after 3 violations
- **Violation Types**:
  - `TAB_SWITCH` - User switched tabs
  - `WINDOW_BLUR` - Window lost focus
  - `FULLSCREEN_EXIT` - Exited fullscreen mode
  - `COPY_PASTE` - Copy/paste attempt
  - `FACE_MOVED` - Significant face movement
  - `FACE_NOT_DETECTED` - Face not visible
  - `MULTIPLE_FACES` - Multiple people detected

### 🎨 Modern UI/UX
- **Tailwind CSS** - Modern, responsive design
- **Dark Mode** - Full dark mode support with toggle
- **Smooth Animations** - Framer Motion for fluid transitions
- **Toast Notifications** - React Hot Toast for user feedback
- **Loading States** - Skeleton loaders and spinners
- **Responsive Design** - Mobile, tablet, and desktop support
- **Professional Color Palette** - Clean, modern aesthetics

### 📱 Pages
1. **Landing Page** - Hero section, features, call-to-action
2. **Login Page** - Secure authentication with validation
3. **Register Page** - User registration with form validation
4. **Student Dashboard** - Exam listing with status indicators
5. **Exam Instructions** - Rules, guidelines, and agreement
6. **Exam Interface** - Fullscreen exam with anti-cheating
7. **Results Page** - Score, violations, and exam details

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hot Toast** - Toast notifications
- **TensorFlow.js** - Machine learning
- **MediaPipe Face Mesh** - Face detection model
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting
- **Helmet** - Security middleware

## 📁 Project Structure

```
exam-app/
├── backend/
│   ├── controllers/
│   │   └── violationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Exam.js
│   │   ├── ExamAttempt.js
│   │   └── Violation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── exam.js
│   │   ├── user.js
│   │   └── violation.js
│   ├── server.js
│   ├── seed.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FaceDetector.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/
│   │   │   ├── Landing.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Home.js
│   │   │   ├── ExamInstructions.js
│   │   │   ├── Exam.js
│   │   │   └── Results.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd exam-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam_app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Seed test data:
```bash
npm run seed
```

6. Start server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd exam-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm start
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials

### Exams
- `GET /api/exams/assigned` - Get assigned exams
- `GET /api/exams/:examId` - Get exam details
- `POST /api/exams/:examId/start` - Start exam attempt
- `POST /api/exams/:examId/answer` - Submit answer
- `POST /api/exams/:examId/submit` - Submit exam
- `GET /api/exams/:examId/attempt/:attemptId` - Get attempt progress
- `GET /api/exams/:examId/attempt` - Get latest attempt (for results)

### Violations
- `POST /api/violations/log` - Log violation
- `GET /api/violations/attempt/:attemptId` - Get violations for attempt

### Users
- `GET /api/users/me` - Get current user

## 🧪 Test Credentials

After running `npm run seed`:
- **User ID**: `student1`
- **Password**: `password123`

## 🔒 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt with salt rounds
3. **Rate Limiting** - Prevents brute force attacks
4. **Input Validation** - Server-side validation
5. **Helmet** - Security headers
6. **CORS** - Configured for production
7. **Error Handling** - Centralized error handling

## 🎯 Anti-Cheating Features

### Detection Methods:
1. **Tab Switch** - `visibilitychange` API
2. **Window Blur** - `blur` event listener
3. **Fullscreen Exit** - `fullscreenchange` event
4. **Copy/Paste** - Keyboard event blocking
5. **Right-Click** - Context menu prevention
6. **Screenshot** - Print Screen key blocking
7. **Face Detection** - TensorFlow.js ML model

### Violation Flow:
1. Violation detected → Logged to backend
2. Violation count incremented
3. Warning modal shown (first 2 violations)
4. Auto-submit on 3rd violation
5. All violations stored with timestamps

## 🌙 Dark Mode

Full dark mode support across all pages with:
- System preference detection
- Manual toggle
- Persistent storage
- Smooth transitions

## 📊 Database Models

### User
- userId, password, name, email, role, assignedExams

### Exam
- title, description, questions, duration, startTime, endTime, assignedUsers

### ExamAttempt
- user, exam, answers, score, violations, violationCount, status, startTime, endTime

### Violation
- examAttempt, user, exam, type, severity, description, metadata, timestamp

## 🚀 Production Deployment

1. Set secure `JWT_SECRET`
2. Use MongoDB Atlas or secure MongoDB
3. Enable HTTPS (required for camera)
4. Set `NODE_ENV=production`
5. Build frontend: `npm run build`
6. Use PM2 or similar for backend
7. Configure environment variables
8. Set up proper CORS
9. Enable error logging

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.
