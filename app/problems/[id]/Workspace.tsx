"use client";

import React, { useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { handleSubmission } from "../../actions/submission";

// Custom hook / helper to extract test cases from raw markdown description
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
          insertText: `import sys\n\ndef solve():\n\tinput = sys.stdin.read\n\tdata = input().split()\n\t$0\n\nif __name__ == '__main__':\n\tsolve()`,
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

export default function Workspace({ problem }: { problem: any }) {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("// Write your elite code here...\n");

  const { mainDesc, testCases } = parseTestCases(problem.description);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
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
          
          <form action={handleSubmission} className="flex flex-col h-full">
            <input type="hidden" name="problem_id" value={problem.id} />
            <input type="hidden" name="code" value={code} />
            
            <div className="flex justify-between items-center bg-[#0a0a0a] border-b border-gray-800 px-6 py-4">
              <div className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Terminal Active
              </div>
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

            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
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

            <div className="border-t border-gray-800 bg-[#050505] p-6">
              <button 
                type="submit" 
                className="w-full py-4 bg-cyan-900/20 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] text-cyan-400 font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.99] group flex justify-center items-center gap-3"
              >
                Execute Routine
                <span className="transform group-hover:translate-x-1 transition-transform inline-block">↗</span>
              </button>
            </div>
          </form>

        </Panel>
      </Group>
    </div>
  );
}
