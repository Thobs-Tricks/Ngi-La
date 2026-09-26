import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { confirmEmail } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search["userId"] === "string" ? (search["userId"] as string) : "",
    token: typeof search["token"] === "string" ? (search["token"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Confirm your email — Ngila" },
      { name: "description", content: "Confirming your Ngila account." },
    ],
  }),
  component: VerifyEmail,
});

type Status = "confirming" | "success" | "error";

function VerifyEmail() {
  const { userId, token } = Route.useSearch();
  const [status, setStatus] = useState<Status>("confirming");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId || !token) {
      setStatus("error");
      setMessage("This confirmation link is missing some information. Please use the link from your email exactly as sent.");
      return;
    }
    confirmEmail(userId, token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "This link may have expired or already been used.");
      });
  }, [userId, token]);

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

        {status === "confirming" ? (
          <>
            <h1 className="mt-5 text-xl font-bold">Confirming your email…</h1>
            <p style={{ color: "#747968" }} className="mt-2 text-sm">One moment.</p>
          </>
        ) : status === "success" ? (
          <>
            <div
              style={{ backgroundColor: "#5A9B7A" }}
              className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white"
            >
              ✓
            </div>
            <h1 className="mt-4 text-xl font-bold">You're all set!</h1>
            <p style={{ color: "#747968" }} className="mt-2 text-sm">
              Your email address is confirmed. You can now log in from the app.
            </p>
          </>
        ) : (
          <>
            <div
              style={{ backgroundColor: "#D9573F" }}
              className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white"
            >
              !
            </div>
            <h1 className="mt-4 text-xl font-bold">Couldn't confirm your email</h1>
            <p style={{ color: "#747968" }} className="mt-2 text-sm">{message}</p>
          </>
        )}

        <Link
          to="/login"
          style={{ backgroundColor: "#C86F3F", color: "#FBF8F0" }}
          className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
        >
          Go to console login
        </Link>
      </div>
    </div>
  );
}
