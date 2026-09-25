import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel, SolidButton } from "@/components/admin/ui";
import { categories } from "@/data/ngila";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Ngila Console" },
      { name: "description", content: "Manage the vendor categories shown across Ngila." },
      { property: "og:title", content: "Categories — Ngila Console" },
      { property: "og:description", content: "Manage the vendor categories shown across Ngila." },
    ],
  }),
  component: Categories,
});

const tone = {
  ember: "bg-ember/15 text-ember",
  moss: "bg-moss/15 text-moss",
  ink: "bg-ink/10 text-ink",
  amber: "bg-amber/15 text-amber",
  clay: "bg-clay/15 text-clay",
};
const bar = { ember: "bg-ember", moss: "bg-moss", ink: "bg-ink", amber: "bg-amber", clay: "bg-clay" };

function Categories() {
  const max = Math.max(...categories.map((c) => c.count));
  return (
    <AdminShell>
      <PageHead kicker={`${categories.length} active categories`} title="Categories" actions={<SolidButton>+ New category</SolidButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((c, i) => (
          <Panel key={c.name} className="p-5 transition hover:-translate-y-0.5" delay={80 + i * 40}>
            <div className={cn("grid size-11 place-items-center rounded-xl font-display text-lg font-bold", tone[c.tone])}>{c.key}</div>
            <p className="mt-4 font-display text-[16px] font-semibold">{c.name}</p>
            <p className="font-mono text-[11px] text-mute">{c.count} vendors</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/5">
              <div className={cn("h-full rounded-full", bar[c.tone])} style={{ width: `${(c.count / max) * 100}%` }} />
            </div>
          </Panel>
        ))}
      </div>
    </AdminShell>
  );
}
