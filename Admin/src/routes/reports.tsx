import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { GhostButton, PageHead, Panel } from "@/components/admin/ui";
import { fetchReports, resolveReport } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Ngila Console" },
      { name: "description", content: "Handle flagged listings, disputed reviews and duplicates." },
      { property: "og:title", content: "Reports — Ngila Console" },
      { property: "og:description", content: "Handle flagged listings, disputed reviews and duplicates." },
    ],
  }),
  component: Reports,
});

const kindDot: Record<string, string> = { Flag: "bg-clay", ReviewDispute: "bg-amber" };

function Reports() {
  const { status } = useAuth();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: fetchReports,
    enabled: status === "authenticated",
  });

  const resolveMutation = useMutation({
    mutationFn: resolveReport,
    onSuccess: () => {
      toast.success("Report resolved.");
      void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't resolve report."),
  });

  const list = reports ?? [];
  const open = list.filter((r) => !r.isResolved);
  const columns = [
    { kind: "Flag", title: "Flagged listings" },
    { kind: "ReviewDispute", title: "Review disputes" },
    { kind: "Resolved", title: "Resolved" },
  ];
  const kindOf = (r: (typeof list)[number]) => (r.isResolved ? "Resolved" : r.kind);

  return (
    <AdminShell>
      <PageHead kicker={`${open.length} open`} title="Reports" />
      <div className="grid gap-5 lg:grid-cols-3">
        {columns.map((col, ci) => (
          <div key={col.kind} className="space-y-3">
            <p className="label-mono flex items-center gap-2 px-1">
              <span className={cn("size-2 rounded-full", col.kind === "Resolved" ? "bg-moss" : kindDot[col.kind])} /> {col.title}
            </p>
            {list.filter((r) => kindOf(r) === col.kind).map((r, i) => (
              <Panel key={r.id} className="p-4" delay={100 + ci * 60 + i * 40}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-medium leading-snug">{r.title}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]", r.priority === "High" && !r.isResolved ? "bg-clay/15 text-clay" : "bg-ink/5 text-mute")}>
                    {r.isResolved ? "Done" : r.priority}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-mute">{r.detail}</p>
                <p className="mt-1 font-mono text-[10px] text-mute">{r.time}</p>
                {!r.isResolved ? (
                  <GhostButton
                    className="mt-3 text-[12px]"
                    disabled={resolveMutation.isPending}
                    onClick={() => resolveMutation.mutate(r.id)}
                  >
                    Mark resolved
                  </GhostButton>
                ) : null}
              </Panel>
            ))}
            {list.filter((r) => kindOf(r) === col.kind).length === 0 && !isLoading ? (
              <p className="px-1 text-[12px] text-mute">Nothing here.</p>
            ) : null}
          </div>
        ))}
      </div>
      {isLoading ? <p className="text-mute">Loading…</p> : null}
    </AdminShell>
  );
}
