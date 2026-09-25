import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { register as registerRequest } from "@/lib/endpoints";

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
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-mute">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em]">Loading…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <GateMessage
        title="Sign in required"
        body="New admin accounts are created by an existing admin. Sign in first, then come back here."
      />
    );
  }

  return <RegisterForm />;
}

function GateMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 text-ink">
      <div className="w-full max-w-md rounded-[28px] border border-line bg-surface/80 p-8 text-center shadow-[0_30px_100px_rgba(26,23,18,0.10)]">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-[14px] text-mute">{body}</p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-ink px-4 py-3 text-[14px] font-semibold text-paper transition hover:bg-ink/90"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      // This console only ever creates Admin accounts, so userType is always "Admin" here.
      await registerRequest({
        userType: "Admin",
        firstName,
        lastName,
        email,
        password,
      });
      setSuccess(`${firstName} ${lastName} can now log in with the password you set.`);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the account. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

              <form className="space-y-4" onSubmit={onSubmit}>
                {error ? (
                  <p className="rounded-lg bg-clay/10 px-3 py-2 text-[13px] text-clay">{error}</p>
                ) : null}
                {success ? (
                  <p className="rounded-lg bg-moss/10 px-3 py-2 text-[13px] text-moss">{success}</p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
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
                  {submitting ? "Creating…" : "Create account"}
                </button>
              </form>
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
