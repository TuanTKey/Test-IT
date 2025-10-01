const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const aiJudgeService = require('./aiJudgeService');

// Python path for Windows
const PYTHON_PATH = process.platform === 'win32' 
  ? 'C:\\Users\\Dell\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
  : 'python3';

// Language configurations
const LANGUAGE_CONFIG = {
  python: {
    extension: 'py',
    compileCmd: null,
    runCmd: (filename) => `"${PYTHON_PATH}" "${filename}"`
  },
  javascript: {
    extension: 'js',
    compileCmd: null,
    runCmd: (filename) => `node "${filename}"`
  },
  cpp: {
    extension: 'cpp',
    compileCmd: (filename) => {
      if (process.platform === 'win32') {
        return `g++ "${filename}" -o "${filename.replace('.cpp', '.exe')}"`;
      }
      return `g++ "${filename}" -o "${filename}.out"`;
    },
    runCmd: (filename) => {
      if (process.platform === 'win32') {
        return `"${filename.replace('.cpp', '.exe')}"`;
      }
      return `"${filename}.out"`;
    }
  },
  java: {
    extension: 'java',
    compileCmd: (filename) => `javac "${filename}"`,
    runCmd: (filename) => {
      const className = path.basename(filename, '.java');
      return `java -cp "${path.dirname(filename)}" ${className}`;
    }
  }
};

class JudgeService {
  async judgeSubmission(submissionId, problem, testCases, code, language) {
    try {
      console.log(`🔍 Judging submission ${submissionId}...`);
      console.log(`📝 Language: ${language}, Test cases: ${testCases.length}`);
      
      await Submission.findByIdAndUpdate(submissionId, { 
        status: 'judging' 
      });

      // Check if AI Judge is enabled
      const useAI = process.env.USE_AI_JUDGE === 'true';
      const aiInitialized = await aiJudgeService.isInitialized();

      if (useAI && aiInitialized) {
        console.log('🤖 Using Gemini AI Judge...');
        try {
          return await this.judgeWithAI(submissionId, problem, testCases, code, language);
        } catch (aiError) {
          console.error('❌ AI Judge failed, falling back to traditional:', aiError.message);
          return await this.judgeTraditional(submissionId, problem, testCases, code, language);
        }
      } else {
        console.log('🔧 Using Traditional Judge...');
        return await this.judgeTraditional(submissionId, problem, testCases, code, language);
      }

    } catch (error) {
      console.error('❌ Judge error:', error);
      await this.updateSubmissionError(submissionId, 'Internal judge error: ' + error.message);
    }
  }

  async judgeWithAI(submissionId, problem, testCases, code, language) {
    try {
      const result = await aiJudgeService.judgeCode(problem, code, language, testCases);

      console.log('🤖 AI Verdict:', result.status);
      console.log('📊 Test Cases Passed:', `${result.testCasesPassed}/${result.totalTestCases}`);

      await Submission.findByIdAndUpdate(submissionId, {
        status: result.status,
        testCasesPassed: result.testCasesPassed,
        totalTestCases: result.totalTestCases,
        executionTime: result.executionTime || 0,
        errorMessage: result.status !== 'accepted' ? result.feedback : null,
        aiAnalysis: result.aiAnalysis,
        memory: 0
      });

      if (result.status === 'accepted') {
        await Problem.findByIdAndUpdate(problem._id, {
          $inc: { acceptedCount: 1, submissionCount: 1 }
        });

        const submission = await Submission.findById(submissionId);
        await User.findByIdAndUpdate(submission.userId, {
          $inc: { solvedProblems: 1 }
        });
      } else {
        await Problem.findByIdAndUpdate(problem._id, {
          $inc: { submissionCount: 1 }
        });
      }

      return result;

    } catch (error) {
      throw error;
    }
  }

  async judgeTraditional(submissionId, problem, testCases, code, language) {
    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
      await this.updateSubmissionError(submissionId, 'Unsupported language: ' + language);
      return;
    }

    // Create temp directory
    const tempDir = path.join(__dirname, '../../temp', submissionId.toString());
    
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (mkdirError) {
      console.error('Failed to create temp directory:', mkdirError);
      await this.updateSubmissionError(submissionId, 'Failed to create temp directory');
      return;
    }

    const filename = path.join(tempDir, `solution.${langConfig.extension}`);
    
    try {
      await fs.writeFile(filename, code);
    } catch (writeError) {
      console.error('Failed to write code file:', writeError);
      await this.updateSubmissionError(submissionId, 'Failed to write code file');
      await this.cleanup(tempDir);
      return;
    }

    // Compile if needed
    if (langConfig.compileCmd) {
      console.log('⚙️ Compiling...');
      const compileResult = await this.executeCommand(
        langConfig.compileCmd(filename),
        tempDir,
        10000 // 10 seconds compile timeout
      );

      if (compileResult.error) {
        console.log('❌ Compilation failed:', compileResult.stderr);
        await this.updateSubmissionError(
          submissionId, 
          compileResult.stderr || 'Compilation error',
          'compile_error',
          0,
          testCases.length,
          0
        );
        await this.cleanup(tempDir);
        return;
      }
      console.log('✅ Compilation successful');
    }

