import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { GhostButton, PageHead, Panel, SolidButton } from "@/components/admin/ui";
import { createCategory, fetchCategories } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
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

const tones = ["bg-ember/15 text-ember", "bg-moss/15 text-moss", "bg-ink/10 text-ink", "bg-amber/15 text-amber", "bg-clay/15 text-clay"];
const bars = ["bg-ember", "bg-moss", "bg-ink", "bg-amber", "bg-clay"];

function Categories() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: status === "authenticated",
  });

  const canCreate = status === "authenticated";

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created.");
      setAdding(false);
      setName("");
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't create category."),
  });

  const list = categories ?? [];
  const max = Math.max(1, ...list.map((c) => c.vendorCount));

  return (
    <AdminShell>
      <PageHead
        kicker={`${list.length} active categories`}
        title="Categories"
        actions={
          canCreate ? (
            adding ? (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim()) createMutation.mutate(name.trim());
                }}
              >
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  className="rounded-lg bg-surface/70 px-3 py-2 text-[13px] ring-1 ring-line outline-none placeholder:text-mute focus:ring-ember/40"
                />
                <SolidButton disabled={createMutation.isPending || !name.trim()} className="shrink-0">
                  {createMutation.isPending ? "Adding…" : "Add"}
                </SolidButton>
                <GhostButton onClick={() => { setAdding(false); setName(""); }}>Cancel</GhostButton>
              </form>
            ) : (
              <SolidButton onClick={() => setAdding(true)}>+ New category</SolidButton>
            )
          ) : null
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((c, i) => (
          <Panel key={c.id} className="p-5 transition hover:-translate-y-0.5" delay={80 + i * 40}>
            <div className={cn("grid size-11 place-items-center rounded-xl font-display text-lg font-bold", tones[i % tones.length])}>
              {c.name[0]?.toUpperCase()}
            </div>
            <p className="mt-4 font-display text-[16px] font-semibold">{c.name}</p>
            <p className="font-mono text-[11px] text-mute">{c.vendorCount} vendors</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/5">
              <div className={cn("h-full rounded-full", bars[i % bars.length])} style={{ width: `${(c.vendorCount / max) * 100}%` }} />
            </div>
          </Panel>
        ))}
        {isLoading ? <p className="text-mute">Loading…</p> : null}
        {!isLoading && list.length === 0 ? <p className="text-mute">No categories yet.</p> : null}
      </div>
    </AdminShell>
  );
}
