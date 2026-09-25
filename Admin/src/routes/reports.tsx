import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { GhostButton, PageHead, Panel } from "@/components/admin/ui";
import { reports } from "@/data/ngila";
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

function Reports() {
  const [resolved, setResolved] = useState<string[]>([]);
  const columns = [
    { kind: "Flag", title: "Flagged listings", tone: "bg-clay" },
    { kind: "Review", title: "Review disputes", tone: "bg-amber" },
    { kind: "Resolved", title: "Resolved", tone: "bg-moss" },
  ];
  const kindOf = (r: (typeof reports)[number]) => (resolved.includes(r.id) ? "Resolved" : r.kind);
  return (
    <AdminShell>
      <PageHead kicker={`${reports.filter((r) => kindOf(r) !== "Resolved").length} open`} title="Reports" />
      <div className="grid gap-5 lg:grid-cols-3">
        {columns.map((col, ci) => (
          <div key={col.kind} className="space-y-3">
            <p className="label-mono flex items-center gap-2 px-1">
              <span className={cn("size-2 rounded-full", col.tone)} /> {col.title}
            </p>
            {reports.filter((r) => kindOf(r) === col.kind).map((r, i) => (
              <Panel key={r.id} className="p-4" delay={100 + ci * 60 + i * 40}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-medium leading-snug">{r.title}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]", r.priority === "High" && !resolved.includes(r.id) ? "bg-clay/15 text-clay" : "bg-ink/5 text-mute")}>
                    {resolved.includes(r.id) ? "Done" : r.priority}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-mute">{r.detail}</p>
                {col.kind !== "Resolved" ? (
                  <GhostButton className="mt-3 text-[12px]" onClick={() => setResolved((p) => [...p, r.id])}>Mark resolved</GhostButton>
                ) : null}
              </Panel>
            ))}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
