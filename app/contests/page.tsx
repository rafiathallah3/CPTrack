import { createClient } from "@/utils/supabase/server";
import { joinContest } from "../actions/contest";
import Link from "next/link";

export default async function ContestsPage() {
  const supabase = await createClient();
  const { data: contests } = await supabase.from("contests").select(`
    id, name, start_time, end_time,
    users(username)
  `).order("start_time", { ascending: true });

  const now = new Date();

  return (
    <div className="container mx-auto p-12 space-y-12 bg-black min-h-screen text-gray-100">
      <header className="flex justify-between items-center bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight">Explore Contests</h1>
          <p className="text-lg text-gray-400">Discover upcoming challenges and elite programming competitions.</p>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold uppercase text-blue-500 tracking-wider">Live System</p>
            <p className="text-3xl font-mono text-white tabular-nums">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-3 border-l-4 border-blue-600 pl-4">
            Upcoming & Active
          </h2>
          <div className="space-y-6">
            {contests?.map((contest: any) => {
              const start = new Date(contest.start_time);
              const end = new Date(contest.end_time);
              const isActive = now >= start && now <= end;
              
              return (
                <div key={contest.id} className={`group relative p-1 rounded-2xl transition-all hover:scale-[1.01] ${isActive ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                  <div className="bg-gray-900 rounded-[15px] p-8 h-full flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{contest.name}</h3>
                        {isActive && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-tighter rounded-full animate-pulse border border-green-500/30">
                            Live
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {start.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          Organized by {contest.users?.username || 'System'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                        <form action={joinContest.bind(null, contest.id)}>
                            <button className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-lg hover:bg-blue-500 hover:text-white transition-all transform active:scale-95 shadow-lg">
                                Enter Arena
                            </button>
                        </form>
                    </div>
                  </div>
                </div>
              )
            })}
            {contests?.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                <p className="text-xl text-gray-600 font-medium italic">The arena is quiet, no battles scheduled...</p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-black uppercase tracking-widest text-blue-500 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Global Leaderboard
            </h2>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-black ${rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-500'}`}>
                      #{rank}
                    </span>
                    <span className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">Player_{rank * 123}</span>
                  </div>
                  <span className="font-mono text-gray-400 font-bold">{4000 - (rank * 200)} pts</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
