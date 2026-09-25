import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel, PanelHead, StatCard, StatusPill, Thumb, SolidButton } from "@/components/admin/ui";
import { activity, stats, vendors, verificationQueue, weeklyAdds } from "@/data/ngila";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Ngila Console" },
      { name: "description", content: "Live pulse of Ngila vendors, verifications, reports and users." },
      { property: "og:title", content: "Overview — Ngila Console" },
      { property: "og:description", content: "Live pulse of Ngila vendors, verifications, reports and users." },
    ],
  }),
  component: Overview,
});

const dot = { ember: "bg-ember", moss: "bg-moss", clay: "bg-clay", amber: "bg-amber", ink: "bg-ink" };

function Overview() {
  const max = Math.max(...weeklyAdds.map((d) => d.value));
  return (
    <AdminShell>
      <PageHead
        kicker="Friday · 25 Sep 2026"
        title="Good afternoon, Thabo."
        actions={
          <Link to="/verification">
            <SolidButton>Open queue · {verificationQueue.length}</SolidButton>
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={100 + i * 50} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2 p-5" delay={250}>
          <PanelHead title="Listings added" kicker="Last 7 days · 408 total" />
          <div className="flex h-48 items-end gap-3 pt-4">
            {weeklyAdds.map((d, i) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[10px] text-mute">{d.value}</span>
                <div
                  className={cn("w-full rounded-t-md animate-rise", d.value === max ? "bg-ember" : "bg-ink/80")}
                  style={{ height: `${(d.value / max) * 140}px`, animationDelay: `${300 + i * 40}ms` }}
                />
                <span className="label-mono">{d.day}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-5" delay={300}>
          <PanelHead title="Activity" kicker="Across all regions" />
          <ul className="space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dot[a.tone])} />
                <div className="text-[13px] leading-snug">
                  <span className="font-medium">{a.who}</span> {a.what}
                  <p className="font-mono text-[10px] text-mute">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="p-5" delay={350}>
        <PanelHead
          title="Recently updated vendors"
          right={<Link to="/vendors" className="text-[13px] text-ember hover:underline">View all →</Link>}
        />
        <div className="divide-y divide-line">
          {vendors.slice(0, 5).map((v) => (
            <div key={v.id} className="flex items-center gap-4 py-3">
              <Thumb src={v.image} alt={v.name} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{v.name}</p>
                <p className="truncate font-mono text-[11px] text-mute">{v.category} · {v.area}</p>
              </div>
              <span className="hidden font-mono text-[12px] sm:block">★ {v.rating}</span>
              <StatusPill status={v.status} />
            </div>
          ))}
        </div>
      </Panel>
    </AdminShell>
  );
}
