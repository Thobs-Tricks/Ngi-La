import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { GhostButton, PageHead, Panel, SolidButton, Thumb } from "@/components/admin/ui";
import { verificationQueue } from "@/data/ngila";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Verification queue — Ngila Console" },
      { name: "description", content: "Review vendor claims, photos, ID and location checks." },
      { property: "og:title", content: "Verification queue — Ngila Console" },
      { property: "og:description", content: "Review vendor claims, photos, ID and location checks." },
    ],
  }),
  component: Verification,
});

type Decision = "Approved" | "Rejected" | "Info requested";

function Verification() {
  const [selected, setSelected] = useState(verificationQueue[0].id);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const item = verificationQueue.find((q) => q.id === selected)!;
  const decide = (d: Decision) => {
    setDecisions((p) => ({ ...p, [item.id]: d }));
    const next = verificationQueue.find((q) => q.id !== item.id && !decisions[q.id]);
    if (next) setSelected(next.id);
  };
  const open = verificationQueue.filter((q) => !decisions[q.id]).length;

  return (
    <AdminShell>
      <PageHead kicker={`${open} awaiting review`} title="Verification queue" />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Panel className="p-2" delay={100}>
          {verificationQueue.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelected(q.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-3 text-left transition",
                q.id === selected ? "bg-ink/5 ring-1 ring-line" : "hover:bg-ink/5",
              )}
            >
              <Thumb src={q.image} alt={q.name} className="size-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{q.name}</p>
                <p className="font-mono text-[11px] text-mute">{q.category} · {q.age}</p>
              </div>
              {decisions[q.id] ? (
                <span className={cn("font-mono text-[10px]", decisions[q.id] === "Approved" ? "text-moss" : decisions[q.id] === "Rejected" ? "text-clay" : "text-amber")}>
                  {decisions[q.id]}
                </span>
              ) : (
                <span className="size-2 animate-pulse-soft rounded-full bg-ember" />
              )}
            </button>
          ))}
        </Panel>

        <Panel key={item.id} className="overflow-hidden" delay={150}>
          <img src={item.image} alt={item.name} className="h-64 w-full object-cover" width={816} height={816} />
          <div className="space-y-5 p-6">
            <div>
              <p className="label-mono">{item.category} · added by {item.addedBy}</p>
              <h2 className="mt-1 font-display text-[26px] font-bold">{item.name}</h2>
              <p className="text-[13px] text-mute">{item.area}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.checks.map((c) => (
                <span key={c.label} className={cn("rounded-full px-3 py-1 font-mono text-[11px]", c.ok ? "bg-moss/15 text-moss" : "bg-clay/15 text-clay")}>
                  {c.ok ? "✓" : "!"} {c.label}
                </span>
              ))}
            </div>
            <div className="rounded-lg bg-paper/70 p-4 ring-1 ring-line">
              <p className="label-mono">Claimant</p>
              <p className="mt-1 text-[14px] font-medium">{item.claimant}</p>
              <p className="mt-2 text-[13px] text-ink/80">{item.note}</p>
            </div>
            {decisions[item.id] ? (
              <p className="animate-stamp inline-block rotate-[-3deg] rounded-md border-2 border-moss px-4 py-2 font-display text-lg font-bold uppercase text-moss">
                {decisions[item.id]}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <SolidButton onClick={() => decide("Approved")}>Approve & verify</SolidButton>
                <GhostButton onClick={() => decide("Info requested")}>Request info</GhostButton>
                <GhostButton onClick={() => decide("Rejected")} className="text-clay">Reject</GhostButton>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
