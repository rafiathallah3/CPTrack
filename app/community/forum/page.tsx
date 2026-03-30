import { createClient } from "@/utils/supabase/server";
import { createThread, postComment } from "../../actions/community";
import Link from "next/link";

export default async function ForumPage() {
  const supabase = await createClient();
  const { data: threads } = await supabase.from("forum_threads").select(`
    id, title, created_at,
    users(username)
  `).order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Community Forum</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Start a new thread</h2>
        <form action={createThread} className="flex flex-col gap-4">
          <input name="title" placeholder="Thread Title" required className="p-2 bg-gray-700 rounded text-white" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white font-bold w-fit">
            Create Thread
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {threads?.map((thread: any) => (
          <div key={thread.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:bg-gray-750 transition-colors">
            <div>
              <Link href={`/community/forum/${thread.id}`} className="text-blue-400 hover:text-blue-300 font-semibold text-lg block">
                {thread.title}
              </Link>
              <span className="text-sm text-gray-400">By {thread.users?.username || 'Unknown'} at {new Date(thread.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {threads?.length === 0 && <p className="text-gray-400">No threads yet. Be the first to post!</p>}
      </div>
    </div>
  );
}
