import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { resetPassword } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search["email"] === "string" ? (search["email"] as string) : "",
    token: typeof search["token"] === "string" ? (search["token"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Reset your password — Ngila" },
      { name: "description", content: "Choose a new password for your Ngila account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { email, token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !token) {
      setError("This reset link is missing some information. Please use the link from your email exactly as sent.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email, token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "This link may have expired or already been used.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: "#F9F6EF", color: "#263D32" }}
      className="flex min-h-screen items-center justify-center px-4 font-sans"
    >
      <div
        style={{ backgroundColor: "#FFFEF9", borderColor: "#E6DFD1" }}
        className="w-full max-w-md rounded-2xl border p-8 text-center shadow-sm"
      >
        <img src="/ngila-logo.png" alt="Ngila" className="mx-auto h-20 w-20" />
        <p style={{ color: "#5A9B7A" }} className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
          Discover your local economy
        </p>

        {success ? (
          <>
            <div
              style={{ backgroundColor: "#5A9B7A" }}
              className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white"
            >
              ✓
            </div>
            <h1 className="mt-4 text-xl font-bold">Password updated</h1>
            <p style={{ color: "#747968" }} className="mt-2 text-sm">
              You can now log in with your new password.
            </p>
            <Link
              to="/login"
              style={{ backgroundColor: "#C86F3F", color: "#FBF8F0" }}
              className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
            >
              Go to console login
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-xl font-bold">Choose a new password</h1>
            <p style={{ color: "#747968" }} className="mt-2 text-sm">for {email || "your account"}</p>

            <form className="mt-6 space-y-3 text-left" onSubmit={onSubmit}>
              {error ? (
                <p style={{ backgroundColor: "#D9573F1A", color: "#D9573F" }} className="rounded-lg px-3 py-2 text-[13px]">
                  {error}
                </p>
              ) : null}
              <input
                type="password"
                required
                minLength={8}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderColor: "#E6DFD1" }}
                className="w-full rounded-xl border bg-white px-3.5 py-3 text-[14px] outline-none focus:ring-2"
              />
              <input
                type="password"
                required
                minLength={8}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ borderColor: "#E6DFD1" }}
                className="w-full rounded-xl border bg-white px-3.5 py-3 text-[14px] outline-none focus:ring-2"
              />
              <button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: "#C86F3F", color: "#FBF8F0" }}
                className="w-full rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save new password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
