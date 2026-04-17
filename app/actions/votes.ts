"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Vote on a submission (like or dislike). Upserts — if the user already voted,
 * updates their vote type.
 */
export async function voteOnSubmission(
  submissionId: string,
  voteType: 'like' | 'dislike'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("submission_votes")
    .upsert(
      {
        submission_id: submissionId,
        user_id: user.id,
        vote_type: voteType,
      },
      { onConflict: "submission_id,user_id" }
    );

  if (error) {
    return { success: false, error: "Failed to vote: " + error.message };
  }

  // Fetch problemId to revalidate the submissions page
  const { data: sub } = await supabase.from("submissions").select("problem_id").eq("id", submissionId).single();
  if (sub) {
    revalidatePath(`/problems/${sub.problem_id}/submissions`);
  }
  
  return { success: true };
}

/**
 * Remove a vote from a submission.
 */
export async function removeVote(
  submissionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("submission_votes")
    .delete()
    .eq("submission_id", submissionId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: "Failed to remove vote: " + error.message };
  }

  // Fetch problemId to revalidate the submissions page
  const { data: sub } = await supabase.from("submissions").select("problem_id").eq("id", submissionId).single();
  if (sub) {
    revalidatePath(`/problems/${sub.problem_id}/submissions`);
  }

  return { success: true };
}
