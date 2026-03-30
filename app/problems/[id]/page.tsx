import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { handleSubmission } from "../../actions/submission";

export default async function ProblemPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: problem } = await supabase.from("problems").select("*").eq("id", params.id).single();

  if (!problem) return notFound();

  return (
    <div className="container mx-auto p-12 grid grid-cols-1 xl:grid-cols-2 gap-16 min-h-screen">
      <div className="space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
              problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
              problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
              'bg-red-500/10 text-red-500 border border-red-500/30'
            }`}>
              {problem.difficulty}
            </span>
            <div className="flex gap-2">
              {problem.tags?.map((tag: string) => (
                <span key={tag} className="text-xs font-bold text-gray-500 bg-gray-900 border border-gray-800 px-3 py-1 rounded-lg">#{tag}</span>
              ))}
            </div>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">{problem.title}</h1>
        </header>

        <section className="prose prose-invert max-w-none bg-gray-900/50 p-10 rounded-3xl border border-gray-800 shadow-2xl">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Objective</h2>
          <p className="text-xl text-gray-300 leading-relaxed indent-8">
            {problem.description}
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-4 text-white">
            <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-sm">01</span>
            Sample Test Cases
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-black border border-gray-800 p-8 rounded-2xl space-y-4">
              <div className="flex justify-between items-center text-xs font-black text-gray-500 uppercase tracking-widest">
                <span>Input</span>
              </div>
              <pre className="font-mono text-blue-400 bg-blue-500/5 p-4 rounded-xl">{"5 10 15 20"}</pre>
              <div className="flex justify-between items-center text-xs font-black text-gray-500 uppercase tracking-widest pt-4">
                <span>Expected Output</span>
              </div>
              <pre className="font-mono text-green-400 bg-green-500/5 p-4 rounded-xl">{"50"}</pre>
            </div>
          </div>
        </section>
      </div>

      <div className="relative">
        <div className="sticky top-12 space-y-8">
          <form action={handleSubmission} className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            
            <input type="hidden" name="problem_id" value={problem.id} />
            
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Submit Solution</h2>
              <select name="programming_language" className="bg-black border border-gray-700 text-white p-3 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none">
                <option value="cpp">C++ 20</option>
                <option value="python">Python 3.12</option>
                <option value="javascript">JavaScript (Node v20)</option>
                <option value="java">Java 21</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-800/50 p-4 rounded-t-2xl border-x border-t border-gray-800">
                <span>main.cpp</span>
                <span className="text-blue-500">Auto-saved</span>
              </div>
              <textarea 
                name="code" 
                placeholder="// Write your elite code here..." 
                className="w-full h-[500px] bg-black border border-gray-800 text-blue-400 p-8 rounded-b-2xl font-mono text-lg leading-relaxed focus:ring-2 focus:ring-blue-600 outline-none resize-none shadow-inner"
                required
              />
            </div>

            <button type="submit" className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-blue-900/20 transform hover:-translate-y-1 transition-all active:scale-95 group">
              Execute & Submit 
              <span className="ml-4 transform group-hover:translate-x-2 transition-transform inline-block">🚀</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
