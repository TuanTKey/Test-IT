require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Contest = require('./src/models/Contest');
  const Problem = require('./src/models/Problem');
  const Submission = require('./src/models/Submission');
  const User = require('./src/models/User');

  const contests = await Contest.countDocuments();
  const problems = await Problem.countDocuments();
  const submissions = await Submission.countDocuments();
  const users = await User.countDocuments();

  console.log('=== DATABASE STATUS ===');
  console.log('Contests:', contests);
  console.log('Problems:', problems);
  console.log('Submissions:', submissions);
  console.log('Users:', users);

  // List contests
  const allContests = await Contest.find({});
  console.log('\n=== CONTESTS ===');
  allContests.forEach(c => {
    console.log(`- ${c.title} (${c.problems.length} problems)`);
  });

  mongoose.disconnect();
});
