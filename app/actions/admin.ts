"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// AdminController equivalent
export async function manageUser(userId: string, updates: Partial<{ role: string, rating: number }>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) throw new Error("Failed to manage user: " + error.message);
  revalidatePath("/admin/dashboard");
}

export async function createContest(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("name") as string;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;

  const { error } = await supabase
    .from("contests")
    .insert({ name: title, start_time: startTime, end_time: endTime });

  if (error) throw new Error("Failed to create contest: " + error.message);
  revalidatePath("/contests");
}

export async function createProblem(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const difficulty = formData.get("difficulty") as string;
  const tagsStr = formData.get("tags") as string || "";

  const { error } = await supabase
    .from("problems")
    .insert({ title, description, difficulty, tags: tagsStr.split(",").map(t => t.trim()) });

  if (error) throw new Error("Failed to create problem: " + error.message);
  revalidatePath("/problems");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts") // Can be conditional for forum_posts as well
    .delete()
    .eq("id", postId);

  if (error) throw new Error("Failed to delete post: " + error.message);
  revalidatePath("/community");
}
