import Link from "next/link";
import { signup, loginWithOAuth } from "@/app/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-cp-bg">
      <div className="w-full max-w-sm cp-border bg-cp-bg">
        <div className="cp-border-b bg-cp-panel px-4 py-3 font-bold text-cp-text font-sans text-lg">
          → Register
        </div>
        
        <div className="p-6">
          <p className="text-cp-muted font-mono text-sm mb-6">Join the global competitive programming database.</p>

          {error && (
            <div className="px-3 py-2 mb-6 font-mono text-sm text-white bg-red-900 border border-red-500 rounded-sm">
              Error: {error}
            </div>
          )}

          <form action={signup} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold font-mono text-cp-text mb-1" htmlFor="username">
                Handle / Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 bg-cp-bg cp-border focus:outline-none focus:ring-2 focus:ring-cp-active transition-all duration-200 font-mono text-sm text-cp-text placeholder:text-cp-border-hover rounded-sm"
                placeholder="tourist_fan"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-cp-text mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 bg-cp-bg cp-border focus:outline-none focus:ring-2 focus:ring-cp-active transition-all duration-200 font-mono text-sm text-cp-text placeholder:text-cp-border-hover rounded-sm"
                placeholder="coder@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-cp-text mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 bg-cp-bg cp-border focus:outline-none focus:ring-2 focus:ring-cp-active transition-all duration-200 font-mono text-sm text-cp-text placeholder:text-cp-border-hover rounded-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-cp-text hover:bg-cp-muted text-cp-bg font-bold font-mono text-sm transition-colors duration-200 cp-border cp-focus cp-focus:focus-visible rounded-sm"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 border-t border-cp-border"></div>
            <span className="text-cp-muted font-mono text-xs font-bold">OR</span>
            <div className="flex-1 border-t border-cp-border"></div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <form action={loginWithOAuth.bind(null, "google")}>
              <button className="w-full py-2 bg-cp-panel hover:bg-cp-border cp-border font-mono text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 text-cp-text cp-focus cp-focus:focus-visible rounded-sm">
                <svg className="w-4 h-4 text-cp-text" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>
            </form>
            
            <form action={loginWithOAuth.bind(null, "github")}>
              <button className="w-full py-2 bg-cp-panel hover:bg-cp-border cp-border font-mono text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 text-cp-text cp-focus cp-focus:focus-visible rounded-sm">
                <svg className="w-4 h-4 text-cp-text" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Sign up with GitHub
              </button>
            </form>
          </div>
        </div>
        
        <div className="cp-border-t bg-cp-panel/30 px-4 py-3 text-center text-xs font-mono text-cp-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-cp-active hover:underline font-bold transition-colors duration-200 cp-focus cp-focus:focus-visible rounded-sm">
            Login now
          </Link>
        </div>
      </div>
    </div>
  );
}
