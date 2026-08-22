import { useEffect, useState } from "react";
import { Panel } from "@/components/primitives";
import { FieldRow } from "@/components/seal-ui";
import { verifyHash, type VerifyResult } from "@/lib/apex-live";

/** Looks a SHA-256 digest up in the live APEX PSI ledger and reports honestly. */
export function LedgerVerifyPanel({ initialHash = "" }: { initialHash?: string }) {
  const [hash, setHash] = useState(initialHash);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(value: string) {
    const candidate = value.trim();
    if (!candidate) return;
    setWorking(true);
    setError(null);
    setResult(null);
    try {
      setResult(await verifyHash(candidate));
    } catch (e) {
      setError(e instanceof Error ? e.message : "ledger unreachable — retry");
    } finally {
      setWorking(false);
    }
  }

  useEffect(() => {
    if (initialHash) void run(initialHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHash]);

  return (
    <Panel>
      <h2 className="text-lg font-semibold tracking-tight">Look it up on the ledger</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Paste a SHA-256 digest. We query the live APEX PSI ledger and show exactly what is there —
        or say plainly that nothing is.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="36bcebd3…"
          className="flex-1 rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/50"
        />
        <button
          type="button"
          onClick={() => void run(hash)}
          disabled={working}
          className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
        >
          {working ? "Checking…" : "Check ledger"}
        </button>
      </div>

      {error ? <p className="mt-5 font-mono text-xs text-destructive">{error}</p> : null}

      {result ? (
        result.found ? (
          <div className="mt-6">
            <FieldRow label="Ledger entry" value="Found" tone="success" />
            <FieldRow label="Status" value={result.status ?? "—"} tone="success" />
            <FieldRow label="Phase" value={result.phase ?? "—"} />
            <FieldRow label="Commit id" value={result.commit_id ?? "—"} />
            <FieldRow label="Predicate" value={result.predicate_id ?? "—"} />
            <FieldRow label="Merkle root" value={result.merkle_root ?? "—"} />
            <FieldRow
              label="Merkle verified"
              value={
                result.merkle_verified === null || result.merkle_verified === undefined
                  ? "not reported"
                  : result.merkle_verified
                    ? "yes"
                    : "no"
              }
              tone={result.merkle_verified ? "success" : "warning"}
            />
            <FieldRow
              label="Post-quantum"
              value={
                result.post_quantum
                  ? result.pq_verified
                    ? "present and verified"
                    : "present, not verified"
                  : "not present"
              }
              tone={result.post_quantum && result.pq_verified ? "success" : "warning"}
            />
            <FieldRow label="Ed25519 signature" value={result.ed25519_signature ?? "—"} />
            <FieldRow label="Signed payload" value={result.signed_payload ?? "—"} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-warning">
            No ledger entry — seal it for free.
          </p>
        )
      ) : null}
    </Panel>
  );
}
