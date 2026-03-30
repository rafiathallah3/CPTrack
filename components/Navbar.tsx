import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="fixed top-0 w-full z-50 bg-cp-bg/95 backdrop-blur-sm cp-border-b px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2 text-cp-text hover:text-cp-blue transition-colors duration-200 cp-focus cp-focus:focus-visible rounded-md p-1 -ml-1">
        <div className="w-8 h-8 bg-cp-text flex items-center justify-center font-bold text-cp-bg text-sm rounded-[2px]">
          CP
        </div>
        <span className="font-mono font-bold tracking-tighter hidden sm:block">Track</span>
      </Link>
      
      <div className="hidden md:flex gap-6 items-center font-mono text-sm ml-8 text-cp-text/80">
        <Link href="/contests" className="hover:text-cp-blue transition-colors duration-200 font-semibold cp-focus rounded-md p-1">Contests</Link>
        <Link href="/problems" className="hover:text-cp-blue transition-colors duration-200 font-semibold cp-focus rounded-md p-1">Problems</Link>
        <Link href="/community/blog" className="hover:text-cp-blue transition-colors duration-200 font-semibold cp-focus rounded-md p-1">Blog</Link>
      </div>


      <div className="flex gap-4 items-center font-mono text-sm max-w-[200px] xs:max-w-none ml-auto">
        {user ? (
          <Link
            href="/dashboard"
            className="px-3 py-1.5 cp-border bg-cp-panel hover:bg-cp-border hover:text-white transition-colors duration-200 text-cp-text font-semibold cp-focus cp-focus:focus-visible rounded-md"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-3 py-1.5 hover:text-cp-blue transition-colors duration-200 text-cp-text font-semibold cp-focus cp-focus:focus-visible rounded-md"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 cp-border bg-cp-text text-cp-bg hover:bg-cp-muted transition-colors duration-200 font-bold cp-focus cp-focus:focus-visible rounded-md"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
