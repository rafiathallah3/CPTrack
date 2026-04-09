import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProblemsListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : '';
  const difficultyFilter = typeof searchParams.difficulty === 'string' ? searchParams.difficulty : '';

  let query = supabase.from("problems").select("*");

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  if (difficultyFilter && difficultyFilter !== 'All') {
    query = query.eq("difficulty", difficultyFilter);
  }

  const { data: problems } = await query.order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-12 min-h-screen">
      <header className="mb-12 border-b border-gray-800 pb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tight leading-none mb-4">
          Problem Set
        </h1>
        <p className="text-gray-400 text-lg">Challenge your skills with our curated collection of competitive programming problems.</p>
      </header>

      {/* Filter and Search Bar aligned with App Router Server Actions standard GET method */}
      <form action="/problems" method="GET" className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 items-center mb-12">
        <div className="flex-1 w-full relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search problems by title..."
            className="w-full bg-black border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-gray-600 font-medium"
          />
        </div>

        <div className="w-full md:w-auto min-w-[200px]">
          <select
            name="difficulty"
            defaultValue={difficultyFilter || 'All'}
            className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold tracking-wide cursor-pointer appearance-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy" className="text-green-500 font-bold">Easy</option>
            <option value="Medium" className="text-yellow-500 font-bold">Medium</option>
            <option value="Hard" className="text-red-500 font-bold">Hard</option>
          </select>
        </div>

        <button type="submit" className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black tracking-widest uppercase rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95">
          Filter
        </button>
      </form>

      <div className="space-y-4">
        {problems?.map((problem: any) => (
          <Link href={`/problems/${problem.id}`} key={problem.id} className="block group">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center justify-between hover:bg-gray-800 transition-colors duration-300 hover:border-gray-700 relative overflow-hidden">
              {/* Optional nice animated accent on hover */}
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {problem.title}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                        'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex gap-2 relative z-10">
                  {problem.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs font-semibold text-gray-500 pr-3 relative before:content-[''] before:absolute before:right-1 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-700 before:rounded-full last:before:hidden">
                      {tag}
                    </span>
                  ))}
                  {(!problem.tags || problem.tags.length === 0) && (
                    <span className="text-xs text-gray-600 italic">No tags</span>
                  )}
                </div>
              </div>

              <div className="pl-6 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transform group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {(!problems || problems.length === 0) && (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-900/30 rounded-3xl border border-dashed border-gray-800">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No problems found</h3>
            <p className="text-gray-500 max-w-md">We couldn't find any problems matching your search parameters. Try clearing your filters or search query.</p>
            <Link href="/problems" className="mt-6 text-blue-500 hover:text-blue-400 font-bold transition-colors">
              Clear Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
