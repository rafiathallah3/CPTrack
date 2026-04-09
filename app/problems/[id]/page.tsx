import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Workspace from "./Workspace";

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: problem } = await supabase.from("problems").select("*").eq("id", id).single();

  if (!problem) return notFound();

  return <Workspace problem={problem} />;
}
