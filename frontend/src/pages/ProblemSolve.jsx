import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import { Play, Clock, Database, AlertCircle, CheckCircle, Terminal as TerminalIcon, X, Send, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const ProblemSolve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [sampleTestCases, setSampleTestCases] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  
  // Terminal state
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [outputData, setOutputData] = useState(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const terminalRef = useRef(null);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // Template trống cho mỗi ngôn ngữ - chỉ có comment hướng dẫn
  const languageTemplates = {
    python: `# Write your solution here
`,
    javascript: `// Write your solution here
`,
    cpp: `// Write your solution here
`,
    java: `// Write your solution here
`
  };

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  // Khi đổi ngôn ngữ, reset code về template trống
  useEffect(() => {
    setCode(languageTemplates[language]);
  }, [language]);

  // Auto scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputData]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const container = terminalRef.current?.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const newHeight = containerRect.bottom - e.clientY;
          setTerminalHeight(Math.max(150, Math.min(500, newHeight)));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const fetchProblem = async () => {
    try {
      const response = await api.get(`/problems/slug/${slug}`);
      setProblem(response.data.problem);
      setSampleTestCases(response.data.sampleTestCases);
      // Chỉ set code template trống, không lưu code cũ
      setCode(languageTemplates[language]);
    } catch (error) {
      console.error('Error fetching problem:', error);
      alert('Failed to load problem');
      navigate('/problems');
    }
  };

  // RUN CODE - giống VS Code terminal
  const handleRun = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setShowTerminal(true);
    setWaitingForInput(true);
    setTerminalInput('');
    setTerminalHistory([
      { type: 'system', text: `$ Running ${language}...` },
      { type: 'system', text: 'Enter input (press Enter when done, leave empty if no input needed):' }
    ]);
    setOutputData(null);
    setResult(null);
    
    // Focus vào input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Thực thi code với input đã nhập
  const executeCode = async (input) => {
    setWaitingForInput(false);
    setRunning(true);
    
    // Thêm input vào history
    setTerminalHistory(prev => [
      ...prev,
      { type: 'input', text: input || '(no input)' },
      { type: 'system', text: 'Executing...' }
    ]);

    try {
      const response = await api.post('/submissions/run', {
        code: code,
        language: language,
        input: input
      });

      if (response.data.error) {
        // Parse và format lỗi đẹp hơn
        const errorText = response.data.error;
        let formattedErrors = [];
        
        // Kiểm tra loại lỗi
        if (errorText.includes('error:') || errorText.includes('Error:')) {
          // Lỗi compile - chỉ lấy phần quan trọng
          const lines = errorText.split('\n');
          formattedErrors = lines
            .filter(line => line.includes('error:') || line.includes('Error:') || line.includes('note:'))
            .map(line => {
              // Loại bỏ đường dẫn dài, chỉ giữ tên file và thông báo lỗi
              const match = line.match(/solution\.(cpp|py|js|java):(\d+):(\d+):\s*(error|note):\s*(.+)/);
              if (match) {
                const [, ext, lineNum, col, type, msg] = match;
                return `Line ${lineNum}: ${msg}`;
              }
              // Fallback - lấy phần sau "error:" hoặc "Error:"
              const errorMatch = line.match(/(error|Error):\s*(.+)/);
              if (errorMatch) {
                return errorMatch[2];
              }
              return line;
            })
            .filter(line => line.trim());
        } else {
          // Runtime error hoặc lỗi khác
          formattedErrors = errorText.split('\n').filter(line => line.trim());
        }

        setTerminalHistory(prev => [
          ...prev.slice(0, -1), // Remove "Executing..."
          { type: 'error', text: '❌ Compilation/Runtime Error:' },
          ...formattedErrors.map(line => ({ type: 'error', text: '   ' + line }))
        ]);
      } else {
        setTerminalHistory(prev => [
          ...prev.slice(0, -1), // Remove "Executing..."
          { type: 'output', text: response.data.output || '(no output)' },
          { type: 'success', text: `✓ Done in ${response.data.executionTime || 0}ms` }
        ]);
      }

    } catch (error) {
      console.error('Run error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to run code';
      setTerminalHistory(prev => [
        ...prev.slice(0, -1),
        { type: 'error', text: '❌ Error: ' + errorMsg }
      ]);
    } finally {
      setRunning(false);
    }
  };

  // Xử lý khi nhấn Enter trong terminal
  const handleTerminalKeyDown = (e) => {
    if (e.key === 'Enter' && waitingForInput && !running) {
      e.preventDefault();
      executeCode(terminalInput);
    }
  };

  // SUBMIT CODE
  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setShowTerminal(true);
    setSubmitting(true);
    setOutputData({
      type: 'judging',
      message: 'Judging...'
    });
    setResult(null);

    try {
      const response = await api.post('/submissions', {
        problemId: problem._id,
        code: code,
        language: language
      });

      const submissionId = response.data.submissionId;
      let pollCount = 0;

      const pollInterval = setInterval(async () => {
        try {
          pollCount++;
          const statusResponse = await api.get(`/submissions/${submissionId}`);
          const submission = statusResponse.data.submission;

          if (submission.status !== 'pending' && submission.status !== 'judging') {
            setResult(submission);
            setSubmitting(false);
            
            setOutputData({
              type: submission.status === 'accepted' ? 'accepted' : 'wrong',
              status: submission.status,
              testCasesPassed: submission.testCasesPassed,
              totalTestCases: submission.totalTestCases,
              executionTime: submission.executionTime,
              memoryUsed: submission.memoryUsed,
              errorMessage: submission.errorMessage
            });
            
            clearInterval(pollInterval);
          }

          if (pollCount >= 30) {
            clearInterval(pollInterval);
            setSubmitting(false);
            setOutputData({
              type: 'error',
              title: 'Timeout',
              message: 'Judging timed out. Please try again.'
            });
          }
        } catch (error) {
          clearInterval(pollInterval);
          setSubmitting(false);
          setOutputData({
            type: 'error',
            title: 'Error',
            message: 'Error checking submission status'
          });
        }
      }, 1000);

    } catch (error) {
      setSubmitting(false);
      setOutputData({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.error || 'Failed to submit'
      });
    }
  };

  const clearTerminal = () => {
    setTerminalHistory([]);
    setOutputData(null);
    setResult(null);
    setWaitingForInput(false);
    setTerminalInput('');
  };

  const getStatusText = (status) => {
    const statusMap = {
      accepted: 'Accepted',
      wrong_answer: 'Wrong Answer',
      time_limit: 'Time Limit Exceeded',
      runtime_error: 'Runtime Error',
      compile_error: 'Compilation Error',
      error: 'Error',
      pending: 'Pending',
      judging: 'Judging'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-400';
      case 'wrong_answer': return 'text-red-400';
      case 'time_limit': return 'text-yellow-400';
      case 'runtime_error': return 'text-orange-400';
      case 'compile_error': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  // Render Output Panel content
  if (!problem) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1e1e1e]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="bg-[#252526] border-b border-[#3c3c3c] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">{problem.title}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              problem.difficulty === 'easy' ? 'bg-green-900/50 text-green-400 border border-green-700' :
              problem.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' :
              'bg-red-900/50 text-red-400 border border-red-700'
            }`}>
              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-gray-400 text-sm">
            <span className="flex items-center">
              <Clock size={14} className="mr-1" />
              {problem.timeLimit}ms
            </span>
            <span className="flex items-center">
              <Database size={14} className="mr-1" />
              {problem.memoryLimit}MB
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Description */}
        <div className="w-1/2 overflow-y-auto border-r border-[#3c3c3c]">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-white font-semibold mb-3">Description</h2>
              <div className="text-gray-100 text-sm whitespace-pre-wrap leading-relaxed">
                {problem.description}
              </div>
            </div>

            {problem.inputFormat && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Input Format</h3>
                <p className="text-gray-100 text-sm whitespace-pre-wrap">{problem.inputFormat}</p>
              </div>
            )}

            {problem.outputFormat && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Output Format</h3>
                <p className="text-gray-100 text-sm whitespace-pre-wrap">{problem.outputFormat}</p>
              </div>
            )}

            {sampleTestCases.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Examples</h3>
                {sampleTestCases.map((testCase, idx) => (
                  <div key={idx} className="mb-4 bg-[#1a1a1a] rounded-lg border border-[#444] overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-[#444]">
                      <div className="p-3">
                        <p className="text-gray-400 text-xs mb-2">Input</p>
                        <pre className="text-green-400 text-sm font-mono">{testCase.input}</pre>
                      </div>
                      <div className="p-3">
                        <p className="text-gray-400 text-xs mb-2">Output</p>
                        <pre className="text-cyan-400 text-sm font-mono">{testCase.expectedOutput}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between bg-[#252526] px-3 py-2 border-b border-[#3c3c3c]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#3c3c3c] text-white text-sm px-3 py-1.5 rounded border-none outline-none cursor-pointer hover:bg-[#4c4c4c]"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                className="flex items-center space-x-1.5 text-sm px-5 py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
              >
                {running ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Running</span>
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    <span>Run</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || running}
                style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                className="flex items-center space-x-1.5 text-sm px-5 py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Judging</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1" style={{ 
            height: showTerminal ? `calc(100% - ${terminalHeight}px)` : '100%'
          }}>
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: "'Consolas', 'Courier New', monospace",
                tabSize: 4,
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                padding: { top: 10 }
              }}
            />
          </div>

          {/* Terminal Panel - VS Code Style */}
          {showTerminal && (
            <div 
              ref={terminalRef}
              style={{ height: `${terminalHeight}px` }}
              className="flex flex-col border-t border-[#3c3c3c]"
            >
              {/* Resize Handle */}
              <div
                onMouseDown={() => setIsResizing(true)}
                className="h-1 bg-[#252526] hover:bg-[#0e639c] cursor-ns-resize transition-colors flex-shrink-0"
              />
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between bg-[#252526] border-b border-[#3c3c3c] flex-shrink-0">
                <div className="flex items-center px-4 py-2">
                  <TerminalIcon size={14} className="text-green-400 mr-2" />
                  <span className="text-white text-sm font-medium">Terminal</span>
                  <span className="text-gray-500 text-xs ml-2">({language})</span>
                </div>
                
                <div className="flex items-center space-x-1 pr-2">
                  <button
                    onClick={clearTerminal}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-[#3c3c3c] rounded transition-colors"
                    title="Clear terminal"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setTerminalHeight(h => Math.min(500, h + 50))}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-[#3c3c3c] rounded transition-colors"
                    title="Expand"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => setTerminalHeight(h => Math.max(150, h - 50))}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-[#3c3c3c] rounded transition-colors"
                    title="Shrink"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-[#3c3c3c] rounded transition-colors"
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Terminal Content - Interactive */}
              <div 
                className="flex-1 bg-black overflow-auto p-3 font-mono text-sm"
                onClick={() => inputRef.current?.focus()}
                ref={outputRef}
              >
                {/* Terminal History */}
                {terminalHistory.map((item, index) => (
                  <div key={index} className={`${
                    item.type === 'system' ? 'text-gray-400' :
                    item.type === 'input' ? 'text-green-400' :
                    item.type === 'output' ? 'text-white' :
                    item.type === 'error' ? 'text-red-400' :
                    item.type === 'success' ? 'text-green-400' :
                    'text-white'
                  } ${item.type === 'error' ? 'bg-red-900/20 px-2 py-0.5 rounded' : ''}`}>
                    {item.type === 'input' && <span className="text-yellow-400">{'>'} </span>}
                    <span className="whitespace-pre-wrap font-mono">{item.text}</span>
                  </div>
                ))}

                {/* Input Line */}
                {waitingForInput && (
                  <div className="flex items-start mt-1">
                    <span className="text-green-500 mr-1 select-none">$</span>
                    <textarea
                      ref={inputRef}
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !running) {
                          e.preventDefault();
                          executeCode(terminalInput);
                        }
                      }}
                      className="flex-1 bg-black outline-none resize-none text-white font-mono text-sm leading-5 placeholder-gray-600 focus:outline-none focus:ring-0 focus:border-transparent"
                      placeholder="Enter input here, press Enter to run..."
                      rows={3}
                      autoFocus
                      style={{ 
                        caretColor: '#22c55e', 
                        border: 'none', 
                        boxShadow: 'none',
                        outline: 'none',
                        WebkitAppearance: 'none'
                      }}
                    />
                  </div>
                )}

                {/* Running Indicator */}
                {running && (
                  <div className="flex items-center text-yellow-400 mt-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-400 border-t-transparent mr-2"></div>
                    <span>Running...</span>
                  </div>
                )}

                {/* Run Again Button - shows after execution is done */}
                {!running && !waitingForInput && terminalHistory.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-800">
                    <button
                      onClick={handleRun}
                      className="flex items-center space-x-1.5 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Run Again</span>
                    </button>
                  </div>
                )}

                {/* Submit Result */}
                {outputData && outputData.type === 'accepted' && (
                  <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded">
                    <div className="flex items-center text-green-400 font-bold mb-2">
                      <CheckCircle size={16} className="mr-2" />
                      Accepted
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">Tests</div>
                        <div className="text-green-400 font-bold">{outputData.testCasesPassed}/{outputData.totalTestCases}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Runtime</div>
                        <div className="text-white font-bold">{outputData.executionTime || 0}ms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Memory</div>
                        <div className="text-white font-bold">{outputData.memoryUsed || 0}MB</div>
                      </div>
                    </div>
                  </div>
                )}

                {outputData && outputData.type === 'wrong' && (
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded">
                    <div className={`flex items-center font-bold mb-2 ${getStatusColor(outputData.status)}`}>
                      <AlertCircle size={16} className="mr-2" />
                      {getStatusText(outputData.status)}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">Tests</div>
                        <div className="text-red-400 font-bold">{outputData.testCasesPassed}/{outputData.totalTestCases}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Runtime</div>
                        <div className="text-white font-bold">{outputData.executionTime || 0}ms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Memory</div>
                        <div className="text-white font-bold">{outputData.memoryUsed || 0}MB</div>
                      </div>
                    </div>
                    {outputData.errorMessage && (
                      <div className="mt-2 text-red-400 text-xs">
                        {outputData.errorMessage}
                      </div>
                    )}
                  </div>
                )}

                {outputData && outputData.type === 'judging' && (
                  <div className="flex items-center text-yellow-400 mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent mr-2"></div>
                    <span>Judging your solution...</span>
                  </div>
                )}

                {/* Empty State */}
                {terminalHistory.length === 0 && !outputData && !waitingForInput && !running && (
                  <div className="text-gray-600 text-center py-8">
                    <TerminalIcon size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Click <span className="text-blue-400">Run</span> to execute your code</p>
                    <p className="text-xs mt-1">Click <span className="text-green-400">Submit</span> to grade your solution</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemSolve;