"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { runSampleTests, runAllTests, submitSolution, SubmissionResponse } from "../../actions/submission";
import Link from "next/link";

// ── State machine types ──
type WorkflowState =
  | 'idle'
  | 'sample_testing'
  | 'sample_failed'
  | 'sample_passed'
  | 'full_testing'
  | 'full_failed'
  | 'all_passed'
  | 'submitting'
  | 'submitted';

// ── Test case parser ──
function parseTestCases(description: string) {
  const match = description.match(/\*\*Sample Input/);
  if (!match) return { mainDesc: description, testCases: [] };

  const parts = description.split(/\*\*Sample Input[^\*]*\*\*/);
  const mainDesc = parts[0].trim();
  const testCases = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const outputSplit = part.split(/\*\*Sample Output[^\*]*\*\*/);
    const inputStr = outputSplit[0].trim();
    
    let outputStr = "";
    let explanationStr = "";
    
    if (outputSplit.length > 1) {
      const expSplit = outputSplit[1].split(/\*\*Explanation:\*\*/);
      outputStr = expSplit[0].trim();
      if (expSplit.length > 1) {
        explanationStr = expSplit[1].trim();
      }
    }
    
    testCases.push({
      input: inputStr,
      output: outputStr,
      explanation: explanationStr
    });
  }

  return { mainDesc, testCases };
}

// ── Copy button ──
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} type="button" className="hover:text-cyan-400 transition-colors cursor-pointer group flex items-center gap-1">
      {copied ? (
        <span className="text-cyan-400 font-bold">COPIED!</span>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          COPY
        </>
      )}
    </button>
  );
}

// ── Monaco Intellisense ──
let isIntellisenseRegistered = false;

