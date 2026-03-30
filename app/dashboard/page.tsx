import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 mt-8">
      
      {/* Sidebar: User Info */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="cp-border bg-cp-bg text-sm">
          <div className="cp-border-b bg-cp-panel px-4 py-3 font-bold text-cp-text flex justify-between items-center">
            <span>→ User Profile</span>
            <form action={logout}>
              <button type="submit" className="text-xs text-cp-muted hover:text-cp-red font-mono transition-colors duration-200 cp-focus cp-focus:focus-visible rounded-sm cursor-pointer p-1">
                [ Logout ]
              </button>
            </form>
          </div>
          <div className="p-4 flex flex-col items-center border-b border-cp-border">
            <div className="w-24 h-24 cp-border bg-cp-panel flex flex-col items-center justify-center font-bold text-2xl mb-3 text-cp-muted">
              {user.user_metadata?.username ? user.user_metadata.username[0].toUpperCase() : 'U'}
            </div>
            <h2 className="text-xl font-bold font-sans text-cp-text">
              {user.user_metadata?.username || user.email?.split('@')[0]}
            </h2>
            <div className="text-xs font-mono font-bold text-cp-muted mt-1">Pupil</div>
          </div>
          <div className="p-4 font-mono text-xs flex flex-col gap-3 text-cp-text">
            <div className="flex justify-between border-b border-cp-border/50 pb-2">
              <span className="text-cp-muted">Contest rating:</span>
              <span className="font-bold text-cp-green">1200</span>
            </div>
            <div className="flex justify-between border-b border-cp-border/50 pb-2">
              <span className="text-cp-muted">Contribution:</span>
              <span className="font-bold text-cp-green">+5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cp-muted">Registered:</span>
              <span className="font-bold">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Rating Graph Placeholder */}
        <div className="cp-border bg-cp-bg">
          <div className="cp-border-b bg-cp-panel px-4 py-3 font-bold text-cp-blue">
            → Rating
          </div>
          <div className="p-6 h-48 flex items-center justify-center border-b border-cp-border relative overflow-hidden bg-cp-panel/30">
            {/* Extremely simple CSS "graph" for the aesthetic */}
            <div className="absolute inset-x-0 bottom-0 h-24 border-t border-cp-border bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:100%_20px]"></div>
            <div className="relative z-10 font-mono text-sm text-cp-text border border-cp-border bg-cp-panel px-4 py-2 hover:border-cp-active transition-colors duration-200">
              Participate in contests to unlock your rating history graph.
            </div>
          </div>
        </div>

        {/* Unsolved / Recent Action Panel */}
        <div className="flex flex-col gap-0 cp-border bg-cp-bg">
          <div className="cp-border-b bg-cp-panel px-4 py-3 font-bold text-cp-text">
            → Recent Problems
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono text-left border-collapse">
              <thead>
                <tr className="cp-border-b bg-cp-panel/50 text-cp-muted">
                  <th className="font-normal px-4 py-3 w-16 text-center">#</th>
                  <th className="font-normal px-4 py-3">Problem Name</th>
                  <th className="font-normal px-4 py-3 w-32 text-center">Verdict</th>
                  <th className="font-normal px-4 py-3 w-24 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-cp-muted bg-cp-bg hover:bg-cp-panel/30 transition-colors duration-200">
                    You haven't solved any problems recently. Time to start coding!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
