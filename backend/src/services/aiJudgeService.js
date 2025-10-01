const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIJudgeService {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try gemini-1.5-flash first, fallback to gemini-pro
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        });
        console.log('✅ Gemini AI Judge initialized (gemini-2.0-flash)');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Gemini AI:', error.message);
        this.model = null;
      }
    } else {
      console.warn('⚠️ GEMINI_API_KEY not found - AI Judge disabled');
      this.model = null;
    }
  }

  async judgeCode(problem, code, language, testCases) {
    try {
      if (!this.model) {
        throw new Error('Gemini API not initialized');
      }

      console.log('🤖 Gemini AI: Analyzing code...');

      const prompt = this.buildPrompt(problem, code, language, testCases);

      // Call Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 Gemini Response:', text);

      // Parse JSON từ response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Invalid JSON response from Gemini');
        throw new Error('Invalid AI response format');
      }

      const aiResult = JSON.parse(jsonMatch[0]);

      // Validate verdict
      const validVerdicts = ['accepted', 'wrong_answer', 'runtime_error', 'compile_error', 'time_limit'];
      if (!validVerdicts.includes(aiResult.verdict)) {
        aiResult.verdict = 'runtime_error';
      }

      // Ensure testCasesPassed is valid
      aiResult.testCasesPassed = Math.min(
        Math.max(0, aiResult.testCasesPassed || 0),
        testCases.length
      );

      return {
        status: aiResult.verdict,
        testCasesPassed: aiResult.testCasesPassed,
        totalTestCases: testCases.length,
        feedback: aiResult.feedback || 'Code analysis completed',
        executionTime: aiResult.estimatedTime || 50,
        aiAnalysis: aiResult.analysis || '',
        suggestions: aiResult.suggestions || []
      };

    } catch (error) {
      console.error('❌ Gemini AI Judge error:', error);
      throw error;
    }
  }

  buildPrompt(problem, code, language, testCases) {
    const testCaseExamples = testCases.slice(0, 3).map((tc, i) => 
      `Test Case ${i + 1}:\nInput: ${tc.input}\nExpected Output: ${tc.expectedOutput}`
    ).join('\n\n');

    return `You are an expert code judge for a programming contest platform.

**Problem:**
Title: ${problem.title}
Difficulty: ${problem.difficulty}

Description:
${problem.description}

${problem.inputFormat ? `Input Format:\n${problem.inputFormat}\n` : ''}
${problem.outputFormat ? `Output Format:\n${problem.outputFormat}\n` : ''}
${problem.constraints ? `Constraints:\n${problem.constraints}\n` : ''}

**Student's Solution:**
Language: ${language}
\`\`\`${language}
${code}
\`\`\`

**Test Cases:**
${testCaseExamples}

**Your Task:**
Analyze this code carefully and determine:
1. Does it correctly solve the problem?
2. Will it produce the correct output for all test cases?
3. Are there any logical errors, syntax errors, or runtime issues?
4. Code quality and efficiency

**CRITICAL RULES FOR JUDGING:**
- This is a competitive programming platform where code reads from STDIN and writes to STDOUT
- The code MUST use input() in Python, cin in C++, Scanner in Java, readline in JavaScript to read input
- The code MUST use print() in Python, cout in C++, System.out in Java, console.log in JavaScript to output
- This is NOT a function-based system. Code should read input and print output directly.
- Mentally execute the code with each test case input and check if output matches expected output

**IMPORTANT:** Return ONLY a JSON object with NO additional text before or after.

JSON Structure:
{
  "verdict": "accepted" | "wrong_answer" | "runtime_error" | "compile_error" | "time_limit",
  "testCasesPassed": <number between 0 and ${testCases.length}>,
  "feedback": "<clear, constructive feedback for the student in 1-2 sentences>",
  "analysis": "<brief technical analysis of the code>",
  "estimatedTime": <estimated execution time in milliseconds>,
  "suggestions": ["<improvement suggestion 1>", "<suggestion 2>"]
}

**Rules:**
- verdict = "accepted" if code logic is correct and will pass all test cases when given the input via stdin
- verdict = "wrong_answer" if output doesn't match expected for any test case
- verdict = "runtime_error" if code has runtime issues (e.g., index out of bounds, division by zero)
- verdict = "compile_error" if code has syntax errors
- verdict = "time_limit" if algorithm is inefficient and would timeout
- testCasesPassed must be realistic based on the code
- feedback must be helpful and educational
- Keep feedback concise and actionable

Return ONLY the JSON:`;
  }

  async explainError(code, language, errorMessage) {
    try {
      if (!this.model) return null;

      const prompt = `Explain this ${language} error in simple terms:

Code:
\`\`\`${language}
${code}
\`\`\`

Error Message: ${errorMessage}

Return ONLY this JSON:
{
  "explanation": "<simple explanation of what went wrong>",
  "suggestion": "<specific suggestion to fix it>",
  "example": "<corrected code snippet if applicable>"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    } catch (error) {
      console.error('Error explaining:', error);
      return null;
    }
  }

  async getHints(problem, code, language) {
    try {
      if (!this.model) return null;

      const prompt = `The student is stuck on this problem:

**Problem:** ${problem.title}
${problem.description}

**Student's attempt:**
\`\`\`${language}
${code}
\`\`\`

Provide 3 helpful hints without giving away the complete solution.

Return ONLY this JSON:
{
  "hints": [
    "<hint 1 - most general>",
    "<hint 2 - more specific>",
    "<hint 3 - most specific but not complete solution>"
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    } catch (error) {
      console.error('Error getting hints:', error);
      return null;
    }
  }

  async isInitialized() {
    return !!this.model;
  }
}

module.exports = new AIJudgeService();