function setupMonacoIntellisense(monaco: any) {
  if (isIntellisenseRegistered) return;
  isIntellisenseRegistered = true;

  // 1. JavaScript Setup
  if (monaco.languages.typescript && monaco.languages.typescript.javascriptDefaults) {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
    });
  }

  // Helper builder
  const createDependencyProposals = (range: any, monaco: any, language: string) => {
    if (language === 'cpp') {
      return [
        {
          label: 'cpp_template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\tios_base::sync_with_stdio(false);\n\tcin.tie(NULL);\n\t$0\n\treturn 0;\n}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Standard Competitive Programming Template',
          range
        },
        {
          label: 'for_loop',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `for (int i = 0; i < $1; i++) {\n\t$0\n}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Standard for-loop',
          range
        },
        { label: 'vector', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'vector<$1> $0', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
        { label: 'cin', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'cin >> $1;', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
        { label: 'cout', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'cout << $1 << "\\n";', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
      ];
    } else if (language === 'python') {
      return [
        {
          label: 'py_template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `import sys\n\ninput = sys.stdin.readline\n\ndef solve():\n\t$0\n\nif __name__ == '__main__':\n\tsolve()`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Fast I/O template for Python',
          range
        },
        {
          label: 'for_loop',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `for i in range($1):\n\t$0`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Standard for loop',
          range
        }
      ];
    } else if (language === 'java') {
      return [
        {
          label: 'java_template',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n\tpublic static void main(String[] args) throws IOException {\n\t\tBufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\t\t$0\n\t}\n}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Fast I/O template for Java',
          range
        },
        {
          label: 'sout',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `System.out.println($1);$0`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print to console',
          range
        }
      ];
    }
    return [];
  };

  // 2. C++
  monaco.languages.registerCompletionItemProvider('cpp', {
    provideCompletionItems: function(model: any, position: any) {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      return { suggestions: createDependencyProposals(range, monaco, 'cpp') };
    }
  });

  // 3. Python
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: function(model: any, position: any) {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      return { suggestions: createDependencyProposals(range, monaco, 'python') };
    }
  });

  // 4. Java
  monaco.languages.registerCompletionItemProvider('java', {
    provideCompletionItems: function(model: any, position: any) {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      return { suggestions: createDependencyProposals(range, monaco, 'java') };
    }
  });
}

// ── Main Workspace Component ──
export default function Workspace({ problem, hasUserSolved }: { problem: any; hasUserSolved?: boolean }) {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("// Write your elite code here...\n");
  const [isPending, startTransition] = useTransition();
  const [executionResult, setExecutionResult] = useState<SubmissionResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [workflowState, setWorkflowState] = useState<WorkflowState>('idle');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);

  const { mainDesc, testCases } = parseTestCases(problem.description);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleResetCode = () => {
    if (!window.confirm("Are you sure you want to reset the editor to the default template? This will erase your current code.")) {
      return;
    }

    switch (language) {
      case "cpp":
        setCode("#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n \n    return 0;\n}");
        break;
      case "python":
        setCode("import sys\n\n# Configure fast I/O for line-by-line reading\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()");
        break;
      case "java":
        setCode("import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        \n    }\n}");
        break;
      case "javascript":
        setCode("const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\n    \n}\n\nsolve();");
        break;
      default:
        setCode("// Write your elite code here...\n");
    }
  };

  // Handle code changes — reset workflow if user edits code after passing any stage
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
    // Any change resets to idle unless it's already idle or currently testing
    if (workflowState !== 'idle' && workflowState !== 'sample_testing' && workflowState !== 'full_testing' && workflowState !== 'submitting') {
      setWorkflowState('idle');
      setSubmissionId(null);
      setExecutionResult(null); // Clear previous results to avoid confusion
    }
  };

  // Stage 1: Run sample tests
  const executeSampleTests = useCallback(() => {
    setWorkflowState('sample_testing');
    setIsTerminalVisible(true);
    startTransition(async () => {
      const response = await runSampleTests(problem.id, code, language);
      setExecutionResult(response);
      setActiveTab(0);

      if (response.overallStatus === 'accepted') {
        setWorkflowState('sample_passed');
      } else {
        setWorkflowState('sample_failed');
      }
    });
  }, [problem.id, code, language, startTransition]);

  // Stage 2: Run all tests (sample + hidden)
  const executeAllTests = useCallback(() => {
    setWorkflowState('full_testing');
    setIsTerminalVisible(true);
    startTransition(async () => {
      const response = await runAllTests(problem.id, code, language);
      setExecutionResult(response);
      setActiveTab(0);

      if (response.overallStatus === 'accepted') {
        setWorkflowState('all_passed');
      } else {
        setWorkflowState('full_failed');
      }
    });
  }, [problem.id, code, language, startTransition]);

  // Stage 3: Submit solution
  const handleSubmitSolution = useCallback(() => {
    setWorkflowState('submitting');
    setIsTerminalVisible(true);
    startTransition(async () => {
      const result = await submitSolution(problem.id, code, language);
      if (result.success) {
        setWorkflowState('submitted');
        setSubmissionId(result.submissionId || null);
      } else {
        setWorkflowState('all_passed'); // Stay in all_passed if submission fails
        alert("Submission failed: " + result.error);
      }
    });
  }, [problem.id, code, language, startTransition]);

  // Ctrl+Enter keybinding
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (isPending) return;

      switch (workflowState) {
        case 'idle':
        case 'sample_failed':
        case 'full_failed':
          executeSampleTests();
          break;
        case 'sample_passed':
          executeAllTests();
          break;
        case 'all_passed':
          handleSubmitSolution();
          break;
        default:
          break;
      }
    }
  }, [workflowState, isPending, executeSampleTests, executeAllTests, handleSubmitSolution]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Determine what the bottom button does
  const getBottomAction = () => {
    switch (workflowState) {
      case 'idle':
      case 'sample_failed':
      case 'full_failed':
        return { label: 'Execute Routine', hint: 'Ctrl+Enter', action: executeSampleTests, style: 'cyan' as const };
      case 'sample_testing':
      case 'full_testing':
      case 'submitting':
        return { label: '{ IN_PROGRESS }', hint: '', action: () => {}, style: 'cyan' as const };
      case 'sample_passed':
        return { label: 'Run All Tests', hint: 'Ctrl+Enter', action: executeAllTests, style: 'yellow' as const };
      case 'all_passed':
        return { label: 'Submit Solution', hint: 'Ctrl+Enter', action: handleSubmitSolution, style: 'green' as const };
      case 'submitted':
        return { label: 'Submitted ✓', hint: '', action: () => {}, style: 'green' as const };
      default:
        return { label: 'Execute Routine', hint: 'Ctrl+Enter', action: executeSampleTests, style: 'cyan' as const };
    }
  };

  const bottomAction = getBottomAction();
  const isProcessing = workflowState === 'sample_testing' || workflowState === 'full_testing' || workflowState === 'submitting';

  const showResultPanel = isTerminalVisible;
  const getStatusBadge = () => {
    if (isProcessing) {
      return <span className="text-xs font-bold text-yellow-500 animate-pulse">PROCESSING_</span>;
    }
    if (workflowState === 'submitted') {
      return <span className="text-[10px] px-2 py-1 border border-green-500/50 bg-green-500/10 font-black text-green-500 uppercase tracking-widest">SUBMITTED ✓</span>;
    }
    if (workflowState === 'all_passed') {
      return <span className="text-[10px] px-2 py-1 border border-green-500/50 bg-green-500/10 font-black text-green-500 uppercase tracking-widest">ALL TESTS PASSED</span>;
    }
    if (workflowState === 'sample_passed') {
      return <span className="text-[10px] px-2 py-1 border border-yellow-500/50 bg-yellow-500/10 font-black text-yellow-500 uppercase tracking-widest">SAMPLE TESTS PASSED</span>;
    }
    if (executionResult?.overallStatus === 'accepted') {
      return <span className="text-[10px] px-2 py-1 border border-green-500/50 bg-green-500/10 font-black text-green-500 uppercase tracking-widest">VERIFIED</span>;
    }
    if (executionResult) {
      return <span className="text-[10px] px-2 py-1 border border-red-500/50 bg-red-500/10 font-black text-red-500 uppercase tracking-widest">TERMINATION: {executionResult.overallStatus.toUpperCase().replace('_', ' ')}</span>;
    }
    return null;
  };

  const buttonStyleMap = {
    cyan: "bg-cyan-900/20 border-cyan-500/50 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] text-cyan-400",
    yellow: "bg-yellow-900/20 border-yellow-500/50 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] text-yellow-400",
    green: "bg-green-900/20 border-green-500/50 hover:bg-green-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] text-green-400",
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full bg-[#050505] text-gray-300 font-mono flex flex-col font-mono">
      <Group orientation="horizontal" className="flex-1 w-full border-t border-gray-800">
        
        {/* LEFT PANEL: Problem Details */}
        <Panel defaultSize={40} minSize={30} className="flex flex-col h-full bg-[#0a0a0a]">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-12 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            
            <div className="space-y-8">
              <header className="space-y-4 border-b border-gray-800 pb-8">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border ${
                    problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                    'bg-red-500/10 text-red-500 border-red-500/30'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <div className="flex gap-2">
                    {problem.tags?.map((tag: string) => (
                      <span key={tag} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-800 px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{problem.title}</h1>
                {(hasUserSolved || workflowState === 'submitted') && (
                  <Link 
                    href={`/problems/${problem.id}/submissions`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors border border-cyan-500/30 px-3 py-1.5 hover:bg-cyan-500/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                    View Submissions
                  </Link>
                )}
              </header>

              <section className="prose prose-invert prose-headings:text-cyan-400 prose-a:text-cyan-500 prose-pre:bg-black prose-pre:border prose-pre:border-gray-800 prose-p:text-gray-400 max-w-none">
                <ReactMarkdown>{mainDesc}</ReactMarkdown>
              </section>
            </div>

            {/* TEST CASES SECTION */}
            {testCases.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-cyan-400 uppercase tracking-wider border-b border-gray-800 pb-4">Examples</h3>
                {testCases.map((tc, idx) => (
                  <div key={idx} className="bg-black/50 border border-gray-800 space-y-4 p-5">
                    <h4 className="text-white font-bold uppercase text-xs tracking-widest bg-gray-800 px-2 py-1 inline-block">Example {idx + 1}</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-gray-800/50 pb-2">
                        <span>Input</span>
                        <CopyButton text={tc.input} />
                      </div>
                      <pre className="text-sm font-mono text-gray-300 bg-transparent p-0 overflow-x-auto whitespace-pre-wrap">{tc.input}</pre>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-gray-800/50 pb-2">
                        <span>Expected Output</span>
                      </div>
                      <pre className="text-sm font-mono text-cyan-400 bg-transparent p-0 overflow-x-auto whitespace-pre-wrap">{tc.output}</pre>
                    </div>

                    {tc.explanation && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-gray-800">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Explanation</div>
                        <div className="prose prose-invert prose-p:text-gray-400 prose-sm max-w-none"><ReactMarkdown>{tc.explanation}</ReactMarkdown></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </Panel>

        {/* RESIZE HANDLE */}
        <Separator className="w-[2px] bg-gray-800 hover:bg-cyan-500 hover:w-[4px] hover:-ml-[1px] transition-all duration-150 active:bg-cyan-400 z-10 cursor-col-resize" />

        {/* RIGHT PANEL: Editor */}
        <Panel defaultSize={60} minSize={30} className="flex flex-col h-full bg-black">
          
          <Group orientation="vertical" className="flex-1 w-full relative z-0">
            <Panel defaultSize={70} minSize={20} className="flex flex-col h-full">
              
              <div className="flex justify-between items-center bg-[#0a0a0a] border-b border-gray-800 px-6 py-4 flex-shrink-0">
                <div className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Terminal Active
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleResetCode}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-cyan-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Reset
                  </button>
                  <select 
                    name="programming_language" 
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-black border border-gray-700 text-gray-300 py-2 px-4 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-cyan-500 outline-none cursor-pointer hover:border-gray-500 transition-colors"
                  >
                    <option value="cpp">C++ 20</option>
                    <option value="python">Python 3.12</option>
                    <option value="javascript">JavaScript (Node v20)</option>
                    <option value="java">Java 21</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={handleCodeChange}
                  onMount={(editor, monaco) => {
                    setupMonacoIntellisense(monaco);
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorWidth: 2,
                  }}
                />
              </div>
            </Panel>

            {showResultPanel && (
               <Separator className="h-[2px] bg-gray-800 hover:bg-cyan-500 hover:h-[4px] hover:-mt-[1px] transition-all duration-150 active:bg-cyan-400 z-10 cursor-row-resize flex-shrink-0" />
            )}

            {showResultPanel && (
              <Panel defaultSize={30} minSize={10} className="flex flex-col h-full bg-[#0a0a0a] border-t border-gray-800 animate-in slide-in-from-bottom duration-500 ease-out">
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-800 bg-[#111] flex justify-between items-center flex-shrink-0">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Execution Details</span>
                    {getStatusBadge()}
                  </div>
                  
                  {isProcessing ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-[#050505] animate-pulse">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/50">
                        {workflowState === 'submitting' ? 'SYNCHRONIZING_SERVER...' : 'COMPILING_EXECUTABLE...'}
                      </div>
                    </div>
                  ) : executionResult && executionResult.results.length > 0 ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Tabs */}
                      <div className="flex gap-2 p-2 border-b border-gray-800 bg-[#050505] overflow-x-auto flex-shrink-0 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                        {/* Sample test case tabs */}
                        {executionResult.results.map((res, i) => (
                          <button 
                            key={`sample-${i}`}
                            onClick={(e) => { e.preventDefault(); setActiveTab(i); }}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors flex items-center gap-2 ${
                              activeTab === i 
                                 ? (res.passed ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-500 border-red-500/50')
                                 : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${res.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            Case {i + 1}
                          </button>
                        ))}

                        {/* Hidden test case tabs */}
                        {executionResult.hiddenResults && executionResult.hiddenResults.map((res, i) => {
                          const tabIdx = executionResult.results.length + i;
                          return (
                            <button 
                              key={`hidden-${i}`}
                              onClick={(e) => { e.preventDefault(); setActiveTab(tabIdx); }}
                              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors flex items-center gap-2 ${
                                activeTab === tabIdx
                                   ? (res.passed ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-500 border-red-500/50')
                                   : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${res.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              Hidden {res.caseNumber}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-sm scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                        {/* Show sample test case details */}
                        {activeTab < executionResult.results.length && (
                          <div className="animate-in fade-in zoom-in-95 duration-300">
                            <div className="space-y-2">
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Input Stream</div>
                              <pre className="bg-[#050505] border border-gray-800 p-3 text-gray-300 whitespace-pre-wrap">{executionResult.results[activeTab]?.input}</pre>
                            </div>
                            
                            <div className="space-y-2 mt-4">
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Expected Output</div>
                              <pre className="bg-[#050505] border border-gray-800 p-3 text-cyan-400 whitespace-pre-wrap">{executionResult.results[activeTab]?.expectedOutput}</pre>
                            </div>

                            <div className="space-y-2 mt-4">
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Actual Output</div>
                              <pre className={`bg-[#050505] border border-gray-800 p-3 whitespace-pre-wrap ${executionResult.results[activeTab]?.passed ? 'text-green-400' : 'text-red-400'}`}>
                                {executionResult.results[activeTab]?.actualOutput || ' '}
                              </pre>
                            </div>

                            {executionResult.results[activeTab]?.stderr && executionResult.results[activeTab].stderr.trim() !== '' && (
                              <div className="space-y-2 mt-4">
                                <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Compiler/Runtime Trace</div>
                                <pre className="bg-red-950/20 border border-red-900/50 p-3 text-red-400 whitespace-pre-wrap">{executionResult.results[activeTab].stderr}</pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Show hidden test case details (pass/fail only) */}
                        {executionResult.hiddenResults && activeTab >= executionResult.results.length && (() => {
                          const hiddenIdx = activeTab - executionResult.results.length;
                          const hiddenCase = executionResult.hiddenResults![hiddenIdx];
                          if (!hiddenCase) return null;
                          return (
                            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                              <div className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                                style={{
                                  borderColor: hiddenCase.passed ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                                  backgroundColor: hiddenCase.passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                }}
                              >
                                {hiddenCase.passed ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                )}
                              </div>
                              <div className="text-center space-y-2">
                                <div className={`text-lg font-black uppercase tracking-widest ${hiddenCase.passed ? 'text-green-400' : 'text-red-400'}`}>
                                  Hidden Case {hiddenCase.caseNumber} — {hiddenCase.passed ? 'PASSED' : 'FAILED'}
                                </div>
                                <div className="text-xs text-gray-600 uppercase tracking-widest flex items-center gap-2 justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                  Input and expected output are hidden
                                </div>
                              </div>
                              {!hiddenCase.passed && hiddenCase.stderr && hiddenCase.stderr.trim() !== '' && (
                                <div className="w-full space-y-2 mt-4">
                                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Runtime Trace</div>
                                  <pre className="bg-red-950/20 border border-red-900/50 p-3 text-red-400 whitespace-pre-wrap text-xs">{hiddenCase.stderr}</pre>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ) : null}

                  {!isProcessing && executionResult?.error && (
                     <div className="p-5 text-sm text-red-500 font-mono flex-1 overflow-y-auto bg-red-950/10 animate-in fade-in duration-300">
                       <span className="font-bold">SYSTEM_ERR:</span> {executionResult.error}
                     </div>
                  )}
                </div>
              </Panel>
            )}
          </Group>

          {/* Bottom Action Bar */}
          <div className="border-t border-gray-800 bg-[#050505] p-6 flex-shrink-0 relative z-10 space-y-3">
            {/* Workflow state indicator */}
            {workflowState !== 'idle' && (
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600">
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    workflowState === 'sample_passed' ? 'bg-yellow-500' :
                    workflowState === 'all_passed' || workflowState === 'submitted' ? 'bg-green-500' :
                    workflowState.includes('failed') ? 'bg-red-500' :
                    'bg-gray-600 animate-pulse'
                  }`}></span>
                  {workflowState === 'sample_passed' && 'Sample tests passed — Press Ctrl+Enter to run all tests'}
                  {workflowState === 'all_passed' && 'All tests passed — Press Ctrl+Enter or click below to submit'}
                  {workflowState === 'submitted' && 'Solution submitted successfully!'}
                  {workflowState === 'sample_failed' && 'Sample tests failed — Fix your code and try again'}
                  {workflowState === 'full_failed' && 'Hidden tests failed — Fix your code and try again'}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={bottomAction.action}
                disabled={isProcessing || workflowState === 'submitted'}
                className={`flex-1 py-4 border font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.99] group flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyleMap[bottomAction.style]}`}
              >
                {bottomAction.label}
                {bottomAction.hint && !isProcessing && (
                  <span className="text-[10px] opacity-50 font-medium tracking-normal normal-case">({bottomAction.hint})</span>
                )}
                {!isProcessing && workflowState !== 'submitted' && <span className="transform group-hover:translate-x-1 transition-transform inline-block">↗</span>}
              </button>

              {workflowState === 'submitted' && submissionId && (
                <Link
                  href={`/problems/${problem.id}/submissions`}
                  className="px-8 py-4 border border-cyan-500/50 bg-cyan-900/20 hover:bg-cyan-500 hover:text-black text-cyan-400 font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center gap-2"
                >
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </Link>
              )}
            </div>
          </div>

        </Panel>
      </Group>
    </div>
  );
}
