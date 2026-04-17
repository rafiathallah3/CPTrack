import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import SubmissionCard from "./SubmissionCard";

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: problemId } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch problem
  const { data: problem } = await supabase
    .from("problems")
    .select("id, title, difficulty")
    .eq("id", problemId)
    .single();

  if (!problem) return notFound();

  // Check if user has solved this problem (gate check)
  const { data: userAccepted } = await supabase
    .from("submissions")
    .select("id")
    .eq("problem_id", problemId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .limit(1);

  if (!userAccepted || userAccepted.length === 0) {
    // User hasn't solved this problem — redirect back
    redirect(`/problems/${problemId}`);
  }

  // Fetch all accepted submissions for this problem, newest first
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id,
      code,
      programming_language,
      created_at,
      user_id
    `)
    .eq("problem_id", problemId)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  // Fetch usernames for all submission authors
  const userIds = [...new Set(submissions?.map(s => s.user_id) || [])];
  const { data: users } = await supabase
    .from("users")
    .select("id, username")
    .in("id", userIds);

  const usernameMap: Record<string, string> = {};
  users?.forEach(u => { usernameMap[u.id] = u.username; });

  // Fetch all votes for these submissions
  const submissionIds = submissions?.map(s => s.id) || [];
  const { data: allVotes } = await supabase
    .from("submission_votes")
    .select("submission_id, user_id, vote_type")
    .in("submission_id", submissionIds);

  // Aggregate votes per submission
  const votesMap: Record<string, { likes: number; dislikes: number; userVote: 'like' | 'dislike' | null }> = {};
  submissionIds.forEach(sid => {
    votesMap[sid] = { likes: 0, dislikes: 0, userVote: null };
  });
  allVotes?.forEach(v => {
    if (!votesMap[v.submission_id]) return;
    if (v.vote_type === 'like') votesMap[v.submission_id].likes++;
    else votesMap[v.submission_id].dislikes++;
    if (v.user_id === user.id) votesMap[v.submission_id].userVote = v.vote_type as 'like' | 'dislike';
  });

  const difficultyStyle = problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/30'
    : problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
    : 'bg-red-500/10 text-red-500 border-red-500/30';

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-mono">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <header className="space-y-4 border-b border-gray-800 pb-8">
          <Link
            href={`/problems/${problemId}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Problem
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{problem.title}</h1>
            <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border ${difficultyStyle}`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Accepted Solutions</h2>
            <span className="text-xs text-gray-600">{submissions?.length || 0} submissions</span>
          </div>
        </header>

        {/* Submissions */}
        <div className="space-y-4">
          {submissions && submissions.length > 0 ? (
            submissions.map((sub) => (
              <SubmissionCard
                key={sub.id}
                submission={{
                  id: sub.id,
                  code: sub.code,
                  programming_language: sub.programming_language,
                  created_at: sub.created_at,
                  username: usernameMap[sub.user_id] || 'Unknown',
                }}
                likes={votesMap[sub.id]?.likes || 0}
                dislikes={votesMap[sub.id]?.dislikes || 0}
                currentUserVote={votesMap[sub.id]?.userVote || null}
              />
            ))
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-[#0a0a0a] border border-dashed border-gray-800">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No submissions yet</h3>
              <p className="text-gray-500 text-sm">Be the first to solve this problem!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
