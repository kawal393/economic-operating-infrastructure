import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("border-b border-border/60 py-20 lg:py-28", className)}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 80% at 50% -10%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1
          className="animate-rise mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
          style={{ animationDelay: "60ms" }}
        >
          {title}
        </h1>
        <p
          className="animate-rise mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          {description}
        </p>
        {children ? (
          <div className="animate-rise mt-8" style={{ animationDelay: "180ms" }}>
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function Panel({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface-panel rounded-lg p-6",
        interactive && "lift cursor-default",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatBlock({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <Panel className="p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
        {value}
      </p>
      {delta ? <p className="mt-1.5 font-mono text-xs text-success">{delta}</p> : null}
    </Panel>
  );
}

export function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        active ? "bg-success animate-pulse-node" : "bg-warning",
      )}
    />
  );
}
