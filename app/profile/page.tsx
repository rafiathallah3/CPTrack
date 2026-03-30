import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { viewHistory, viewProgression } from "../actions/user";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const progression = await viewProgression(user.id);
  const history = await viewHistory(user.id);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Progression</h2>
        <p><strong>Role:</strong> <span className="capitalize">{progression?.role || "user"}</span></p>
        <p><strong>Rating:</strong> {progression?.rating || 0}</p>
        <p><strong>Joined:</strong> {progression ? new Date(progression.created_at).toLocaleDateString() : 'N/A'}</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Submission History</h2>
        {history && history.length > 0 ? (
          <ul className="space-y-4">
            {history.map((sub: any) => (
              <li key={sub.id} className="border-b border-gray-700 pb-2">
                <span className="font-semibold">{sub.problems?.title || 'Unknown Problem'}</span> - 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${sub.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'}`}>
                  {sub.status.replace("_", " ")}
                </span>
                <div className="text-sm text-gray-400 mt-1">{sub.programming_language} | {new Date(sub.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No submissions yet.</p>
        )}
      </div>
    </div>
  );
}
