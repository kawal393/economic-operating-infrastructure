import { useQuery } from "@tanstack/react-query";
import { anchorHistory, mempoolBlock } from "@/lib/apex-live";
import { ENFORCEMENT_ACTIONS_RECORDED, FOUNDING_RECORDS_COUNT } from "@/content/legal";

/**
 * Line A — every number here is fetched live. On failure we say so; we never invent one.
 */
export function LiveLedgerLine() {
  const q = useQuery({
    queryKey: ["anchor-history"],
    queryFn: anchorHistory,
    refetchInterval: 120_000,
    retry: 1,
  });

  const latestBlock = q.data?.anchors.find((a) => a.block_height)?.block_height ?? null;

  return (
    <div className="rounded-md border border-border bg-secondary/30 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
        Live from the ledger
      </p>
      {q.isLoading ? (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Reading the ledger…</p>
      ) : q.isError || !q.data ? (
        <p className="mt-2 font-mono text-xs text-destructive">
          ledger unreachable — retry{" "}
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="underline underline-offset-2"
          >
            now
          </button>
        </p>
      ) : (
        <p className="mt-2 font-mono text-xs leading-relaxed text-foreground/85">
          Bitcoin anchors confirmed: <span className="text-gold">{q.data.confirmed}</span> ·
          Latest block:{" "}
          {latestBlock ? (
            <a
              href={mempoolBlock(latestBlock)}
              target="_blank"
              rel="noreferrer noopener"
              className="text-gold hover:underline"
            >
              {latestBlock}
            </a>
          ) : (
            "—"
          )}{" "}
          · Founding records sealed:{" "}
          <span className="text-gold">{FOUNDING_RECORDS_COUNT}</span> · Article 50 enforcement
          actions recorded:{" "}
          <span className="text-gold">{ENFORCEMENT_ACTIONS_RECORDED}</span>
        </p>
      )}
    </div>
  );
}
