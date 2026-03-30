import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 mt-8">
      {/* Left Column: Main Feed */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="cp-border bg-cp-bg">
          <div className="cp-border-b bg-cp-panel px-4 py-3 font-bold text-cp-blue">
            → Welcome to CPTrack
          </div>
          <div className="p-5 flex flex-col gap-4 text-sm">
            <h1 className="text-3xl font-bold font-sans text-cp-text">Elevate your Competitive Programming</h1>
            <p className="font-mono text-cp-muted max-w-2xl leading-relaxed">
              Solve algorithmic challenges, join global contests, and track your progress 
              with our utilitarian platform designed for serious coders. No fluff, just code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {user ? (
                <Link 
                  href="/dashboard"
                  className="px-6 py-2.5 cp-border bg-cp-active text-cp-bg hover:bg-blue-300 transition-colors duration-200 font-bold font-mono text-center cp-focus cp-focus:focus-visible rounded-sm"
                >
                  Enter Dashboard
                </Link>
              ) : (
                <Link 
                  href="/register"
                  className="px-6 py-2.5 cp-border bg-cp-text text-cp-bg hover:bg-cp-muted transition-colors duration-200 font-bold font-mono text-center cp-focus cp-focus:focus-visible rounded-sm"
                >
                  Register
                </Link>
              )}
              <Link 
                href="/problems"
                className="px-6 py-2.5 cp-border hover:bg-cp-panel hover:text-white transition-colors duration-200 font-bold font-mono text-center text-cp-text cp-focus cp-focus:focus-visible rounded-sm"
              >
                Explore Problems
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0 cp-border overflow-x-auto">
          <div className="cp-border-b bg-cp-panel px-4 py-3 font-bold text-cp-text flex justify-between items-center whitespace-nowrap">
            <span>→ Recent Contests</span>
            <span className="font-mono text-xs text-cp-muted font-normal hover:text-cp-blue cursor-pointer transition-colors duration-200 cp-focus cp-focus:focus-visible rounded-sm p-1">View All</span>
          </div>
          <div className="min-w-[500px]">
            <table className="w-full text-sm font-mono text-left border-collapse">
              <thead>
                <tr className="cp-border-b bg-cp-panel/50 text-cp-muted">
                  <th className="font-normal px-4 py-3">Name</th>
                  <th className="font-normal px-4 py-3 w-40">Writers</th>
                  <th className="font-normal px-4 py-3 w-32 text-right">Length</th>
                </tr>
              </thead>
              <tbody>
                <tr className="cp-border-b hover:bg-cp-panel transition-colors duration-200 cursor-pointer group">
                  <td className="px-4 py-4 text-cp-blue flex justify-start items-center flex-wrap gap-2 group-hover:underline">
                    <span>Educational CPRound #124</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-cp-red text-white uppercase font-bold tracking-wider rounded-sm">Div. 2</span>
                  </td>
                  <td className="px-4 py-4"><span className="text-cp-red font-bold">tourist</span></td>
                  <td className="px-4 py-4 text-cp-muted text-right">02:00:00</td>
                </tr>
                <tr className="cp-border-b hover:bg-cp-panel transition-colors duration-200 cursor-pointer group">
                  <td className="px-4 py-4 text-cp-blue flex justify-start items-center flex-wrap gap-2 group-hover:underline">
                    <span>CPTrack Global Round 40</span>
                    <span className="text-[10px] px-1.5 py-0.5 cp-border bg-cp-bg text-cp-text uppercase font-bold tracking-wider rounded-sm">Div. 1</span>
                  </td>
                  <td className="px-4 py-4"><span className="text-cp-red font-bold">Radewoosh</span></td>
                  <td className="px-4 py-4 text-cp-muted text-right">02:30:00</td>
                </tr>
                <tr className="hover:bg-cp-panel transition-colors duration-200 cursor-pointer group">
                  <td className="px-4 py-4 text-cp-blue flex justify-start items-center flex-wrap gap-2 group-hover:underline">
                    <span>Standard Div. 3 #780</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-cp-green text-cp-bg uppercase font-bold tracking-wider rounded-sm">Div. 3</span>
                  </td>
                  <td className="px-4 py-4"><span className="text-cp-blue font-bold">MikeMirzayanov</span></td>
                  <td className="px-4 py-4 text-cp-muted text-right">02:15:00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="cp-border bg-cp-bg text-sm">
          <div className="cp-border-b bg-cp-panel px-4 py-3 font-bold text-cp-text">
            → Pay attention
          </div>
          <div className="p-4 font-mono text-xs flex flex-col gap-3 text-cp-text leading-relaxed border-l-[3px] border-l-cp-red ml-4 pl-3 my-4 bg-cp-panel/30 py-3">
            <p>Welcome to the newly redesigned CPTrack platform. We embrace an OLED-optimized, high-contrast environment.</p>
            <p className="text-cp-red font-bold">Beta testing is live.</p>
          </div>
        </div>

        <div className="cp-border bg-cp-bg text-sm">
          <div className="cp-border-b bg-cp-panel px-4 py-3 font-bold text-cp-text flex justify-between">
            <span>→ Top rated</span>
          </div>
          <table className="w-full font-mono text-xs text-left">
            <tbody>
              <tr className="cp-border-b hover:bg-cp-panel transition-colors duration-200 cursor-pointer">
                <td className="px-4 py-3 w-8 text-cp-muted">1</td>
                <td className="px-4 py-3 font-bold text-cp-red hover:underline">tourist</td>
                <td className="px-4 py-3 text-right text-cp-text">3821</td>
              </tr>
              <tr className="cp-border-b hover:bg-cp-panel transition-colors duration-200 cursor-pointer">
                <td className="px-4 py-3 w-8 text-cp-muted">2</td>
                <td className="px-4 py-3 font-bold text-cp-red hover:underline">Benq</td>
                <td className="px-4 py-3 text-right text-cp-text">3799</td>
              </tr>
              <tr className="cp-border-b hover:bg-cp-panel transition-colors duration-200 cursor-pointer">
                <td className="px-4 py-3 w-8 text-cp-muted">3</td>
                <td className="px-4 py-3 font-bold text-cp-red hover:underline">Radewoosh</td>
                <td className="px-4 py-3 text-right text-cp-text">3642</td>
              </tr>
              <tr className="cp-border-b hover:bg-cp-panel transition-colors duration-200 cursor-pointer">
                <td className="px-4 py-3 w-8 text-cp-muted">4</td>
                <td className="px-4 py-3 font-bold text-cp-yellow hover:underline">Maroonrk</td>
                <td className="px-4 py-3 text-right text-cp-text">3301</td>
              </tr>
              <tr className="hover:bg-cp-panel transition-colors duration-200 cursor-pointer">
                <td className="px-4 py-3 w-8 text-cp-muted">5</td>
                <td className="px-4 py-3 font-bold text-cp-violet hover:underline">jiangly</td>
                <td className="px-4 py-3 text-right text-cp-text">2998</td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs font-mono text-cp-blue cp-border-t bg-cp-panel/50 cursor-pointer hover:bg-cp-panel hover:text-cp-active text-center transition-colors duration-200">
            View full rating history
          </div>
        </div>
      </div>
    </div>
  );
}
