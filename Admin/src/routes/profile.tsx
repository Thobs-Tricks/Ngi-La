import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel, PanelHead } from "@/components/admin/ui";
import { changePassword } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Ngila Console" },
      { name: "description", content: "Your Ngila admin account details." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const initials = user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't change the password."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate();
  };

  return (
    <AdminShell>
      <PageHead kicker="Console" title="Profile" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel className="p-6" delay={80}>
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-ember/20 font-display text-base font-semibold text-ember">
              {initials}
            </div>
            <div>
              <p className="font-display text-[18px] font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="font-mono text-[11px] text-mute">{user?.role}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-4 text-[13px]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <dt className="text-mute">Email</dt>
              <dd className="font-medium">{user?.email}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <dt className="text-mute">Phone</dt>
              <dd className="font-medium">{user?.phoneNumber ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <dt className="text-mute">Gender</dt>
              <dd className="font-medium">{user?.gender ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <dt className="text-mute">Email confirmed</dt>
              <dd className={user?.emailConfirmed ? "text-moss font-medium" : "text-clay font-medium"}>
                {user?.emailConfirmed ? "Yes" : "No"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-mute">Member since</dt>
              <dd className="font-medium">{user ? new Date(user.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—"}</dd>
            </div>
          </dl>
        </Panel>

        <Panel className="p-6" delay={130}>
          <PanelHead title="Change password" />
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] text-ink outline-none transition placeholder:text-mute focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
              />
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full rounded-xl bg-ink px-4 py-3 text-[14px] font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-60"
            >
              {changePasswordMutation.isPending ? "Saving…" : "Change password"}
            </button>
          </form>
        </Panel>
      </div>
    </AdminShell>
  );
}
