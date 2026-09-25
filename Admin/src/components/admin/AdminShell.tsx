import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type NavItem = { to: "/" | "/verification" | "/vendors" | "/categories" | "/reports" | "/users"; label: string; badge?: number; tone?: "ember" | "clay" };

const inspect: NavItem[] = [
  { to: "/", label: "Overview" },
  { to: "/verification", label: "Verification", badge: 14, tone: "ember" },
  { to: "/vendors", label: "Claims & Vendors" },
  { to: "/categories", label: "Categories" },
  { to: "/reports", label: "Reports", badge: 6, tone: "clay" },
];

const insight: NavItem[] = [{ to: "/users", label: "Users & Contributors" }];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] transition",
        active ? "bg-ink font-medium text-paper" : "text-ink/70 hover:bg-ink/5",
      )}
    >
      <span>{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full font-mono text-[10px] font-medium",
            active
              ? "bg-paper/20 text-paper"
              : item.tone === "clay"
                ? "bg-clay/15 text-clay"
                : "bg-ember/15 text-ember",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-ember/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 h-[460px] w-[460px] rounded-full bg-moss/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-amber/15 blur-[120px]" />
      </div>

      <div className="relative z-10 flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-line bg-surface/55 px-4 py-6 backdrop-blur-xl md:flex">
          <Link to="/" className="flex items-center gap-2.5 px-2 pb-6">
            <div className="grid size-8 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-paper">
              N
            </div>
            <div className="leading-none">
              <p className="font-display text-[15px] font-bold">NGILA</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mute">
                Console
              </p>
            </div>
          </Link>

          <p className="mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-mute">
            Inspect
          </p>
          {inspect.map((item) => (
            <NavLink key={item.to} item={item} active={path === item.to} />
          ))}

          <p className="mt-4 mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-mute">
            Insight
          </p>
          {insight.map((item) => (
            <NavLink key={item.to} item={item} active={path === item.to} />
          ))}

          <div className="mt-auto flex items-center gap-2.5 rounded-lg bg-ink/5 px-3 py-2.5">
            <div className="grid size-8 place-items-center rounded-full bg-ember/20 font-display text-xs font-semibold text-ember">
              TM
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-medium">Thabo M.</p>
              <p className="font-mono text-[10px] text-mute">Lead inspector</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6 px-4 py-6 md:px-8">
          <header className="animate-rise sticky top-0 z-20 -mx-4 flex items-center gap-4 border-b border-line bg-paper/70 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
            <div className="w-80 max-w-full">
              <div className="flex items-center gap-2 rounded-lg bg-surface/70 px-3 py-2 text-[13px] ring-1 ring-line">
                <span className="text-mute">⌕</span>
                <input
                  placeholder="Search vendors, claims, reports…"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-mute"
                />
                <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-mute">
                  ⌘K
                </span>
              </div>
            </div>
            <div className="ml-auto hidden items-center gap-1 rounded-lg bg-surface/60 p-1 text-[12px] font-medium ring-1 ring-line lg:flex">
              <span className="rounded-md bg-ink px-2.5 py-1.5 text-paper">All regions</span>
              <span className="rounded-md px-2.5 py-1.5 text-mute transition hover:text-ink">
                Gauteng
              </span>
              <span className="rounded-md px-2.5 py-1.5 text-mute transition hover:text-ink">
                KZN
              </span>
            </div>
            <div className="hidden size-9 place-items-center rounded-full bg-moss/20 font-mono text-xs text-moss ring-1 ring-line sm:grid">
              14
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-ink font-display text-xs font-semibold text-paper">
              TM
            </div>
          </header>

          <div className="md:hidden">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {[...inspect, ...insight].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-2 text-[12px] font-medium transition",
                    path === item.to
                      ? "bg-ink text-paper"
                      : "bg-surface/70 text-mute ring-1 ring-line",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
