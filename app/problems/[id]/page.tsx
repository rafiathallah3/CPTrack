import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Workspace from "./Workspace";

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const supabase = await createClient();
	const { data: problem } = await supabase.from("problems").select("*").eq("id", id).single();

	if (!problem) return notFound();

	// Check if the current user has already solved this problem
	let hasUserSolved = false;
	const { data: { user } } = await supabase.auth.getUser();
	if (user) {
		const { data: accepted } = await supabase
			.from("submissions")
			.select("id")
			.eq("problem_id", id)
			.eq("user_id", user.id)
			.eq("status", "accepted")
			.limit(1);
		hasUserSolved = (accepted && accepted.length > 0) || false;
	}

	return <Workspace problem={problem} hasUserSolved={hasUserSolved} />;
}
