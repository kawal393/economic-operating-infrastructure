import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { FieldRow, HonestyNote } from "@/components/seal-ui";
import { APEX_PORTAL } from "@/content/legal";
import { verifyHash, type VerifyResult } from "@/lib/apex-live";

export const Route = createFileRoute("/r/$receiptId")({
  head: () => ({
    meta: [
      { title: "Sealed record — Apex PSI ledger | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Public record page for a sealed artefact: commit id, predicate, phase, status and post-quantum signature, read live from the Apex PSI ledger.",
      },
      { property: "og:title", content: "Sealed record — Apex PSI ledger" },
      {
        property: "og:description",
        content: "Commit id, predicate, phase, status and signatures for a sealed record.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecordPage,
});

function RecordPage() {
  const { receiptId } = Route.useParams();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    setResult(null);
    verifyHash(receiptId)
      .then((r) => live && setResult(r))
      .catch((e) => live && setError(e instanceof Error ? e.message : "ledger unreachable"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [receiptId]);

  const found = Boolean(result?.found);

  return (
    <>
      <PageHeader
        eyebrow="Apex PSI · Public record"
        title="Sealed record"
        description="Read live from the Apex PSI ledger. Nothing on this page is cached, stored or edited by this platform."
      />

      <Section>
        <Panel>
          <p className="break-all font-mono text-xs text-muted-foreground">{receiptId}</p>

          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Reading the ledger…</p>
          ) : error ? (
            <p className="mt-6 font-mono text-xs text-destructive">{error}</p>
          ) : found ? (
            <div className="mt-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-success/35 bg-success/10 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-success">
                  {result?.phase ?? "Verified"}
                </span>
              </div>

              <div className="mt-5">
                <FieldRow label="Status" value={result?.status ?? "—"} tone="success" />
                <FieldRow label="Commit id" value={result?.commit_id ?? "—"} />
                <FieldRow label="Predicate" value={result?.predicate_id ?? "—"} />
                <FieldRow label="Sealed at (UTC)" value={result?.created_at ?? "—"} />
                <FieldRow label="Merkle root" value={result?.merkle_root ?? "—"} />
                <FieldRow
                  label="PQ signature valid"
                  value={
                    result?.post_quantum
                      ? result?.pq_verified
                        ? `Valid · ${result?.pq_algorithm ?? "post-quantum"}`
                        : "Present, not verified"
                      : "Not present"
                  }
                  tone={result?.post_quantum && result?.pq_verified ? "success" : "warning"}
                />
                <FieldRow label="Ed25519 signature" value={result?.ed25519_signature ?? "—"} />
                <FieldRow label="Signed payload" value={result?.signed_payload ?? "—"} />
                <FieldRow label="Algorithms" value={result?.algorithm ?? "—"} />
              </div>

              {result?.action_summary ? (
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {result.action_summary}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/verify"
                  search={{ hash: receiptId }}
                  className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  Verify this record
                </Link>
                <a
                  href={`${APEX_PORTAL}/r/${encodeURIComponent(receiptId)}`}
                  className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open on the APEX PSI portal
                </a>
              </div>

              <HonestyNote>
                This proves the bytes were sealed at the stated time and have not changed since. It
                does not prove the content is true.
              </HonestyNote>
            </div>
          ) : (
            <div className="mt-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-warning/35 bg-warning/10 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-warning">
                  Not found in ledger
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                No record exists for this identifier. Absence of a seal is not evidence of
                alteration.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/seal"
                  className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  Seal something
                </Link>
                <Link
                  to="/verify"
                  search={{ hash: "" }}
                  className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Look up another hash
                </Link>
              </div>
            </div>
          )}
        </Panel>
      </Section>
    </>
  );
}
