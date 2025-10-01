const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../models/User');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Problem.deleteMany({});
    await TestCase.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ----------------------
    // 1️⃣ SEED ADMIN
    // ----------------------
    const admin = await User.create({
      username: 'admin',
      email: 'admin@codejudge.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'admin',
      rating: 2000,
      class: 'ADMIN' // ✅ Fix class
    });

    console.log('✅ Created admin user');

    // ----------------------
    // 2️⃣ SEED TEST USERS
    // ----------------------
    await User.insertMany([
      {
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
        fullName: 'Alice Johnson',
        role: 'user',
        rating: 1500,
        class: 'NONE' // ✅ placeholder
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: 'password123',
        fullName: 'Bob Smith',
        role: 'user',
        rating: 1300,
        class: 'NONE' // ✅ placeholder
      }
    ]);

    console.log('✅ Created test users');

    // ----------------------
    // 3️⃣ SEED PROBLEMS
    // ----------------------
    const problem1 = await Problem.create({
      title: 'Two Sum',
      slug: 'two-sum',
      description: `Given an array of integers nums and an integer target...`,
      difficulty: 'easy',
      timeLimit: 2000,
      memoryLimit: 256,
      inputFormat: 'First line: array of integers\nSecond line: target integer',
      outputFormat: 'Two indices separated by space',
      tags: ['array', 'hash-table'],
      createdBy: admin._id
    });

    await TestCase.insertMany([
      { problemId: problem1._id, input: '2 7 11 15\n9', expectedOutput: '0 1' },
      { problemId: problem1._id, input: '3 2 4\n6', expectedOutput: '1 2' }
    ]);

    console.log('✅ Created problem: Two Sum');

    const problem2 = await Problem.create({
      title: 'Reverse String',
      slug: 'reverse-string',
      description: `Write a function that reverses a string.`,
      difficulty: 'easy',
      timeLimit: 1000,
      memoryLimit: 128,
      tags: ['string', 'two-pointers'],
      createdBy: admin._id
    });

    await TestCase.insertMany([
      { problemId: problem2._id, input: 'hello', expectedOutput: 'olleh' }
    ]);

    console.log('✅ Created problem: Reverse String');

    // ----------------------
    // 4️⃣ SEED STUDENTS
    // ----------------------
    const sampleClasses = ['10A1', '10A2', '11A1', '11A2', '12A1'];
    const students = [];

    sampleClasses.forEach(className => {
      for (let i = 1; i <= 5; i++) {
        students.push({
          username: `student_${className.toLowerCase()}_${i}`,
          email: `student${i}.${className.toLowerCase()}@school.edu.vn`,
          password: '$2a$10$exampleHashedPassword123', // hashed password: 123456
          fullName: `Học Sinh ${i} ${className}`,
          role: 'user',
          class: className, // ✅ học sinh có class đúng
          solvedProblems: Math.floor(Math.random() * 15),
          rating: 1200 + Math.floor(Math.random() * 300)
        });
      }
    });

    // ----------------------
    // 5️⃣ SEED TEACHERS
    // ----------------------
    const teachers = [
      {
        username: 'teacher_nguyenvana',
        email: 'nguyenvana@school.edu.vn',
        password: '$2a$10$exampleHashedPassword123',
        fullName: 'Nguyễn Văn A',
        role: 'teacher',
        teacherClasses: ['10A1', '10A2'],
        class: 'TEACHER' // ✅ fix class
      },
      {
        username: 'teacher_tranthib',
        email: 'tranthib@school.edu.vn',
        password: '$2a$10$exampleHashedPassword123',
        fullName: 'Trần Thị B',
        role: 'teacher',
        teacherClasses: ['11A1', '11A2'],
        class: 'TEACHER' // ✅ fix class
      }
    ];

    await User.insertMany([...students, ...teachers]);

    console.log(`👥 Created ${students.length} students`);
    console.log(`👨‍🏫 Created ${teachers.length} teachers`);

    // ----------------------
    // DONE
    // ----------------------
    console.log('\n🎉 Full seed completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
