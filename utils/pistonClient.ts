export interface ExecutionResult {
  stdout: string;
  stderr: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error';
  output: string;
}

export const languageAliases: Record<string, { language: string, version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' }, // nodejs
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
};

export async function executeCodeWithPiston(
  programmingLanguage: string,
  code: string,
  stdin: string,
  expectedOutput: string
): Promise<ExecutionResult> {
  const langConfig = languageAliases[programmingLanguage];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${programmingLanguage}`);
  }

  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: langConfig.language,
      version: langConfig.version,
      files: [{ content: code }],
      stdin: stdin
    })
  });

  const runResult = await response.json();

  if (runResult.message) {
      throw new Error(`Piston API Error: ${runResult.message}`);
  }

  if (runResult.compile && runResult.compile.code !== 0) {
    return {
      stdout: "",
      stderr: runResult.compile.stderr,
      status: 'Compilation Error',
      output: runResult.compile.stderr,
    };
  }

  const stdout = runResult.run.stdout;
  const stderr = runResult.run.stderr;

  if (runResult.run.signal || runResult.run.code !== 0 || stderr.length > 0) {
    return {
      stdout,
      stderr,
      status: 'Runtime Error',
      output: stderr,
    };
  }

  const isAccepted = expectedOutput.trim() === stdout.trim();

  return {
    stdout,
    stderr,
    status: isAccepted ? 'Accepted' : 'Wrong Answer',
    output: stdout,
  };
}
