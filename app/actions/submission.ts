"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

  // Here you would trigger external compilation/execution sandbox
  // compileAndExecute() equivalent 
  console.log(`Executing code for submission ${record.id}`);

  revalidatePath(`/problems/${problemId}`);
}
