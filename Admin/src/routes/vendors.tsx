import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel, StatusPill, Thumb } from "@/components/admin/ui";
import { vendors, type VendorStatus } from "@/data/ngila";
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
  component: Vendors,
});

const filters: ("All" | VendorStatus)[] = ["All", "Verified", "Pending", "Vendor claimed", "Community added", "Suspended"];

function Vendors() {
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");
  const list = vendors.filter(
    (v) => (f === "All" || v.status === f) && (v.name + v.area + v.category).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AdminShell>
      <PageHead kicker={`${vendors.length} listings`} title="Claims & vendors" />
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium transition", f === x ? "bg-ink text-paper" : "bg-surface/70 text-mute ring-1 ring-line hover:text-ink")}
          >
            {x}
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
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr className="label-mono">
              <th className="p-3 font-normal">Vendor</th>
              <th className="p-3 font-normal">Category</th>
              <th className="p-3 font-normal">Rating</th>
              <th className="p-3 font-normal">Added by</th>
              <th className="p-3 font-normal">Updated</th>
              <th className="p-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((v) => (
              <tr key={v.id} className="transition hover:bg-ink/[0.03]">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Thumb src={v.image} alt={v.name} className="size-10" />
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="font-mono text-[11px] text-mute">{v.area}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{v.category}</td>
                <td className="p-3 font-mono">★ {v.rating} <span className="text-mute">({v.reviews})</span></td>
                <td className="p-3 font-mono text-mute">{v.addedBy}</td>
                <td className="p-3 font-mono text-mute">{v.updated}</td>
                <td className="p-3"><StatusPill status={v.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 ? <p className="p-8 text-center text-mute">No vendors match.</p> : null}
      </Panel>
    </AdminShell>
  );
}
