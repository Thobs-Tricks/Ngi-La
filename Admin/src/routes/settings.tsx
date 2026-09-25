import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel } from "@/components/admin/ui";
import { fetchEmailSettings, updateEmailSettings } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Ngila Console" },
      { name: "description", content: "Configure the email address Ngila sends confirmation and reset emails from." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const [senderEmail, setSenderEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["email-settings"],
    queryFn: fetchEmailSettings,
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (settings?.senderEmail) setSenderEmail(settings.senderEmail);
  }, [settings?.senderEmail]);

  const saveMutation = useMutation({
    mutationFn: () => updateEmailSettings(senderEmail, appPassword),
    onSuccess: () => {
      toast.success("Email settings saved.");
      setAppPassword("");
      void queryClient.invalidateQueries({ queryKey: ["email-settings"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't save email settings."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <AdminShell>
      <PageHead kicker="Console" title="Settings" />

      <Panel className="max-w-xl p-6" delay={80}>
        <h2 className="font-display text-[17px] font-semibold">Outgoing email</h2>
        <p className="mt-1 text-[13px] text-mute">
          Ngila sends account-confirmation and password-reset emails through this Gmail address.
          Use a{" "}
          <a
            href="https://support.google.com/accounts/answer/185833"
            target="_blank"
            rel="noreferrer"
            className="text-ember hover:underline"
          >
            Gmail app password
          </a>
          , not your normal account password.
        </p>

        {isLoading ? (
          <p className="mt-6 text-mute">Loading…</p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {settings?.isConfigured ? (
              <p className="rounded-lg bg-moss/10 px-3 py-2 text-[13px] text-moss">
                Configured{settings.updatedAt ? ` · last updated ${new Date(settings.updatedAt).toLocaleString()}` : ""}
              </p>
            ) : (
              <p className="rounded-lg bg-amber/10 px-3 py-2 text-[13px] text-amber">
                Not configured yet — confirmation/reset links are only logged on the server, not emailed.
              </p>
            )}

            <div className="space-y-2">
              <label htmlFor="senderEmail" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                Sender email
              </label>
              <input
                id="senderEmail"
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="notifications@ngila.app"
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="appPassword" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                App password
              </label>
              <input
                id="appPassword"
                type="password"
                required
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder={settings?.isConfigured ? "•••••••••••••• (unchanged)" : "16-character app password"}
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
              />
            </div>

            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-xl bg-ink px-4 py-3 text-[14px] font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-60"
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </button>
          </form>
        )}
      </Panel>
    </AdminShell>
  );
}
