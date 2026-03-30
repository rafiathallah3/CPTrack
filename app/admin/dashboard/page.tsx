import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createContest, createProblem } from "../actions/admin";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check role
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Create Contest</h2>
          <form action={createContest} className="flex flex-col gap-4">
            <input name="name" placeholder="Contest Name" required className="p-2 bg-gray-700 rounded text-white" />
            <input type="datetime-local" name="start_time" required className="p-2 bg-gray-700 rounded text-white" />
            <input type="datetime-local" name="end_time" required className="p-2 bg-gray-700 rounded text-white" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold text-white transition-colors">
              Create Contest
            </button>
          </form>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Create Problem</h2>
          <form action={createProblem} className="flex flex-col gap-4">
            <input name="title" placeholder="Problem Title" required className="p-2 bg-gray-700 rounded text-white" />
            <textarea name="description" placeholder="Problem Description" rows={4} required className="p-2 bg-gray-700 rounded text-white" />
            <select name="difficulty" className="p-2 bg-gray-700 rounded text-white">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <input name="tags" placeholder="Tags (comma separated)" className="p-2 bg-gray-700 rounded text-white" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold text-white transition-colors">
              Create Problem
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
