import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Ngila Console" },
      { name: "description", content: "Create a new Ngila admin account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 text-ink">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/3 h-[420px] w-[420px] rounded-full bg-ember/15 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-[420px] w-[420px] rounded-full bg-moss/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-amber/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-line bg-surface/80 shadow-[0_30px_100px_rgba(26,23,18,0.10)] backdrop-blur-xl">
        <div className="grid min-h-[760px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center justify-center bg-paper/80 p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-mute">
                    Get started
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Register</h2>
                </div>
                <Link
                  to="/login"
                  className="rounded-lg border border-line bg-surface px-2.5 py-2 text-[12px] font-medium text-ink transition hover:bg-surface/80"
                >
                  Log in
                </Link>
              </div>

              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      defaultValue="Thabo"
                      className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      defaultValue="Mokoena"
                      className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    defaultValue="thabo@ngila.app"
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                    Role
                  </label>
                  <select
                    id="role"
                    defaultValue="admin"
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  >
                    <option value="admin">Operations admin</option>
                    <option value="reviewer">Verification reviewer</option>
                    <option value="community">Community manager</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    defaultValue="••••••••"
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  />
                </div>

                <label className="flex items-center gap-2 text-[13px] text-ink/75">
                  <input type="checkbox" className="h-4 w-4 rounded border-line bg-surface text-ember focus:ring-ember/25" defaultChecked />
                  Send me the weekly digest
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-ink px-4 py-3 text-[14px] font-semibold text-paper transition hover:bg-ink/90"
                >
                  Create account
                </button>
              </form>

              <div className="mt-7 flex items-center gap-3 text-[12px] text-mute">
                <div className="h-px flex-1 bg-line" />
                <span className="font-mono uppercase tracking-[0.22em]">or</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <div className="mt-7">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-[13px] font-medium text-ink transition hover:bg-surface/80"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-ember/15 font-display text-[10px] text-ember">
                    G
                  </span>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden overflow-hidden border-l border-line bg-ink p-8 text-paper lg:flex lg:flex-col lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-paper font-display text-base font-bold text-ink">
                N
              </div>
              <div>
                <div className="font-display text-[20px] font-bold tracking-[0.12em]">NGILA</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/70">
                  Network
                </div>
              </div>
            </div>

            <div className="max-w-md">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper/60">
                Trusted operations
              </p>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-paper">
                Build a stronger local market with verified data.
              </h1>
              <p className="mt-5 text-base leading-7 text-paper/75">
                Review claims faster, surface suspicious listings, and keep every contributor aligned
                with the brand and rules.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-paper/10 bg-paper/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-paper/75">
                <span className="font-mono uppercase tracking-[0.2em]">Priority queue</span>
                <span className="font-mono text-[10px] text-amber">12 alerts</span>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between rounded-xl bg-paper/5 px-3 py-2 text-[13px]">
                  <span>Verification review</span>
                  <span className="font-mono text-paper/70">14</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-paper/5 px-3 py-2 text-[13px]">
                  <span>Vendor claims</span>
                  <span className="font-mono text-paper/70">21</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
