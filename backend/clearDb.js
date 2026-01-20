const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('./models/User');
const Exam = require('./models/Exam');
const ExamAttempt = require('./models/ExamAttempt');
const Violation = require('./models/Violation');

dotenv.config();

async function clearDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_app';
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('Connected to MongoDB:', uri);

  const [users, exams, attempts, violations] = await Promise.all([
    User.deleteMany({}),
    Exam.deleteMany({}),
    ExamAttempt.deleteMany({}),
    Violation.deleteMany({})
  ]);

  console.log('Deleted counts:');
  console.log('- users:', users.deletedCount);
  console.log('- exams:', exams.deletedCount);
  console.log('- examAttempts:', attempts.deletedCount);
  console.log('- violations:', violations.deletedCount);

  await mongoose.disconnect();
  console.log('Done.');
}

clearDb().catch((err) => {
  console.error('Failed to clear DB:', err);
  process.exit(1);
});


