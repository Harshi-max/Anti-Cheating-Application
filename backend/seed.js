const mongoose = require('mongoose');
const User = require('./models/User');
const Exam = require('./models/Exam');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Exam.deleteMany({});

    // Create test user
    const user = new User({
      userId: 'student1',
      password: 'password123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'student'
    });
    await user.save();
    console.log('Created test user:', user.userId);

    // Create test exam
    const exam = new Exam({
      title: 'Mathematics Quiz',
      description: 'Basic mathematics questions',
      questions: [
        {
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1
        },
        {
          question: 'What is the square root of 16?',
          options: ['2', '4', '6', '8'],
          correctAnswer: 1
        },
        {
          question: 'What is 10 × 5?',
          options: ['40', '50', '60', '70'],
          correctAnswer: 1
        },
        {
          question: 'What is 100 ÷ 4?',
          options: ['20', '25', '30', '35'],
          correctAnswer: 1
        },
        {
          question: 'What is 3²?',
          options: ['6', '9', '12', '15'],
          correctAnswer: 1
        }
      ],
      duration: 30,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      assignedUsers: [user._id],
      isActive: true
    });
    await exam.save();
    console.log('Created test exam:', exam.title);

    // Update user with assigned exam
    user.assignedExams.push(exam._id);
    await user.save();

    console.log('Seed data created successfully!');
    console.log('\nTest credentials:');
    console.log('User ID: student1');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

