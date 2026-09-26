import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { VendorAdminStatus } from "@/lib/types";

export function Panel({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <div
      className={cn("panel animate-rise", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function PanelHead({
  title,
  kicker,
  right,
}: {
  title: string;
  kicker?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 pb-3">
      <div>
        <h2 className="font-display text-[17px] font-semibold">{title}</h2>
        {kicker ? <p className="label-mono mt-0.5">{kicker}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("label-mono", className)}>{children}</p>;
}

const statusTone: Record<VendorAdminStatus, string> = {
  Verified: "bg-moss/15 text-moss",
  Pending: "bg-amber/15 text-amber",
  Suspended: "bg-clay/15 text-clay",
};

const statusDot: Record<VendorAdminStatus, string> = {
  Verified: "bg-moss",
  Pending: "bg-amber",
  Suspended: "bg-clay",
};

const statusLabel: Record<VendorAdminStatus, string> = {
  Verified: "Verified",
  Pending: "Pending",
  Suspended: "Suspended",
};

export function StatusPill({ status }: { status: VendorAdminStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[11px]",
        statusTone[status],
      )}
    >
      <span className={cn("size-1.5 rounded-full", statusDot[status])} />
      {statusLabel[status]}
    </span>
  );
}

export function StatCard({
  label,
  value,
  note,
  tone = "mute",
  alert = false,
  delay = 0,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "moss" | "mute" | "ember" | "clay";
  alert?: boolean;
  delay?: number;
}) {
  const ring = alert
    ? tone === "clay"
      ? "ring-clay/30"
      : "ring-ember/30"
    : "ring-line";
  const valueTone =
    tone === "ember" ? "text-ember" : tone === "clay" ? "text-clay" : "text-ink";
  const noteTone = tone === "moss" ? "text-moss" : "text-mute";

  return (
    <div
      className={cn("panel animate-rise shrink-0 px-4 py-4 ring-1", ring)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="label-mono flex items-center gap-1.5">
        {label}
        {alert ? (
          <span
            className={cn(
              "size-1.5 animate-pulse-soft rounded-full",
              tone === "clay" ? "bg-clay" : "bg-ember",
            )}
          />
        ) : null}
      </p>
      <p className={cn("mt-2 font-display text-[30px] font-bold leading-none", valueTone)}>
        {value}
      </p>
      <p className={cn("mt-2 font-mono text-[11px]", noteTone)}>{note}</p>
    </div>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg bg-surface/70 px-3 py-2 text-[13px] font-medium ring-1 ring-line transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SolidButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PageHead({
  kicker,
  title,
  actions,
}: {
  kicker: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="animate-rise" style={{ animationDelay: "60ms" }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{kicker}</p>
          <h1 className="mt-1 text-balance font-display text-[32px] font-bold tracking-tight">
            {title}
          </h1>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Thumb({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={816}
      height={816}
      className={cn("rounded-lg object-cover ring-1 ring-line", className)}
    />
  );
}
