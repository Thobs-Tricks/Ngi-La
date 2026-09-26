import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel, PanelHead } from "@/components/admin/ui";
import { fetchAdminUsers, register as registerRequest } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/admins")({
  head: () => ({
    meta: [
      { title: "Admins — Ngila Console" },
      { name: "description", content: "Manage who has console access. New admin accounts can only be created by an existing admin." },
    ],
  }),
  component: Admins,
});

function Admins() {
  const { status } = useAuth();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    enabled: status === "authenticated",
  });

  const admins = (users ?? []).filter((u) => u.role === "Admin");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createMutation = useMutation({
    mutationFn: () => registerRequest({ userType: "Admin", firstName, lastName, email, password }),
    onSuccess: () => {
      toast.success(`${firstName} ${lastName} can now log in with the password you set.`);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't create the account."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <AdminShell>
      <PageHead kicker={`${admins.length} admins`} title="Admins" />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel className="overflow-x-auto p-2" delay={100}>
          <table className="w-full min-w-[480px] text-left text-[13px]">
            <thead>
              <tr className="label-mono">
                <th className="p-3 font-normal">Admin</th>
                <th className="p-3 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-ink/[0.03]">
                  <td className="p-3"><p className="font-medium">{a.name}</p><p className="font-mono text-[11px] text-mute">{a.email}</p></td>
                  <td className="p-3 font-mono text-mute">{a.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? <p className="p-8 text-center text-mute">Loading…</p> : null}
          {!isLoading && admins.length === 0 ? <p className="p-8 text-center text-mute">No admins yet.</p> : null}
        </Panel>

        <Panel className="p-6" delay={150}>
          <PanelHead title="Add an admin" kicker="Only existing admins can do this" />
          <form className="space-y-4" onSubmit={onSubmit}>
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
              disabled={createMutation.isPending}
              className="w-full rounded-xl bg-ink px-4 py-3 text-[14px] font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-60"
            >
              {createMutation.isPending ? "Creating…" : "Create admin account"}
            </button>
          </form>
        </Panel>
      </div>
    </AdminShell>
  );
}
