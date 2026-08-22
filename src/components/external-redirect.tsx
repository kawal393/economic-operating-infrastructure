import { useEffect } from "react";

/**
 * Link immortality: stray legacy paths route on to the APEX PSI public portal.
 */
export function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => window.location.replace(to), 600);
    return () => window.clearTimeout(t);
  }, [to]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5">
      <div className="text-center">
        <span className="mx-auto block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
        <p className="mt-5 text-sm text-foreground">Routing to the APEX PSI public portal…</p>
        <a
          href={to}
          className="mt-3 inline-block break-all font-mono text-xs text-gold hover:underline"
        >
          {to}
        </a>
      </div>
    </div>
  );
}
