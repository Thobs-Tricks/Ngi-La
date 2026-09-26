import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { GhostButton, PageHead, Panel } from "@/components/admin/ui";
import { fetchAdminUsers, suspendUser, unsuspendUser } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & contributors — Ngila Console" },
      { name: "description", content: "See Ngila's customers, vendors and admins and their contributions." },
      { property: "og:title", content: "Users & contributors — Ngila Console" },
      { property: "og:description", content: "See Ngila's customers, vendors and admins and their contributions." },
    ],
  }),
  component: Users,
});

const roleTone: Record<string, string> = {
  Customer: "bg-ink/10 text-ink",
  Vendor: "bg-amber/15 text-amber",
  Admin: "bg-moss/15 text-moss",
};

function Users() {
  const { status } = useAuth();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    enabled: status === "authenticated",
  });

  const onError = (err: unknown) => toast.error(err instanceof ApiError ? err.message : "That didn't work.");
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const suspendMutation = useMutation({
    mutationFn: suspendUser,
    onSuccess: () => { toast.success("Customer suspended."); invalidate(); },
    onError,
  });
  const unsuspendMutation = useMutation({
    mutationFn: unsuspendUser,
    onSuccess: () => { toast.success("Customer reinstated."); invalidate(); },
    onError,
  });

  const list = users ?? [];
  const top = [...list].sort((a, b) => b.vendorsAdded + b.reviewsWritten - (a.vendorsAdded + a.reviewsWritten)).slice(0, 3);

  return (
    <AdminShell>
      <PageHead kicker={`${list.length} members shown`} title="Users & contributors" />
      <div className="grid gap-4 md:grid-cols-3">
        {top.map((m, i) => (
          <Panel key={m.id} className="p-5" delay={80 + i * 50}>
            <p className="label-mono">#{i + 1} contributor</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full bg-ember/20 font-display font-semibold text-ember">
                {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="font-mono text-[11px] text-mute">{m.role}</p>
              </div>
            </div>
            <p className="mt-4 font-display text-[28px] font-bold leading-none">
              {m.vendorsAdded + m.reviewsWritten}
              <span className="ml-1 text-[12px] font-normal text-mute">contributions</span>
            </p>
          </Panel>
        ))}
      </div>
      <Panel className="overflow-x-auto p-2" delay={250}>
        <table className="w-full min-w-[680px] text-left text-[13px]">
          <thead>
            <tr className="label-mono">
              {["Member", "Role", "Vendors added", "Reviews", "Joined", "Status", "Actions"].map((h) => (
                <th key={h} className="p-3 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((m) => (
              <tr key={m.id} className="hover:bg-ink/[0.03]">
                <td className="p-3"><p className="font-medium">{m.name}</p><p className="font-mono text-[11px] text-mute">{m.email}</p></td>
                <td className="p-3"><span className={cn("rounded-full px-2 py-1 font-mono text-[11px]", roleTone[m.role] ?? "bg-ink/10 text-ink")}>{m.role}</span></td>
                <td className="p-3 font-mono">{m.vendorsAdded}</td>
                <td className="p-3 font-mono">{m.reviewsWritten}</td>
                <td className="p-3 font-mono text-mute">{m.joined}</td>
                <td className="p-3"><span className={cn("font-mono text-[11px]", m.isActive ? "text-moss" : "text-clay")}>● {m.isActive ? "Active" : "Suspended"}</span></td>
                <td className="p-3">
                  {m.role === "Customer" ? (
                    m.isActive ? (
                      <GhostButton
                        className="text-clay"
                        disabled={suspendMutation.isPending}
                        onClick={() => suspendMutation.mutate(m.id)}
                      >
                        Suspend
                      </GhostButton>
                    ) : (
                      <GhostButton
                        disabled={unsuspendMutation.isPending}
                        onClick={() => unsuspendMutation.mutate(m.id)}
                      >
                        Reinstate
                      </GhostButton>
                    )
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? <p className="p-8 text-center text-mute">Loading…</p> : null}
        {!isLoading && list.length === 0 ? <p className="p-8 text-center text-mute">No members yet.</p> : null}
      </Panel>
    </AdminShell>
  );
}
