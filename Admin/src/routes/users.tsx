import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel } from "@/components/admin/ui";
import { members } from "@/data/ngila";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & contributors — Ngila Console" },
      { name: "description", content: "See Ngila's customers, vendors and inspectors and their contributions." },
      { property: "og:title", content: "Users & contributors — Ngila Console" },
      { property: "og:description", content: "See Ngila's customers, vendors and inspectors and their contributions." },
    ],
  }),
  component: Users,
});

const role = { Customer: "bg-ink/10 text-ink", Vendor: "bg-amber/15 text-amber", Inspector: "bg-moss/15 text-moss" };

function Users() {
  const top = [...members].sort((a, b) => b.points - a.points).slice(0, 3);
  return (
    <AdminShell>
      <PageHead kicker={`${members.length} members shown`} title="Users & contributors" />
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
                <p className="font-mono text-[11px] text-mute">{m.level}</p>
              </div>
            </div>
            <p className="mt-4 font-display text-[28px] font-bold leading-none">{m.points.toLocaleString()}<span className="ml-1 text-[12px] font-normal text-mute">pts</span></p>
          </Panel>
        ))}
      </div>
      <Panel className="overflow-x-auto p-2" delay={250}>
        <table className="w-full min-w-[680px] text-left text-[13px]">
          <thead>
            <tr className="label-mono">
              {["Member", "Role", "Level", "Added", "Reviews", "Joined", "Status"].map((h) => (
                <th key={h} className="p-3 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-ink/[0.03]">
                <td className="p-3"><p className="font-medium">{m.name}</p><p className="font-mono text-[11px] text-mute">{m.handle}</p></td>
                <td className="p-3"><span className={cn("rounded-full px-2 py-1 font-mono text-[11px]", role[m.role])}>{m.role}</span></td>
                <td className="p-3">{m.level}</td>
                <td className="p-3 font-mono">{m.added}</td>
                <td className="p-3 font-mono">{m.reviews}</td>
                <td className="p-3 font-mono text-mute">{m.joined}</td>
                <td className="p-3"><span className={cn("font-mono text-[11px]", m.status === "Active" ? "text-moss" : "text-clay")}>● {m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </AdminShell>
  );
}
