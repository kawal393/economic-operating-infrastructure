import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { getLedgerEntry } from "@/lib/ledger.functions";

export const Route = createFileRoute("/r/$receiptId")({
  loader: async ({ params }) => {
    const entry = await getLedgerEntry({ data: { receiptId: params.receiptId } });
    if (!entry) throw notFound();
    return entry;
  },
  head: ({ loaderData, params }) => {
    const id = params.receiptId;
    const digest = loaderData?.content_hash ?? "";
    const title = `Proof ${id} — Sealed & Chained | Sovereign AI Services`;
    const description = loaderData
      ? `Apex PSI receipt ${id} was sealed on ${new Date(loaderData.created_at).toUTCString()}, appended at chain position #${loaderData.sequence} and anchored to Bitcoin (${loaderData.anchor_status}). Digest ${digest.slice(0, 24)}…`
      : `Apex PSI receipt ${id} on the public notarisation ledger.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `Proof ${id} — verifiable by anyone` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/r/${id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/r/${id}` }],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CreativeWork",
                name: `Apex PSI proof ${id}`,
                identifier: id,
                dateCreated: loaderData.created_at,
                publisher: { "@type": "Organization", name: "Sovereign AI Services" },
                description,
              }),
            },
          ]
        : [],
    };
  },
  component: ProofPage,
  notFoundComponent: () => (
    <Section>
      <Panel className="p-8 text-sm text-muted-foreground">
        No ledger entry carries that receipt identifier.{" "}
        <Link to="/ledger" className="text-gold">
          Browse the chain →
        </Link>
      </Panel>
    </Section>
  ),
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/60 py-3 last:border-0">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}

function ProofPage() {
  const entry = Route.useLoaderData();
  const badge = `<a href="https://sovereign-ai.services/r/${entry.receipt_id}"><img src="https://sovereign-ai.services/api/public/badge/${entry.content_hash}" alt="Sealed on the Sovereign AI ledger" height="28" /></a>`;

  return (
    <>
      <PageHeader
        eyebrow={`Chain position #${entry.sequence}`}
        title="This artefact carries its own proof."
        description="Integrity is proven: the content that produced this digest has not changed since it was sealed. Truth is not proven — no ledger can do that, and any that claims to is lying."
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel className="p-7">
            <dl>
              <Row label="Receipt ID" value={entry.receipt_id} />
              <Row label="Content digest (SHA-256)" value={entry.content_hash} />
              <Row label="Chain hash" value={entry.chain_hash} />
              <Row label="Prior hash" value={entry.prior_hash ?? "genesis"} />
              <Row label="Signing key (Ed25519)" value={entry.public_key} />
              <Row label="Sealed at" value={new Date(entry.created_at).toUTCString()} />
              <Row label="Bitcoin anchor" value={entry.anchor_status} />
            </dl>
          </Panel>

          <div className="space-y-4">
            <Panel className="p-6 text-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Verify it yourself</p>
              <p className="mt-3 text-muted-foreground">
                Do not trust this page. Recompute the digest and check the signature — online, or with the
                zero-dependency offline verifier that needs no network and no permission.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/verify"
                  className="rounded-md border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold"
                >
                  Verify online
                </Link>
                <a
                  href="/offline-verifier.html"
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
                >
                  Offline verifier
                </a>
              </div>
            </Panel>

            <Panel className="p-6 text-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Embed the badge</p>
              <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-background p-3 text-[10px] leading-relaxed text-muted-foreground">
                {badge}
              </pre>
              <Link to="/amplify" className="mt-3 inline-block text-xs font-semibold text-gold">
                Open the propagation console →
              </Link>
            </Panel>
          </div>
        </div>
      </Section>
    </>
  );
}
