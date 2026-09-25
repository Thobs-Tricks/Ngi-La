import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { GhostButton, PageHead, Panel, SolidButton, Thumb } from "@/components/admin/ui";
import { fallbackVendorImage } from "@/data/ngila";
import { fetchVerificationQueue, rejectClaim, requestVendorInfo, verifyVendor } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
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

function Verification() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [infoTarget, setInfoTarget] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState("");

  const { data: queue, isLoading } = useQuery({
    queryKey: ["verification-queue"],
    queryFn: fetchVerificationQueue,
    enabled: status === "authenticated",
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["verification-queue"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
  };

  const onError = (err: unknown) => {
    toast.error(err instanceof ApiError ? err.message : "That didn't work. Try again.");
  };

  const advanceSelection = (resolvedId: string) => {
    const next = (queue ?? []).find((q) => q.id !== resolvedId);
    setSelected(next?.id ?? null);
  };

  const verifyMutation = useMutation({
    mutationFn: verifyVendor,
    onSuccess: (_data, id) => {
      toast.success("Vendor verified.");
      advanceSelection(id);
      invalidate();
    },
    onError,
  });

  const rejectMutation = useMutation({
    mutationFn: rejectClaim,
    onSuccess: (_data, id) => {
      toast.success("Claim rejected — listing is unclaimed again.");
      advanceSelection(id);
      invalidate();
    },
    onError,
  });

  const requestInfoMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => requestVendorInfo(id, message),
    onSuccess: () => {
      toast.success("Request sent to the claimant.");
      setInfoTarget(null);
      setInfoMessage("");
    },
    onError,
  });

  const list = queue ?? [];
  const item = list.find((q) => q.id === selected) ?? list[0] ?? null;
  const busy = verifyMutation.isPending || rejectMutation.isPending;

  return (
    <AdminShell>
      <PageHead kicker={`${list.length} awaiting review`} title="Verification queue" />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Panel className="p-2" delay={100}>
          {isLoading ? <p className="p-4 text-mute">Loading…</p> : null}
          {list.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelected(q.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-3 text-left transition",
                (item?.id ?? list[0]?.id) === q.id ? "bg-ink/5 ring-1 ring-line" : "hover:bg-ink/5",
              )}
            >
              <Thumb src={q.image ?? fallbackVendorImage} alt={q.businessName} className="size-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{q.businessName}</p>
                <p className="font-mono text-[11px] text-mute">{q.category} · {q.submittedAt}</p>
              </div>
              <span className="size-2 animate-pulse-soft rounded-full bg-ember" />
            </button>
          ))}
          {!isLoading && list.length === 0 ? <p className="p-4 text-mute">Queue is empty. 🎉</p> : null}
        </Panel>

        {item ? (
          <Panel key={item.id} className="overflow-hidden" delay={150}>
            <img src={item.image ?? fallbackVendorImage} alt={item.businessName} className="h-64 w-full object-cover" width={816} height={816} />
            <div className="space-y-5 p-6">
              <div>
                <p className="label-mono">{item.category} · added by {item.addedByName ?? "self-registered"}</p>
                <h2 className="mt-1 font-display text-[26px] font-bold">{item.businessName}</h2>
                <p className="text-[13px] text-mute">{item.location}</p>
              </div>
              <div className="rounded-lg bg-paper/70 p-4 ring-1 ring-line">
                <p className="label-mono">Claimant</p>
                <p className="mt-1 text-[14px] font-medium">{item.claimantName}</p>
                <p className="font-mono text-[12px] text-mute">{item.claimantEmail}</p>
                {item.description ? <p className="mt-2 text-[13px] text-ink/80">{item.description}</p> : null}
              </div>

              {infoTarget === item.id ? (
                <div className="space-y-2">
                  <textarea
                    value={infoMessage}
                    onChange={(e) => setInfoMessage(e.target.value)}
                    placeholder="What do you need from the claimant?"
                    rows={3}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] outline-none focus:border-ember/60 focus:ring-2 focus:ring-ember/20"
                  />
                  <div className="flex gap-2">
                    <SolidButton
                      disabled={requestInfoMutation.isPending || !infoMessage.trim()}
                      onClick={() => requestInfoMutation.mutate({ id: item.id, message: infoMessage })}
                    >
                      {requestInfoMutation.isPending ? "Sending…" : "Send request"}
                    </SolidButton>
                    <GhostButton onClick={() => { setInfoTarget(null); setInfoMessage(""); }}>Cancel</GhostButton>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <SolidButton disabled={busy} onClick={() => verifyMutation.mutate(item.id)}>
                    Approve & verify
                  </SolidButton>
                  <GhostButton disabled={busy} onClick={() => setInfoTarget(item.id)}>Request info</GhostButton>
                  <GhostButton disabled={busy} onClick={() => rejectMutation.mutate(item.id)} className="text-clay">
                    Reject
                  </GhostButton>
                </div>
              )}
            </div>
          </Panel>
        ) : (
          <Panel className="grid place-items-center p-12 text-mute" delay={150}>
            Nothing to review right now.
          </Panel>
        )}
      </div>
    </AdminShell>
  );
}
