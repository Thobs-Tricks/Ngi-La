import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { GhostButton, PageHead, Panel, StatusPill, Thumb } from "@/components/admin/ui";
import { fallbackVendorImage } from "@/data/ngila";
import { fetchAdminVendors, suspendVendor, unsuspendVendor } from "@/lib/endpoints";
import type { VendorAdminStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Claims & vendors — Ngila Console" },
      { name: "description", content: "Browse, filter and manage every vendor listing on Ngila." },
      { property: "og:title", content: "Claims & vendors — Ngila Console" },
      { property: "og:description", content: "Browse, filter and manage every vendor listing on Ngila." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"] } : {},
  component: Vendors,
});

const filters: ("All" | VendorAdminStatus)[] = ["All", "Verified", "Pending", "CommunityAdded", "Suspended"];
const filterLabel: Record<(typeof filters)[number], string> = {
  All: "All",
  Verified: "Verified",
  Pending: "Pending",
  CommunityAdded: "Community added",
  Suspended: "Suspended",
};

function Vendors() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const { q: initialQ } = Route.useSearch();
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState(initialQ ?? "");

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: fetchAdminVendors,
    enabled: status === "authenticated",
  });

  const onError = (err: unknown) => toast.error(err instanceof ApiError ? err.message : "That didn't work.");
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });

  const suspendMutation = useMutation({
    mutationFn: suspendVendor,
    onSuccess: () => { toast.success("Vendor suspended."); invalidate(); },
    onError,
  });
  const unsuspendMutation = useMutation({
    mutationFn: unsuspendVendor,
    onSuccess: () => { toast.success("Vendor reinstated."); invalidate(); },
    onError,
  });

  const list = (vendors ?? []).filter(
    (v) => (f === "All" || v.status === f) && (v.name + v.location + v.category).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AdminShell>
      <PageHead kicker={`${vendors?.length ?? 0} listings`} title="Claims & vendors" />
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium transition", f === x ? "bg-ink text-paper" : "bg-surface/70 text-mute ring-1 ring-line hover:text-ink")}
          >
            {filterLabel[x]}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name or area…"
          className="ml-auto rounded-lg bg-surface/70 px-3 py-2 text-[13px] ring-1 ring-line outline-none placeholder:text-mute focus:ring-ember/40"
        />
      </div>
      <Panel className="overflow-x-auto p-2" delay={100}>
        <table className="w-full min-w-[820px] text-left text-[13px]">
          <thead>
            <tr className="label-mono">
              <th className="p-3 font-normal">Vendor</th>
              <th className="p-3 font-normal">Category</th>
              <th className="p-3 font-normal">Rating</th>
              <th className="p-3 font-normal">Added by</th>
              <th className="p-3 font-normal">Updated</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((v) => (
              <tr key={v.id} className="transition hover:bg-ink/[0.03]">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Thumb src={v.image ?? fallbackVendorImage} alt={v.name} className="size-10" />
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="font-mono text-[11px] text-mute">{v.location}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{v.category}</td>
                <td className="p-3 font-mono">★ {v.rating.toFixed(1)} <span className="text-mute">({v.reviewsCount})</span></td>
                <td className="p-3 font-mono text-mute">{v.addedBy ?? "—"}</td>
                <td className="p-3 font-mono text-mute">{v.updated}</td>
                <td className="p-3"><StatusPill status={v.status} /></td>
                <td className="p-3">
                  {v.status === "Verified" ? (
                    <GhostButton
                      className="text-clay"
                      disabled={suspendMutation.isPending}
                      onClick={() => suspendMutation.mutate(v.id)}
                    >
                      Suspend
                    </GhostButton>
                  ) : v.status === "Suspended" ? (
                    <GhostButton
                      disabled={unsuspendMutation.isPending}
                      onClick={() => unsuspendMutation.mutate(v.id)}
                    >
                      Reinstate
                    </GhostButton>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? <p className="p-8 text-center text-mute">Loading…</p> : null}
        {!isLoading && list.length === 0 ? <p className="p-8 text-center text-mute">No vendors match.</p> : null}
      </Panel>
    </AdminShell>
  );
}
