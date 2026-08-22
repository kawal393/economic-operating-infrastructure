import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/primitives";
import { FieldRow, HonestyNote } from "@/components/seal-ui";
import { notarize, type NotarizeResult } from "@/lib/apex-live";

/** Writes a real entry to the live APEX PSI ledger. */
export function LedgerSealPanel() {
  const [decision, setDecision] = useState("");
  const [predicate, setPredicate] = useState("");
  const [modelId, setModelId] = useState("");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<NotarizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hash = result?.decision_hash?.replace(/^sha256:/, "") ?? "";

  async function submit() {
    if (!decision.trim()) {
      toast.error("Describe the decision you are sealing");
      return;
    }
    setWorking(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await notarize({
          decision: decision.trim(),
          predicate: predicate.trim() || "GENERAL_RECORD",
          model_id: modelId.trim() || "unspecified",
        }),
      );
      toast.success("Sealed into the live ledger");
    } catch (e) {
      const message = e instanceof Error ? e.message : "ledger unreachable — retry";
      setError(message);
      toast.error("Not sealed", { description: message });
    } finally {
      setWorking(false);
    }
  }

  return (
    <Panel>
      <h2 className="text-lg font-semibold tracking-tight">Seal into the live ledger</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        This writes a real, public entry to the APEX PSI ledger: a canonical digest, a Merkle leaf,
        an Ed25519 signature and a post-quantum signature. The record cannot be edited or removed
        afterwards.
      </p>

      <div className="mt-6 grid gap-3">
        <textarea
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          rows={4}
          placeholder="Decision or statement to seal…"
          className="w-full resize-y rounded-lg border border-border bg-secondary/30 px-4 py-3 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/50"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={predicate}
            onChange={(e) => setPredicate(e.target.value)}
            placeholder="Predicate (e.g. ARTICLE50_DISCLOSURE)"
            className="rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/50"
          />
          <input
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            placeholder="Model id (e.g. gpt-5.2)"
            className="rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/50"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={working}
        className="mt-5 w-full rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
      >
        {working ? "Sealing…" : "Seal to the ledger"}
      </button>

      {error ? (
        <p className="mt-4 font-mono text-xs text-destructive">{error}</p>
      ) : null}

      {result ? (
        <>
          <div className="mt-6">
            <FieldRow label="Receipt id" value={result.receipt_id} tone="success" />
            <FieldRow label="SHA-256" value={result.decision_hash} />
            <FieldRow label="Merkle leaf" value={result.merkle_leaf} />
            {result.merkle_root ? (
              <FieldRow label="Merkle root" value={result.merkle_root} />
            ) : null}
            <FieldRow label="Ed25519 signature" value={result.ed25519_signature} />
            <FieldRow label="Timestamp (UTC)" value={result.timestamp} />
            {result.pq_signature ? (
              <FieldRow
                label="Post-quantum"
                value={result.pq_signature.algorithm ?? "LMS-W4-SHA256"}
                tone="success"
              />
            ) : null}
          </div>
          <Link
            to="/verify"
            search={{ hash }}
            className="mt-5 inline-block rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
          >
            Verify this record
          </Link>
        </>
      ) : null}

      <HonestyNote>
        A ledger entry proves these exact bytes were recorded at this time. It makes no claim that
        the statement is true.
      </HonestyNote>
    </Panel>
  );
}
