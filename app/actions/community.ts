"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// CommunityController & UserController(createBlogPost) equivalent
export async function createBlogPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const { error } = await supabase
    .from("blog_posts")
    .insert({ title, content, author_id: user.id });

  if (error) throw new Error("Failed to create blog post: " + error.message);
  revalidatePath("/community/blog");
}

export async function createThread(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;

  const { error } = await supabase
    .from("forum_threads")
    .insert({ title, author_id: user.id });

  if (error) throw new Error("Failed to create thread: " + error.message);
  revalidatePath("/community/forum");
}

export async function postComment(threadId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("forum_posts")
    .insert({ thread_id: threadId, content, author_id: user.id });

  if (error) throw new Error("Failed to post comment: " + error.message);
  revalidatePath(`/community/forum/${threadId}`);
}
