"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { executeCodeWithPiston } from "@/utils/pistonClient";

// SubmissionController equivalent
export async function handleSubmission(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const problemId = formData.get("problem_id") as string;
  const code = formData.get("code") as string;
  const language = formData.get("programming_language") as string;

  const { data: record, error } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      problem_id: problemId,
      code,
      programming_language: language,
      status: "pending"
    })
    .select()
    .single();

  if (error) throw new Error("Failed to submit code: " + error.message);

  console.log(`Executing code for submission ${record.id}`);

  // Fetch test cases
  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .select("test_cases")
    .eq("id", problemId)
    .single();

  if (problemError || !problem) {
    throw new Error("Failed to fetch problem data: " + (problemError?.message || "Not found"));
  }

  const testCases = problem.test_cases || [];
  let finalStatus = "accepted"; 

  // Evaluate against test cases
  for (const testCase of testCases) {
    const result = await executeCodeWithPiston(
      language,
      code,
      testCase.input,
      testCase.expected_output
    );

    if (result.status !== 'Accepted') {
      finalStatus = result.status.toLowerCase().replace(' ', '_'); // Maps to enum (e.g. wrong_answer, compilation_error)
      break; 
    }
  }

  if (testCases.length === 0) {
    finalStatus = "accepted"; // Default pass if no cases defined
  }

  // Update submission status in DB
  const { error: updateError } = await supabase
    .from("submissions")
    .update({ status: finalStatus })
    .eq("id", record.id);

  if (updateError) {
    console.error(`Failed to update status for submission ${record.id}:`, updateError.message);
  }

  revalidatePath(`/problems/${problemId}`);
}
