import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { ARTICLE3_STATUS, CUSTODY_FENCE } from "@/content/legal";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction Model — Nothing Is Charged | Sovereign AI Services" },
      {
        name: "description",
        content:
          "No transaction has ever been charged on this platform, and paid tiers were withdrawn on 3 September 2026. Sealing, verification, anchoring and reading the ledger are free. The live public ledger is the only record of what has actually happened.",
      },
      { property: "og:title", content: "Transaction Model" },
      {
        property: "og:description",
        content: "Nothing is charged on this platform. The public ledger is the record of record.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/transactions" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/transactions" }],
  }),
  component: TransactionsPage,
});

// NOTHING ON THIS PAGE IS METERED, SIMULATED OR STREAMED.
//
// This route used to render a “Transaction Dashboard” with headline counters, a
// revenue trend, a fee mix and a “live transaction stream”, all typed into the
// source. Those were deleted. A later version published a fee schedule and a
// revenue scale model instead; both were withdrawn on 3 September 2026 when paid
// tiers were withdrawn. The platform is free, and the live ledger is the only
// record of what has actually happened.

function TransactionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transaction model"
        title="No transaction has ever been charged on this platform"
        description="Paid tiers were withdrawn on 3 September 2026. Sealing, verification, Bitcoin anchoring and reading the public ledger are free, keyless and need no account."
      >
        <Link
          to="/ledger"
          className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
        >
          Open the live public ledger
        </Link>
      </PageHeader>

      <Section className="pb-0 pt-10">
        <Panel className="border-warning/40 bg-warning/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
            What this page used to claim
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            An earlier version of this route printed transaction volumes, protocol revenue, a
            revenue trend, a fee mix and a table headed “Live transaction stream” with settled rows
            carrying ids, amounts and timestamps. None of it came from a meter, a database or a
            payment. A later version replaced it with a published price list and a revenue model.
            Both are now withdrawn: the platform charges nothing, so publishing prices for it was
            itself misleading. The correction is recorded on the{" "}
            <Link to="/amendments" className="text-gold hover:underline">
              amendments record
            </Link>
            .
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">{CUSTODY_FENCE}</p>
        </Panel>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="What it costs"
          title="Nothing, to anyone"
          description="There is no payment processor, no quota meter, no settlement queue and no invoice. Every capability the platform actually runs is free at the point of use."
        />
        <Panel className="mt-10 p-7">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sealing a digest, verifying a receipt locally or through the public API, submitting an
            OpenTimestamps Bitcoin anchor, reading the ledger and mirroring the record layer all
            cost nothing and require no account and no key.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{ARTICLE3_STATUS}</p>
        </Panel>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="The actual record"
          title="What has happened is on the ledger"
          description="The public ledger counts this platform's own record layer, which is new. It is not a projection, and no figure on it is imported from any other system."
        />
        <Panel className="mt-10 p-7">
          <Link to="/ledger" className="text-sm font-medium text-gold hover:underline">
            Read the public ledger →
          </Link>
        </Panel>
      </Section>
    </>
  );
}
