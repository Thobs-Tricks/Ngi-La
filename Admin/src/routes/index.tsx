import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel, PanelHead, StatCard, StatusPill, Thumb, SolidButton } from "@/components/admin/ui";
import { fallbackVendorImage } from "@/data/ngila";
import { fetchActivity, fetchAdminVendors, fetchCategories, fetchStats } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Ngila Console" },
      { name: "description", content: "Live pulse of Ngila vendors, verifications and users." },
      { property: "og:title", content: "Overview — Ngila Console" },
      { property: "og:description", content: "Live pulse of Ngila vendors, verifications and users." },
    ],
  }),
  component: Overview,
});

const dot: Record<string, string> = {
  "vendor-added": "bg-ember",
  "vendor-verified": "bg-moss",
  "vendor-suspended": "bg-clay",
  "vendor-reinstated": "bg-moss",
  "claim-rejected": "bg-clay",
  "vendor-claimed": "bg-amber",
  default: "bg-ink",
};

function Overview() {
  const { status, user } = useAuth();
  const enabled = status === "authenticated";

  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats, enabled });
  const { data: activity } = useQuery({ queryKey: ["admin-activity"], queryFn: () => fetchActivity(8), enabled });
  const { data: vendors } = useQuery({ queryKey: ["admin-vendors"], queryFn: fetchAdminVendors, enabled });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, enabled });

  const statCards = stats
    ? [
        { label: "Total vendors", value: stats.totalVendors.toLocaleString(), note: "across the network", tone: "moss" as const },
        { label: "Pending verification", value: stats.pendingVerification.toLocaleString(), note: "awaiting review", tone: "ember" as const, alert: stats.pendingVerification > 0 },
        { label: "Active users", value: stats.activeUsers.toLocaleString(), note: "customers, vendors & admins", tone: "moss" as const },
      ]
    : [];

  const sortedCategories = [...(categories ?? [])].sort((a, b) => b.vendorCount - a.vendorCount).slice(0, 7);
  const max = Math.max(1, ...sortedCategories.map((c) => c.vendorCount));
  const recentVendors = (vendors ?? []).slice(0, 5);

  return (
    <AdminShell>
      <PageHead
        kicker={new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
        title={`Good to see you, ${user?.firstName ?? ""}.`}
        actions={
          <Link to="/verification">
            <SolidButton>Open queue · {stats?.pendingVerification ?? 0}</SolidButton>
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {statCards.map((s, i) => (
          <StatCard key={s.label} {...s} delay={100 + i * 50} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2 p-5" delay={250}>
          <PanelHead title="Vendors by category" kicker={`${categories?.length ?? 0} active categories`} />
          <div className="flex h-48 items-end gap-3 pt-4">
            {sortedCategories.map((c, i) => (
              <div key={c.id} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[10px] text-mute">{c.vendorCount}</span>
                <div
                  className={cn("w-full rounded-t-md animate-rise", c.vendorCount === max ? "bg-ember" : "bg-ink/80")}
                  style={{ height: `${(c.vendorCount / max) * 140}px`, animationDelay: `${300 + i * 40}ms` }}
                />
                <span className="label-mono truncate">{c.name}</span>
              </div>
            ))}
            {sortedCategories.length === 0 ? <p className="text-mute">No categories yet.</p> : null}
          </div>
        </Panel>
        <Panel className="p-5" delay={300}>
          <PanelHead title="Activity" kicker="Across all regions" />
          <ul className="space-y-4">
            {(activity ?? []).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dot[a.tone] ?? dot["default"])} />
                <div className="text-[13px] leading-snug">
                  <span className="font-medium">{a.who}</span> {a.what}
                  <p className="font-mono text-[10px] text-mute">{a.when}</p>
                </div>
              </li>
            ))}
            {(activity ?? []).length === 0 ? <p className="text-mute">No activity yet.</p> : null}
          </ul>
        </Panel>
      </div>

      <Panel className="p-5" delay={350}>
        <PanelHead
          title="Recently updated vendors"
          right={<Link to="/vendors" className="text-[13px] text-ember hover:underline">View all →</Link>}
        />
        <div className="divide-y divide-line">
          {recentVendors.map((v) => (
            <div key={v.id} className="flex items-center gap-4 py-3">
              <Thumb src={v.image ?? fallbackVendorImage} alt={v.name} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{v.name}</p>
                <p className="truncate font-mono text-[11px] text-mute">{v.category} · {v.location}</p>
              </div>
              <span className="hidden font-mono text-[12px] sm:block">★ {v.rating.toFixed(1)}</span>
              <StatusPill status={v.status} />
            </div>
          ))}
          {recentVendors.length === 0 ? <p className="p-4 text-center text-mute">No vendors yet.</p> : null}
        </div>
      </Panel>
    </AdminShell>
  );
}
