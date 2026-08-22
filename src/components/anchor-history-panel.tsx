import { useEffect, useState } from "react";
import { Panel } from "@/components/primitives";
import { anchorHistory, mempoolBlock, mempoolTx, type AnchorHistory } from "@/lib/apex-live";

/** Live Bitcoin anchoring state from the APEX PSI ledger. No modelled numbers. */
export function AnchorHistoryPanel() {
  const [data, setData] = useState<AnchorHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    anchorHistory()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "ledger unreachable — retry"));
    return () => {
      alive = false;
    };
  }, []);

  const latest = data?.anchors?.find((a) => a.block_height) ?? data?.anchors?.[0] ?? null;

  return (
    <Panel>
      <h2 className="text-lg font-semibold tracking-tight">Bitcoin anchors (live)</h2>
      {error ? (
        <p className="mt-4 font-mono text-xs text-destructive">{error}</p>
      ) : !data ? (
        <p className="mt-4 font-mono text-xs text-muted-foreground">reading the chain…</p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Stat label="Confirmed" value={String(data.confirmed ?? 0)} />
            <Stat label="Pending" value={String(data.pending ?? 0)} />
            <Stat label="Latest block" value={latest?.block_height ? String(latest.block_height) : "—"} />
          </div>

          <div className="mt-6 space-y-3">
            {(data.anchors ?? []).map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-secondary/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
                    {a.status ?? "unknown"} · {a.chain ?? "bitcoin"}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {a.confirmed_at ?? a.created_at ?? ""}
                  </span>
                </div>
                <p className="mt-3 break-all font-mono text-[11px] text-muted-foreground">
                  anchor: {a.anchor_hash}
                </p>
                {a.bitcoin_txid ? (
                  <p className="mt-2 break-all font-mono text-[11px]">
                    <a
                      href={mempoolTx(a.bitcoin_txid)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold underline-offset-4 hover:underline"
                    >
                      txid {a.bitcoin_txid}
                    </a>
                  </p>
                ) : null}
                {a.block_height ? (
                  <p className="mt-2 font-mono text-[11px]">
                    <a
                      href={mempoolBlock(a.block_height)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold underline-offset-4 hover:underline"
                    >
                      block {a.block_height}
                    </a>
                    {a.entries_count ? ` · ${a.entries_count} entries` : ""}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl text-gold">{value}</p>
    </div>
  );
}
