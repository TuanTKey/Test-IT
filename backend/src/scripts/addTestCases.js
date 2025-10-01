const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

dotenv.config();

const testCasesData = {
  'palindrome-number-1': [
    { input: '121', expectedOutput: 'true', isHidden: false },
    { input: '-121', expectedOutput: 'false', isHidden: false },
    { input: '10', expectedOutput: 'false', isHidden: true },
    { input: '12321', expectedOutput: 'true', isHidden: true },
    { input: '0', expectedOutput: 'true', isHidden: true },
  ],
  
  'reverse-linked-list-3': [
    { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
    { input: '1 2', expectedOutput: '2 1', isHidden: false },
    { input: '1', expectedOutput: '1', isHidden: true },
    { input: '1 2 3', expectedOutput: '3 2 1', isHidden: true },
  ],
  
  'valid-parentheses-4': [
    { input: '()', expectedOutput: 'true', isHidden: false },
    { input: '()[]{}', expectedOutput: 'true', isHidden: false },
    { input: '(]', expectedOutput: 'false', isHidden: false },
    { input: '([)]', expectedOutput: 'false', isHidden: true },
    { input: '{[]}', expectedOutput: 'true', isHidden: true },
    { input: '()', expectedOutput: 'true', isHidden: true },
  ],
  
  'merge-intervals-5': [
    { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
    { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: false },
    { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]', isHidden: true },
    { input: '[[1,4],[2,3]]', expectedOutput: '[[1,4]]', isHidden: true },
  ],
  
  'maximum-subarray-6': [
    { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
    { input: '1', expectedOutput: '1', isHidden: false },
    { input: '5 4 -1 7 8', expectedOutput: '23', isHidden: true },
    { input: '-1', expectedOutput: '-1', isHidden: true },
    { input: '-2 -1', expectedOutput: '-1', isHidden: true },
  ],
  
  'word-ladder-7': [
    { input: 'hit\ncog\nhot dot dog lot log cog', expectedOutput: '5', isHidden: false },
    { input: 'hit\ncog\nhot dot dog lot log', expectedOutput: '0', isHidden: false },
    { input: 'a\nc\na b c', expectedOutput: '2', isHidden: true },
  ],
  
  'longest-palindrome-8': [
    { input: 'babad', expectedOutput: 'bab', isHidden: false },
    { input: 'cbbd', expectedOutput: 'bb', isHidden: false },
    { input: 'a', expectedOutput: 'a', isHidden: true },
    { input: 'ac', expectedOutput: 'a', isHidden: true },
    { input: 'racecar', expectedOutput: 'racecar', isHidden: true },
  ],
  
  'trapping-rain-water-9': [
    { input: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', isHidden: false },
    { input: '4 2 0 3 2 5', expectedOutput: '9', isHidden: false },
    { input: '4 2 3', expectedOutput: '1', isHidden: true },
    { input: '1 0 1', expectedOutput: '1', isHidden: true },
  ],
  
  'course-schedule-10': [
    { input: '2 1\n1 0', expectedOutput: 'true', isHidden: false },
    { input: '2 2\n1 0\n0 1', expectedOutput: 'false', isHidden: false },
    { input: '3 2\n1 0\n2 1', expectedOutput: 'true', isHidden: true },
    { input: '4 3\n1 0\n2 1\n3 2', expectedOutput: 'true', isHidden: true },
    { input: '3 3\n0 1\n1 2\n2 0', expectedOutput: 'false', isHidden: true },
  ],
  
  // Thêm test cases cho Two Sum và Reverse String nếu chưa đủ
  'two-sum': [
    { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
    { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false },
    { input: '3 3\n6', expectedOutput: '0 1', isHidden: true },
  ],
  
  'reverse-string': [
    { input: 'hello', expectedOutput: 'olleh', isHidden: false },
    { input: 'CodeJudge', expectedOutput: 'egduJedoC', isHidden: false },
    { input: 'a', expectedOutput: 'a', isHidden: true },
    { input: 'ab', expectedOutput: 'ba', isHidden: true },
  ],
};

const addTestCases = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    for (const [slug, testCases] of Object.entries(testCasesData)) {
      const problem = await Problem.findOne({ slug });
      
      if (!problem) {
        console.log(`⚠️  Problem not found: ${slug}`);
        continue;
      }

      // Xóa test cases cũ
      await TestCase.deleteMany({ problemId: problem._id });

      // Thêm test cases mới
      const testCaseDocs = testCases.map(tc => ({
        problemId: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      }));

      await TestCase.insertMany(testCaseDocs);
      console.log(`✅ Added ${testCases.length} test cases for: ${problem.title}`);
    }

    console.log('\n🎉 All test cases added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addTestCases();
