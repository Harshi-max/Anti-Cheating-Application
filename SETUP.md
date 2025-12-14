# Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

## Step 1: Backend Setup

```bash
cd exam-app/backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam_app
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

Start MongoDB (if running locally):
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

Seed test data:
```bash
npm run seed
```

Start backend:
```bash
npm run dev
```

## Step 2: Frontend Setup

```bash
cd exam-app/frontend
npm install
npm start
```

## Step 3: Access Application

1. Open browser: `http://localhost:3000`
2. Login with:
   - User ID: `student1`
   - Password: `password123`

## Test Exam

A sample exam "Mathematics Quiz" with 5 questions is already created and assigned to the test user.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in `.env`
- For MongoDB Atlas, use connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/exam_app`

### Camera Access Denied
- Browser requires HTTPS in production
- For localhost, allow camera permissions
- Check browser console for errors

### Face Detection Not Working
- Ensure WebGL is enabled in browser
- Check browser console for TensorFlow.js errors
- Try refreshing the page

### Port Already in Use
- Change PORT in backend `.env`
- Update REACT_APP_API_URL in frontend `.env`

