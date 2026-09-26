import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { fetchPlatformStats } from "@/lib/endpoints";

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
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Public endpoint - no session exists yet on this screen.
  const { data: stats } = useQuery({ queryKey: ["platform-stats"], queryFn: fetchPlatformStats });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't log in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
              <img
                src="/ngila-logo.png"
                alt="Ngila logo"
                className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-white/15"
              />
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
                Review verification queues and inspect contributor activity from one command
                center.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-paper/10 bg-paper/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-paper/75">
                <span className="font-mono uppercase tracking-[0.2em]">Live network</span>
                <span className="rounded-full bg-moss/20 px-2 py-1 font-mono text-[10px] text-moss">
                  Healthy
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="font-display text-3xl font-bold">{stats ? stats.vendorsMapped.toLocaleString() : "—"}</span>
                  <span className="ml-2 font-mono text-[11px] text-paper/60">vendors</span>
                </div>
                <div>
                  <span className="font-display text-3xl font-bold">{stats ? stats.communityReviews.toLocaleString() : "—"}</span>
                  <span className="ml-2 font-mono text-[11px] text-paper/60">reviews</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-paper/80 p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-mute">
                  Welcome back
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Log in</h2>
              </div>

              <form className="space-y-5" onSubmit={onSubmit}>
                {error ? (
                  <p className="rounded-lg bg-clay/10 px-3 py-2 text-[13px] text-clay">{error}</p>
                ) : null}
                <div className="space-y-2">
                  <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                      Password
                    </label>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-ink px-4 py-3 text-[14px] font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-60"
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
