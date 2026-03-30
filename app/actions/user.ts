"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// UserController equivalent
export async function viewProgression(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("rating, created_at, role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch progression:", error);
    return null;
  }
  return data;
}

export async function viewHistory(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*, problems(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
  return data;
}
