import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { fetchStats } from "@/lib/endpoints";

type NavItem = { to: "/" | "/verification" | "/vendors" | "/map" | "/categories" | "/users" | "/admins" | "/profile" | "/settings"; label: string; badgeKey?: "verification" };

const inspect: NavItem[] = [
  { to: "/", label: "Overview" },
  { to: "/verification", label: "Verification", badgeKey: "verification" },
  { to: "/vendors", label: "Vendors" },
  { to: "/map", label: "Map" },
  { to: "/categories", label: "Categories" },
];

const insight: NavItem[] = [
  { to: "/users", label: "Users & Contributors" },
  { to: "/admins", label: "Admins" },
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
];

function NavLink({ item, active, badge }: { item: NavItem; active: boolean; badge: number | undefined }) {
  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] transition",
        active ? "bg-ink font-medium text-paper" : "text-ink/70 hover:bg-ink/5",
      )}
    >
      <span>{item.label}</span>
      {badge ? (
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full font-mono text-[10px] font-medium",
            active ? "bg-paper/20 text-paper" : "bg-ember/15 text-ember",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s: { location: { pathname: string } }) => s.location.pathname });
  const navigate = useNavigate();
  const { status, user, logout } = useAuth();
  const [search, setSearch] = useState("");

  const runSearch = () => {
    const q = search.trim();
    if (!q) return;
    void navigate({ to: "/vendors", search: { q } });
  };

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      void navigate({ to: "/login" });
    }
  }, [status, navigate]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-mute">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em]">Loading console…</p>
      </div>
    );
  }

  const badges = { verification: stats?.pendingVerification };
  const initials = user
    ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
    : "";

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
            <NavLink key={item.to} item={item} active={path === item.to} badge={item.badgeKey ? badges[item.badgeKey] : undefined} />
          ))}

          <p className="mt-4 mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-mute">
            Insight
          </p>
          {insight.map((item) => (
            <NavLink key={item.to} item={item} active={path === item.to} badge={undefined} />
          ))}

          <button
            onClick={() => void logout()}
            className="mt-auto flex items-center gap-2.5 rounded-lg bg-ink/5 px-3 py-2.5 text-left transition hover:bg-ink/10"
          >
            <div className="grid size-8 place-items-center rounded-full bg-ember/20 font-display text-xs font-semibold text-ember">
              {initials}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="font-mono text-[10px] text-mute">
                Admin · Sign out
              </p>
            </div>
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-6 px-4 py-6 md:px-8">
          <header className="animate-rise sticky top-0 z-20 -mx-4 flex items-center gap-4 border-b border-line bg-paper/70 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
            <div className="w-80 max-w-full">
              <div className="flex items-center gap-2 rounded-lg bg-surface/70 px-3 py-2 text-[13px] ring-1 ring-line">
                <span className="text-mute">⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder="Search vendors, claims…"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-mute"
                />
              </div>
            </div>
            <div className="ml-auto" />
            {stats ? (
              <div className="hidden size-9 place-items-center rounded-full bg-moss/20 font-mono text-xs text-moss ring-1 ring-line sm:grid">
                {stats.pendingVerification}
              </div>
            ) : null}
            <div className="grid size-9 place-items-center rounded-full bg-ink font-display text-xs font-semibold text-paper">
              {initials}
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
