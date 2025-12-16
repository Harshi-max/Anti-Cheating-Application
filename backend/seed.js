const mongoose = require('mongoose');
const User = require('./models/User');
const Exam = require('./models/Exam');
const ExamAttempt = require('./models/ExamAttempt');
const Violation = require('./models/Violation');
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

    // Create admin user
    const admin = new User({
      userId: 'admin1',
      password: 'admin123',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    });
    // Create additional test users
    const user2 = new User({
      userId: 'student2',
      password: 'password123',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'student'
    });
    await user2.save();
    console.log('Created test user:', user2.userId);

    const user3 = new User({
      userId: 'student3',
      password: 'password123',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'student'
    });
    await user3.save();
    console.log('Created test user:', user3.userId);

    const user4 = new User({
      userId: 'student4',
      password: 'password123',
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      role: 'student'
    });
    await user4.save();
    console.log('Created test user:', user4.userId);

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
      isActive: true,
      isPublished: true
    });
    await exam.save();
    console.log('Created test exam:', exam.title);

    // Create another test exam - Science
    const exam2 = new Exam({
      title: 'Science Quiz',
      description: 'Basic science questions',
      questions: [
        {
          question: 'What is the chemical symbol for water?',
          options: ['H2O', 'CO2', 'O2', 'N2'],
          correctAnswer: 0
        },
        {
          question: 'What planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 1
        },
        {
          question: 'What is the largest organ in the human body?',
          options: ['Heart', 'Brain', 'Skin', 'Liver'],
          correctAnswer: 2
        },
        {
          question: 'What gas do plants absorb from the atmosphere?',
          options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
          correctAnswer: 1
        }
      ],
      duration: 25,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user._id],
      isActive: true,
      isPublished: true
    });
    await exam2.save();
    console.log('Created test exam:', exam2.title);

    // Create another test exam - History
    const exam3 = new Exam({
      title: 'History Quiz',
      description: 'Basic history questions',
      questions: [
        {
          question: 'In which year did World War II end?',
          options: ['1944', '1945', '1946', '1947'],
          correctAnswer: 1
        },
        {
          question: 'Who was the first President of the United States?',
          options: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'],
          correctAnswer: 2
        },
        {
          question: 'Which ancient civilization built the pyramids?',
          options: ['Romans', 'Greeks', 'Egyptians', 'Mayans'],
          correctAnswer: 2
        },
        {
          question: 'What was the name of the ship that carried the Pilgrims to America?',
          options: ['Santa Maria', 'Mayflower', 'Beagle', 'Endeavour'],
          correctAnswer: 1
        }
      ],
      duration: 20,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user._id],
      isActive: true,
      isPublished: true
    });
    // Create subject-specific exams (restricted to student1 only)
    const mathExam = new Exam({
      title: 'Advanced Mathematics',
      description: 'Advanced calculus and algebra problems',
      questions: [
        {
          question: 'What is the derivative of x²?',
          options: ['x', '2x', 'x²', '2'],
          correctAnswer: 1
        },
        {
          question: 'What is the integral of 2x dx?',
          options: ['x²', 'x² + C', '2x²', '2x² + C'],
          correctAnswer: 1
        },
        {
          question: 'What is the value of π (pi) to 2 decimal places?',
          options: ['3.14', '3.15', '3.16', '3.17'],
          correctAnswer: 0
        },
        {
          question: 'What is the square root of 144?',
          options: ['10', '11', '12', '13'],
          correctAnswer: 2
        },
        {
          question: 'What is 15% of 200?',
          options: ['25', '30', '35', '40'],
          correctAnswer: 1
        }
      ],
      duration: 45,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user._id], // Only student1
      isActive: true,
      isPublished: true
    });
    await mathExam.save();
    console.log('Created restricted exam:', mathExam.title);

    const physicsExam = new Exam({
      title: 'Physics Fundamentals',
      description: 'Basic physics concepts and problems',
      questions: [
        {
          question: 'What is the SI unit of force?',
          options: ['Watt', 'Newton', 'Joule', 'Pascal'],
          correctAnswer: 1
        },
        {
          question: 'What is the acceleration due to gravity on Earth?',
          options: ['8.9 m/s²', '9.8 m/s²', '10.2 m/s²', '11.1 m/s²'],
          correctAnswer: 1
        },
        {
          question: 'What is the formula for kinetic energy?',
          options: ['1/2 mv', '1/2 mv²', 'mv²', '1/2 m²v'],
          correctAnswer: 1
        },
        {
          question: 'What is the speed of light in vacuum?',
          options: ['3 × 10⁶ m/s', '3 × 10⁷ m/s', '3 × 10⁸ m/s', '3 × 10⁹ m/s'],
          correctAnswer: 2
        },
        {
          question: 'What is the unit of electrical resistance?',
          options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
          correctAnswer: 2
        }
      ],
      duration: 40,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user._id], // Only student1
      isActive: true,
      isPublished: true
    });
    await physicsExam.save();
    console.log('Created restricted exam:', physicsExam.title);

    const chemistryExam = new Exam({
      title: 'Chemistry Basics',
      description: 'Fundamental chemistry concepts',
      questions: [
        {
          question: 'What is the chemical symbol for gold?',
          options: ['Go', 'Gd', 'Au', 'Ag'],
          correctAnswer: 2
        },
        {
          question: 'What is the pH of pure water?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 2
        },
        {
          question: 'What is the molecular formula of water?',
          options: ['H₂', 'O₂', 'H₂O', 'HO₂'],
          correctAnswer: 2
        },
        {
          question: 'What is the atomic number of carbon?',
          options: ['4', '6', '8', '12'],
          correctAnswer: 1
        },
        {
          question: 'What is the chemical name for table salt?',
          options: ['Sodium chloride', 'Calcium chloride', 'Potassium chloride', 'Magnesium chloride'],
          correctAnswer: 0
        }
      ],
      duration: 35,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user._id], // Only student1
      isActive: true,
      isPublished: true
    });
    await chemistryExam.save();
    console.log('Created restricted exam:', chemistryExam.title);

    // Create coding exam - JavaScript
    const codingExam1 = new Exam({
      title: 'JavaScript Fundamentals',
      description: 'Basic JavaScript programming concepts',
      questions: [
        {
          question: 'What will `console.log(typeof null)` output?',
          options: ['"null"', '"undefined"', '"object"', '"boolean"'],
          correctAnswer: 2
        },
        {
          question: 'Which method adds an element to the end of an array?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctAnswer: 0
        },
        {
          question: 'What does the `===` operator do?',
          options: ['Assignment', 'Comparison with type coercion', 'Strict equality comparison', 'Logical AND'],
          correctAnswer: 2
        },
        {
          question: 'Which of these is NOT a JavaScript data type?',
          options: ['string', 'boolean', 'integer', 'undefined'],
          correctAnswer: 2
        },
        {
          question: 'What is a closure in JavaScript?',
          options: ['A way to close browser windows', 'A function that has access to variables in its outer scope', 'A method to close database connections', 'A type of loop'],
          correctAnswer: 1
        }
      ],
      duration: 45,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user2._id, user3._id],
      isActive: true,
      isPublished: true
    });
    await codingExam1.save();
    console.log('Created coding exam:', codingExam1.title);

    // Create coding exam - Python
    const codingExam2 = new Exam({
      title: 'Python Programming Basics',
      description: 'Fundamental Python programming concepts',
      questions: [
        {
          question: 'What is the output of `print(2 ** 3)`?',
          options: ['6', '8', '9', '16'],
          correctAnswer: 1
        },
        {
          question: 'Which of these is used to define a function in Python?',
          options: ['function', 'def', 'func', 'define'],
          correctAnswer: 1
        },
        {
          question: 'What does `len([1, 2, 3, 4])` return?',
          options: ['3', '4', '5', 'Error'],
          correctAnswer: 1
        },
        {
          question: 'Which data type is mutable in Python?',
          options: ['string', 'tuple', 'list', 'int'],
          correctAnswer: 2
        },
        {
          question: 'What is the correct way to create a comment in Python?',
          options: ['// comment', '/* comment */', '# comment', '<!-- comment -->'],
          correctAnswer: 2
        }
      ],
      duration: 40,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user3._id, user4._id],
      isActive: true,
      isPublished: true
    });
    await codingExam2.save();
    console.log('Created coding exam:', codingExam2.title);

    // Create Data Structures exam
    const dsExam = new Exam({
      title: 'Data Structures & Algorithms',
      description: 'Fundamental data structures and algorithms concepts',
      questions: [
        {
          question: 'What is the time complexity of accessing an element in an array by index?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          correctAnswer: 0
        },
        {
          question: 'Which data structure follows LIFO (Last In, First Out) principle?',
          options: ['Queue', 'Stack', 'Array', 'Linked List'],
          correctAnswer: 1
        },
        {
          question: 'What is the worst-case time complexity of Quick Sort?',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          correctAnswer: 2
        },
        {
          question: 'Which of these is NOT a type of tree traversal?',
          options: ['Inorder', 'Preorder', 'Postorder', 'Crossorder'],
          correctAnswer: 3
        },
        {
          question: 'What does BFS stand for?',
          options: ['Binary First Search', 'Breadth First Search', 'Best First Search', 'Basic First Search'],
          correctAnswer: 1
        }
      ],
      duration: 60,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user2._id, user4._id],
      isActive: true,
      isPublished: true
    });
    await dsExam.save();
    console.log('Created data structures exam:', dsExam.title);

    // Create Database exam
    const dbExam = new Exam({
      title: 'Database Management Systems',
      description: 'SQL and database concepts',
      questions: [
        {
          question: 'What does SQL stand for?',
          options: ['Simple Query Language', 'Structured Query Language', 'Standard Query Language', 'System Query Language'],
          correctAnswer: 1
        },
        {
          question: 'Which SQL command is used to retrieve data from a database?',
          options: ['INSERT', 'UPDATE', 'DELETE', 'SELECT'],
          correctAnswer: 3
        },
        {
          question: 'What is a primary key?',
          options: ['A key that opens the database', 'A unique identifier for each record', 'A password for database access', 'A type of index'],
          correctAnswer: 1
        },
        {
          question: 'Which normal form eliminates transitive dependencies?',
          options: ['1NF', '2NF', '3NF', '4NF'],
          correctAnswer: 2
        },
        {
          question: 'What does ACID stand for in database transactions?',
          options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integrity, Data', 'Automatic, Consistent, Independent, Durable', 'All, Complete, Integrated, Dynamic'],
          correctAnswer: 0
        }
      ],
      duration: 35,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user._id, user3._id],
      isActive: true,
      isPublished: true
    });
    await dbExam.save();
    console.log('Created database exam:', dbExam.title);

    // Create Web Development exam
    const webExam = new Exam({
      title: 'Web Development Fundamentals',
      description: 'HTML, CSS, and JavaScript basics',
      questions: [
        {
          question: 'What does HTML stand for?',
          options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'],
          correctAnswer: 0
        },
        {
          question: 'Which CSS property is used to change the background color?',
          options: ['color', 'background-color', 'bgcolor', 'background'],
          correctAnswer: 1
        },
        {
          question: 'What is the correct HTML element for the largest heading?',
          options: ['<h1>', '<heading>', '<h6>', '<head>'],
          correctAnswer: 0
        },
        {
          question: 'Which JavaScript method is used to select an HTML element by its ID?',
          options: ['getElementById()', 'querySelector()', 'getElementsByClassName()', 'getElementByTagName()'],
          correctAnswer: 0
        },
        {
          question: 'What does CSS stand for?',
          options: ['Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'],
          correctAnswer: 2
        }
      ],
      duration: 30,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedUsers: [user._id, user2._id, user4._id],
      isActive: true,
      isPublished: true
    });
    await webExam.save();
    console.log('Created web development exam:', webExam.title);

    // Update users with assigned exams
    user.assignedExams.push(exam._id, exam2._id, exam3._id, dbExam._id, webExam._id, mathExam._id, physicsExam._id, chemistryExam._id);
    await user.save();

    user2.assignedExams.push(codingExam1._id, dsExam._id, webExam._id);
    await user2.save();

    user3.assignedExams.push(codingExam1._id, codingExam2._id, dbExam._id);
    await user3.save();

    user4.assignedExams.push(codingExam2._id, dsExam._id, webExam._id);
    await user4.save();

    // Create sample completed exam attempt
    const completedAttempt = new ExamAttempt({
      user: user._id,
      exam: exam._id,
      answers: [
        { questionIndex: 0, selectedAnswer: 1, isCorrect: true },
        { questionIndex: 1, selectedAnswer: 1, isCorrect: true },
        { questionIndex: 2, selectedAnswer: 1, isCorrect: true },
        { questionIndex: 3, selectedAnswer: 1, isCorrect: true },
        { questionIndex: 4, selectedAnswer: 1, isCorrect: true }
      ],
      score: 100,
      totalQuestions: 5,
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      endTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      submittedAt: new Date(Date.now() - 25 * 60 * 1000),
      violations: [],
      violationCount: 0,
      maxViolations: 3,
      status: 'completed',
      isFullscreen: true
    });
    await completedAttempt.save();
    console.log('Created sample completed exam attempt');

    // Create sample violation
    const violation = new Violation({
      examAttempt: completedAttempt._id,
      user: user._id,
      exam: exam._id,
      type: 'TAB_SWITCH',
      severity: 'medium',
      description: 'User switched browser tab during exam',
      timestamp: new Date(Date.now() - 27 * 60 * 1000) // 27 minutes ago
    });
    await violation.save();

    // Update attempt with violation
    completedAttempt.violations.push(violation._id);
    completedAttempt.violationCount = 1;
    await completedAttempt.save();
    console.log('Created sample violation');

    console.log('Seed data created successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin1 / admin123');
    console.log('\nStudent 1 (John Doe): student1 / password123');
    console.log('  Restricted Exams (only accessible by student1):');
    console.log('  - Mathematics Quiz, Science Quiz, History Quiz');
    console.log('  - Advanced Mathematics, Physics Fundamentals, Chemistry Basics');
    console.log('  - Database Management Systems, Web Development Fundamentals');
    console.log('\nStudent 2 (Jane Smith): student2 / password123');
    console.log('  Exams: JavaScript Fundamentals, Data Structures & Algorithms, Web Development Fundamentals');
    console.log('\nStudent 3 (Bob Johnson): student3 / password123');
    console.log('  Exams: JavaScript Fundamentals, Python Programming Basics, Database Management Systems');
    console.log('\nStudent 4 (Alice Brown): student4 / password123');
    console.log('  Exams: Python Programming Basics, Data Structures & Algorithms, Web Development Fundamentals');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