    // Run test cases
    let passedTests = 0;
    let totalTime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`🧪 Running test case ${i + 1}/${testCases.length}...`);
      
      const result = await this.runTestCase(
        langConfig.runCmd(filename),
        tempDir,
        testCase.input,
        testCase.expectedOutput,
        problem.timeLimit || 2000,
        problem.memoryLimit || 256
      );

      console.log(`   Result: ${result.status}, Time: ${result.time}ms`);

      if (result.status === 'passed') {
        passedTests++;
        totalTime += result.time;
      } else {
        let errorMessage = '';
        if (result.status === 'time_limit') {
          errorMessage = `Time Limit Exceeded on test case ${i + 1}`;
        } else if (result.status === 'runtime_error') {
          errorMessage = `Runtime Error on test case ${i + 1}: ${result.error || 'Unknown error'}`;
        } else {
          errorMessage = `Wrong Answer on test case ${i + 1}`;
        }

        await this.updateSubmissionError(
          submissionId,
          errorMessage,
          result.status,
          passedTests,
          testCases.length,
          totalTime + result.time
        );
        await this.cleanup(tempDir);
        return;
      }
    }

    // All tests passed!
    console.log(`✅ All ${passedTests} test cases passed!`);
    
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'accepted',
      testCasesPassed: passedTests,
      totalTestCases: testCases.length,
      executionTime: totalTime,
      memory: 0,
      errorMessage: null
    });

    await Problem.findByIdAndUpdate(problem._id, {
      $inc: { acceptedCount: 1, submissionCount: 1 }
    });

    const submission = await Submission.findById(submissionId);
    await User.findByIdAndUpdate(submission.userId, {
      $inc: { solvedProblems: 1 }
    });

    await this.cleanup(tempDir);
    
    return {
      status: 'accepted',
      testCasesPassed: passedTests,
      totalTestCases: testCases.length,
      executionTime: totalTime
    };
  }

  async runTestCase(runCmd, cwd, input, expectedOutput, timeLimit, memoryLimit) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      console.log(`   Command: ${runCmd}`);
      console.log(`   Input: "${input ? input.substring(0, 50) : '(empty)'}..."`);
      
      const child = exec(runCmd, {
        cwd,
        timeout: timeLimit,
        maxBuffer: memoryLimit * 1024 * 1024,
        windowsHide: true
      }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;

        if (error) {
          if (error.killed || error.signal === 'SIGTERM') {
            console.log(`   ⏰ Time limit exceeded after ${executionTime}ms`);
            return resolve({ status: 'time_limit', time: executionTime });
          }
          console.log(`   💥 Runtime error: ${stderr || error.message}`);
          return resolve({ 
            status: 'runtime_error', 
            error: stderr || error.message,
            time: executionTime
          });
        }

        // Normalize output: trim and standardize line endings
        const actualOutput = stdout.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const expected = expectedOutput.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        console.log(`   Expected: "${expected.substring(0, 50)}${expected.length > 50 ? '...' : ''}"`);
        console.log(`   Actual: "${actualOutput.substring(0, 50)}${actualOutput.length > 50 ? '...' : ''}"`);

        if (actualOutput === expected) {
          console.log(`   ✅ Matched!`);
          return resolve({ 
            status: 'passed', 
            time: executionTime,
            memory: 0
          });
        } else {
          console.log(`   ❌ Mismatch`);
          return resolve({ 
            status: 'wrong_answer',
            time: executionTime,
            expected: expected,
            actual: actualOutput
          });
        }
      });

      // Write input to stdin
      if (input !== null && input !== undefined) {
        try {
          child.stdin.write(input);
          child.stdin.end();
        } catch (stdinError) {
          console.error('   Error writing to stdin:', stdinError);
        }
      } else {
        child.stdin.end();
      }
    });
  }

  async executeCommand(cmd, cwd, timeout) {
    return new Promise((resolve) => {
      exec(cmd, { cwd, timeout, windowsHide: true }, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });
  }

  async updateSubmissionError(submissionId, errorMessage, status = 'runtime_error', passed = 0, total = 0, executionTime = 0) {
    console.log(`📝 Updating submission ${submissionId} with error: ${status}`);
    
    await Submission.findByIdAndUpdate(submissionId, {
      status,
      errorMessage,
      testCasesPassed: passed,
      totalTestCases: total,
      executionTime: executionTime || 0
    });

    try {
      const submission = await Submission.findById(submissionId);
      if (submission && submission.problemId) {
        await Problem.findByIdAndUpdate(submission.problemId, {
          $inc: { submissionCount: 1 }
        });
      }
    } catch (updateError) {
      console.error('Error updating problem stats:', updateError);
    }
  }

  async cleanup(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned up: ${tempDir}`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new JudgeService();