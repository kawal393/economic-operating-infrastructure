import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageHeader, Panel, Section, SectionHeading, StatBlock } from "@/components/primitives";
import { FieldRow, HonestyNote } from "@/components/seal-ui";
import { CopyBlock } from "@/components/copy-block";
import { getCheckpoint, getInclusionProof } from "@/lib/transparency.functions";

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency Log — Signed Checkpoints | Sovereign AI Services" },
      {
        name: "description",
        content:
          "An RFC 6962 Merkle tree over the notarisation chain. Fetch the signed checkpoint, pull an inclusion proof for any receipt, and detect a forked history with 200 bytes.",
      },
      { property: "og:title", content: "Transparency Log — Signed Checkpoints" },
      {
        property: "og:description",
        content:
          "Signed C2SP checkpoints and RFC 6962 inclusion proofs for every entry on the Sovereign AI ledger.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/transparency" }],
  }),
  component: TransparencyPage,
});

function TransparencyPage() {
  const fetchCheckpoint = useServerFn(getCheckpoint);
  const fetchProof = useServerFn(getInclusionProof);
  const [receiptId, setReceiptId] = useState("");
  const [query, setQuery] = useState("");

  const checkpoint = useQuery({
    queryKey: ["checkpoint"],
    queryFn: () => fetchCheckpoint(),
    refetchInterval: 60_000,
  });

  const proof = useQuery({
    queryKey: ["inclusion-proof", query],
    queryFn: () => fetchProof({ data: { receiptId: query } }),
    enabled: query.length > 3,
  });

  const cp = checkpoint.data;

  return (
    <>
      <PageHeader
        eyebrow="Article I · Verifiable Architecture"
        title="The Transparency Log"
        description="Every ledger entry is a leaf in an RFC 6962 Merkle tree. We sign the root and publish it. If we ever rewrote history, we would have to sign two contradictory roots under the same key — and you would hold both."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock label="Tree size" value={cp ? String(cp.size) : "—"} />
          <StatBlock label="Key id" value={cp ? `sovereign-${cp.keyId}` : "—"} />
          <StatBlock label="Origin" value="sovereign-ai.services/ledger" />
          <StatBlock label="Signature" value="Ed25519" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Panel>
            <SectionHeading eyebrow="Current" title="Signed checkpoint" />
            {checkpoint.isLoading ? (
              <p className="mt-6 font-mono text-xs text-muted-foreground">Reading the tree…</p>
            ) : checkpoint.isError ? (
              <p className="mt-6 font-mono text-xs text-destructive">
                The checkpoint could not be read right now.
              </p>
            ) : cp ? (
              <div className="mt-6">
                <FieldRow label="Root (hex)" value={cp.rootHash} />
                <FieldRow label="Root (base64)" value={cp.rootBase64} />
                <FieldRow label="Size" value={String(cp.size)} />
                <FieldRow label="Signer" value={cp.did} />
                <FieldRow label="Signature" value={cp.signature} />
                <FieldRow label="Read at" value={cp.timestamp} />
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{cp.note}</p>
              </div>
            ) : null}
          </Panel>

          <Panel>
            <SectionHeading
              eyebrow="Prove it yourself"
              title="Inclusion proof"
              description="Give a receipt id. You get the leaf hash, the sibling path and the signed root. Recompute upward; if it matches, that receipt is in this exact tree."
            />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                placeholder="psi_…"
                className="flex-1 rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/50"
              />
              <button
                type="button"
                onClick={() => setQuery(receiptId.trim())}
                className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/20"
              >
                Fetch proof
              </button>
            </div>

            {proof.isFetching ? (
              <p className="mt-6 font-mono text-xs text-muted-foreground">Walking the tree…</p>
            ) : query && proof.data === null ? (
              <p className="mt-6 font-mono text-xs text-warning">
                No leaf carries that receipt id.
              </p>
            ) : proof.data ? (
              <div className="mt-6">
                <FieldRow label="Leaf index" value={String(proof.data.leafIndex)} />
                <FieldRow label="Leaf hash" value={proof.data.leafHash} />
                <FieldRow label="Tree size" value={String(proof.data.treeSize)} />
                <FieldRow label="Root" value={proof.data.rootHash} tone="success" />
                <FieldRow
                  label="Path"
                  value={proof.data.path.length ? `${proof.data.path.length} sibling hash(es)` : "single leaf"}
                />
                <CopyBlock
                  className="mt-5"
                  label="proof.json"
                  value={JSON.stringify(proof.data, null, 2)}
                />
              </div>
            ) : null}
          </Panel>
        </div>

        <HonestyNote>
          A transparency log proves what was recorded and that the record has not been reordered or
          removed. It does not prove that any sealed statement is true. Integrity proven. Truth not
          verified.
        </HonestyNote>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Machine surface"
          title="Fetch it without us"
          description="Every endpoint is public, unauthenticated and signed with the seal of state."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <CopyBlock
            label="Signed checkpoint (JSON)"
            value="curl https://sovereign-ai.services/api/public/v1/checkpoint"
          />
          <CopyBlock
            label="C2SP tlog-checkpoint (text)"
            value="curl 'https://sovereign-ai.services/api/public/v1/checkpoint?format=text'"
          />
          <CopyBlock
            label="Inclusion proof"
            value="curl https://sovereign-ai.services/api/public/v1/proof/{receipt_id}"
          />
          <CopyBlock
            label="Nation public key (JWKS)"
            value="curl https://sovereign-ai.services/api/public/v1/jwks.json"
          />
        </div>
      </Section>
    </>
  );
}
