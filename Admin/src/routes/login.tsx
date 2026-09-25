import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Ngila Console" },
      { name: "description", content: "Secure access to the Ngila admin console." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 text-ink">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-ember/15 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full bg-moss/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-amber/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-line bg-surface/80 shadow-[0_30px_100px_rgba(26,23,18,0.10)] backdrop-blur-xl">
        <div className="grid min-h-[720px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden overflow-hidden border-r border-line bg-ink p-8 text-paper lg:flex lg:flex-col lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-paper font-display text-base font-bold text-ink">
                N
              </div>
              <div>
                <div className="font-display text-[20px] font-bold tracking-[0.12em]">NGILA</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/70">
                  Console
                </div>
              </div>
            </div>

            <div className="max-w-md">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper/60">
                On-chain verification
              </p>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-paper">
                Keep vendor claims and local listings trusted.
              </h1>
              <p className="mt-5 text-base leading-7 text-paper/75">
                Track reports, review verification queues, and inspect contributor activity from one
                command center.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-paper/10 bg-paper/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-paper/75">
                <span className="font-mono uppercase tracking-[0.2em]">Live network</span>
                <span className="rounded-full bg-moss/20 px-2 py-1 font-mono text-[10px] text-moss">
                  Healthy
                </span>
              </div>
              <div className="grid gap-2">
                <div className="flex items-end justify-between">
                  <span className="font-display text-3xl font-bold">28.4k</span>
                  <span className="font-mono text-[11px] text-paper/60">vendors</span>
                </div>
                <div className="h-2 rounded-full bg-paper/10">
                  <div className="h-full w-[72%] rounded-full bg-ember" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-paper/80 p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-mute">
                    Welcome back
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Log in</h2>
                </div>
                <Link
                  to="/register"
                  className="rounded-lg border border-line bg-surface px-2.5 py-2 text-[12px] font-medium text-ink transition hover:bg-surface/80"
                >
                  Register
                </Link>
              </div>

              <form className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    defaultValue="thabo@ngila.app"
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                      Password
                    </label>
                    <button type="button" className="text-[12px] font-medium text-ember hover:underline">
                      Forgot?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    defaultValue="••••••••"
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  />
                </div>

                <label className="flex items-center gap-2 text-[13px] text-ink/75">
                  <input type="checkbox" className="h-4 w-4 rounded border-line bg-surface text-ember focus:ring-ember/25" defaultChecked />
                  Keep me signed in
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-ink px-4 py-3 text-[14px] font-semibold text-paper transition hover:bg-ink/90"
                >
                  Sign in
                </button>
              </form>

              <div className="mt-7 flex items-center gap-3 text-[12px] text-mute">
                <div className="h-px flex-1 bg-line" />
                <span className="font-mono uppercase tracking-[0.22em]">or</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <div className="mt-7 grid gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-[13px] font-medium text-ink transition hover:bg-surface/80"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-ember/15 font-display text-[10px] text-ember">
                    G
                  </span>
                  Continue with Google
                </button>
                <Link
                  to="/register"
                  className="text-center text-[13px] text-mute hover:text-ink"
                >
                  Need an account? <span className="font-medium text-ember">Create one</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
