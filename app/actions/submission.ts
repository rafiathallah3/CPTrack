"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { executeCodeWithPiston, ExecutionResult } from "@/utils/pistonClient";

export type TestCaseResult = {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  status: ExecutionResult['status'];
  passed: boolean;
};

export type HiddenTestCaseResult = {
  caseNumber: number;
  passed: boolean;
  stderr: string;
  status: ExecutionResult['status'];
};

export type SubmissionResponse = {
  success: boolean;
  overallStatus: string;
  error?: string;
  results: TestCaseResult[];
  hiddenResults?: HiddenTestCaseResult[];
};

/**
 * Stage 1: Run code against sample test cases only.
 * Does NOT create a submission row.
 */
export async function runSampleTests(
  problemId: string,
  code: string,
  language: string
): Promise<SubmissionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, overallStatus: "error", error: "Not authenticated", results: [] };
  }

  // Fetch sample test cases
  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .select("test_cases")
    .eq("id", problemId)
    .single();

  if (problemError || !problem) {
    return { success: false, overallStatus: "error", error: "Failed to fetch problem data: " + (problemError?.message || "Not found"), results: [] };
  }

  const testCases = problem.test_cases || [];
  let finalStatus = "accepted";
  const results: TestCaseResult[] = [];

  for (const testCase of testCases) {
    const result = await executeCodeWithPiston(
      language,
      code,
      testCase.input,
      testCase.expected_output
    );

    const tcResult: TestCaseResult = {
      input: testCase.input,
      expectedOutput: testCase.expected_output,
      actualOutput: result.stdout,
      stderr: result.stderr,
      status: result.status,
      passed: result.status === 'Accepted'
    };

    results.push(tcResult);

    if (result.status !== 'Accepted' && finalStatus === 'accepted') {
      finalStatus = result.status.toLowerCase().replace(' ', '_');
    }
  }

  if (testCases.length === 0) {
    finalStatus = "accepted";
  }

  return {
    success: true,
    overallStatus: finalStatus,
    results
  };
}

/**
 * Stage 2: Run code against ALL test cases (sample + hidden).
 * Does NOT create a submission row.
 * Hidden test results only expose pass/fail, no input/output.
 */
export async function runAllTests(
  problemId: string,
  code: string,
  language: string
): Promise<SubmissionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, overallStatus: "error", error: "Not authenticated", results: [] };
  }

  // Fetch both sample and hidden test cases
  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .select("test_cases, hidden_test_cases")
    .eq("id", problemId)
    .single();

  if (problemError || !problem) {
    return { success: false, overallStatus: "error", error: "Failed to fetch problem data: " + (problemError?.message || "Not found"), results: [] };
  }

  const sampleCases = problem.test_cases || [];
  const hiddenCases = problem.hidden_test_cases || [];
  let finalStatus = "accepted";
  const results: TestCaseResult[] = [];
  const hiddenResults: HiddenTestCaseResult[] = [];

  // Run sample test cases (with full details)
  for (const testCase of sampleCases) {
    const result = await executeCodeWithPiston(
      language,
      code,
      testCase.input,
      testCase.expected_output
    );

    results.push({
      input: testCase.input,
      expectedOutput: testCase.expected_output,
      actualOutput: result.stdout,
      stderr: result.stderr,
      status: result.status,
      passed: result.status === 'Accepted'
    });

    if (result.status !== 'Accepted' && finalStatus === 'accepted') {
      finalStatus = result.status.toLowerCase().replace(' ', '_');
    }
  }

  // Run hidden test cases (pass/fail only)
  for (let i = 0; i < hiddenCases.length; i++) {
    const testCase = hiddenCases[i];
    const result = await executeCodeWithPiston(
      language,
      code,
      testCase.input,
      testCase.expected_output
    );

    hiddenResults.push({
      caseNumber: i + 1,
      passed: result.status === 'Accepted',
      stderr: result.status !== 'Accepted' ? result.stderr : '',
      status: result.status
    });

    if (result.status !== 'Accepted' && finalStatus === 'accepted') {
      finalStatus = result.status.toLowerCase().replace(' ', '_');
    }
  }

  if (sampleCases.length === 0 && hiddenCases.length === 0) {
    finalStatus = "accepted";
  }

  return {
    success: true,
    overallStatus: finalStatus,
    results,
    hiddenResults
  };
}

/**
 * Stage 3: Submit the final accepted solution.
 * Re-verifies server-side, then creates the submission row.
 */
export async function submitSolution(
  problemId: string,
  code: string,
  language: string
): Promise<{ success: boolean; error?: string; submissionId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Re-verify against all test cases server-side
  const verification = await runAllTests(problemId, code, language);

  if (verification.overallStatus !== 'accepted') {
    return { success: false, error: "Solution did not pass all test cases. Status: " + verification.overallStatus };
  }

  // Create the accepted submission
  const { data: record, error } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      problem_id: problemId,
      code,
      programming_language: language,
      status: "accepted"
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Failed to submit: " + error.message };
  }

  revalidatePath(`/problems/${problemId}`);
  revalidatePath(`/problems/${problemId}/submissions`);

  return { success: true, submissionId: record.id };
}
