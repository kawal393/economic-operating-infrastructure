import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { mempoolBlock, mempoolTx } from "@/lib/apex-live";

export type GenesisStats = {
  founded_at: string;
  founding_seals: number;
  platform_seals: number | null;
  total_seals: number | null;
  confirmed_anchors: number | null;
  pending_anchors: number | null;
  latest_block_height: number | null;
  latest_anchor_txid: string | null;
  enforcement_actions_recorded: number;
  events: Array<{
    kind: "seal" | "anchor";
    at: string;
    label: string;
    reference: string;
    detail: string;
    source: string;
    block_height?: number | null;
  }>;
  seal_timestamps: string[];
};

async function fetchGenesis(): Promise<GenesisStats> {
  const res = await fetch("/api/public/v1/ledger-stats");
  if (!res.ok) throw new Error("ledger unreachable");
  return (await res.json()) as GenesisStats;
}

export function useGenesis() {
  return useQuery({
    queryKey: ["genesis-stats"],
    queryFn: fetchGenesis,
    refetchInterval: 60_000,
    retry: 1,
  });
}

function Unreachable({ onRetry }: { onRetry: () => void }) {
  return (
    <p className="font-mono text-xs text-destructive">
      ledger unreachable —{" "}
      <button type="button" onClick={onRetry} className="underline underline-offset-2">
        retry
      </button>
    </p>
  );
}

function useDaysSince(iso: string | undefined) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!iso || now === null) return null;
  const started = new Date(iso).getTime();
  const ms = Math.max(now - started, 0);
  const days = Math.floor(ms / 86_400_000);
  const rest = ms % 86_400_000;
  const h = String(Math.floor(rest / 3_600_000)).padStart(2, "0");
  const m = String(Math.floor((rest % 3_600_000) / 60_000)).padStart(2, "0");
  const s = String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0");
  return { days, clock: `${h}:${m}:${s}` };
}

/** The genesis block: honest Day-1 framing plus four live counters. */
export function GenesisCounters() {
  const q = useGenesis();
  const elapsed = useDaysSince(q.data?.founded_at);

  return (
    <div className="rounded-xl border border-gold/25 bg-secondary/25 p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
        The ledger is open.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/85">
        You are looking at Day 1 of the public record. Everything after this moment is growth — and
        none of it will be faked, because every number below is fetched live from the ledger at the
        moment you load the page. Refresh and watch. That is the product.
      </p>
      <p className="mt-3 text-sm font-semibold tracking-tight text-gold">
        Nobody gets to fake being early. You are early.
      </p>

      {q.isError ? (
        <div className="mt-6">
          <Unreachable onRetry={() => void q.refetch()} />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            label="Seals in the public record"
            value={q.isLoading ? "…" : (q.data?.total_seals?.toLocaleString() ?? "—")}
            note="Platform ledger rows + APEX PSI founding seals"
          />
          <Tile
            label="Bitcoin anchors confirmed"
            value={q.isLoading ? "…" : (q.data?.confirmed_anchors?.toLocaleString() ?? "—")}
            note={
              q.data?.latest_block_height ? `Latest block ${q.data.latest_block_height}` : "—"
            }
            href={q.data?.latest_block_height ? mempoolBlock(q.data.latest_block_height) : undefined}
          />
          <Tile
            label="Days of public record"
            value={elapsed ? String(elapsed.days) : "…"}
            note={elapsed ? `and ${elapsed.clock} — ticking` : "starting the clock"}
          />
          <Tile
            label="Article 50 enforcement actions recorded"
            value={String(q.data?.enforcement_actions_recorded ?? 0)}
            note="Updated by sealed entry only"
          />
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Founding cohort open. Registry membership is free and stays free — Article-grade promise: a
        registry you must pay to join is a registry you do not own.
      </p>
    </div>
  );
}

function Tile({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: string;
  note: string;
  href?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-mono text-2xl text-gold">{value}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 block font-mono text-[10px] text-gold/80 hover:underline"
        >
          {note}
        </a>
      ) : (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">{note}</p>
      )}
    </div>
  );
}

/** Real events only: seals and confirmed anchors, newest first. */
export function ActivityFeed() {
  const q = useGenesis();

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">Live activity</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
          streaming the record
        </span>
      </div>

      {q.isError ? (
        <div className="mt-4">
          <Unreachable onRetry={() => void q.refetch()} />
        </div>
      ) : q.isLoading ? (
        <p className="mt-4 font-mono text-xs text-muted-foreground">reading the ledger…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {(q.data?.events ?? []).map((e) => (
            <li
              key={`${e.kind}-${e.reference}-${e.at}`}
              className="rounded-lg border border-border/70 bg-background/40 p-3"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
                  {new Date(e.at).toISOString().replace("T", " ").slice(0, 16)} UTC
                </span>
                <span className="text-xs text-foreground/85">{e.label}</span>
              </div>
              <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">
                {e.kind === "anchor" && e.reference ? (
                  <a
                    href={mempoolTx(e.reference)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-gold hover:underline"
                  >
                    txid {e.reference}
                  </a>
                ) : (
                  <>{e.reference}</>
                )}{" "}
                · {e.detail.slice(0, 24)}…
              </p>
            </li>
          ))}
          {(q.data?.events ?? []).length === 0 ? (
            <li className="font-mono text-xs text-muted-foreground">
              No events yet. The first one will appear here the moment it is sealed.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

/** Seals over time, drawn from real timestamps. It begins at zero because it did. */
export function SealsSparkline() {
  const q = useGenesis();
  const stamps = (q.data?.seal_timestamps ?? []).map((t) => new Date(t).getTime()).sort();

  let path = "";
  if (stamps.length > 0) {
    const first = stamps[0]!;
    const last = Math.max(stamps[stamps.length - 1]!, Date.now());
    const span = Math.max(last - first, 1);
    const points = stamps.map((t, i) => {
      const x = ((t - first) / span) * 100;
      const y = 30 - ((i + 1) / stamps.length) * 28;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    path = `M0,30 L${points.join(" L")} L100,${(30 - 28).toFixed(2)}`;
  }

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">Seals over time</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          real timestamps only
        </span>
      </div>

      {q.isError ? (
        <div className="mt-4">
          <Unreachable onRetry={() => void q.refetch()} />
        </div>
      ) : (
        <>
          <svg
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
            className="mt-5 h-24 w-full"
            role="img"
            aria-label="Cumulative seals over time"
          >
            <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="0.3" className="text-border" />
            {path ? (
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
                className="text-gold"
              />
            ) : null}
          </svg>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {stamps.length} sealed record{stamps.length === 1 ? "" : "s"} since{" "}
            {q.data ? new Date(q.data.founded_at).toUTCString() : "—"}. This chart starts at zero
            because the record started at zero.
          </p>
        </>
      )}
    </div>
  );
}
