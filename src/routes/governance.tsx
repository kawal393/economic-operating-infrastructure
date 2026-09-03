import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance — Amendment Procedure | Sovereign AI Services" },
      {
        name: "description",
        content:
          "The amendment procedure of the charter: stages, thresholds and specimen proposal objects. Nothing here is a result — the live record is at /amendments, and it is public.",
      },
      { property: "og:title", content: "Governance — Amendment Procedure" },
      {
        property: "og:description",
        content: "Amendment stages, thresholds and specimen proposals. The live record is at /amendments: currently empty — version 1 stands unamended.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/governance" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/governance" }],
  }),
  component: GovernancePage,
});

type Proposal = {
  id: string;
  title: string;
  summary: string;
  threshold: string;
  basis: string;
};

// SPECIMENS. No ballot has ever opened on this platform, so no specimen carries a
// tally, a result or a closing date. Where a subject below is already in force, it
// is in force as published policy and as the way the sealing engine is built - not
// because anyone voted on it.
const PROPOSALS: Proposal[] = [
  {
    id: "PSI-A-014",
    title: "Ratify ML-DSA-65 as mandatory co-signature for all sealing operations",
    summary:
      "The hybrid post-quantum signature as a mandatory co-signature on every receipt issued under Article I. Legacy Ed25519-only receipts remain verifiable but stop being issued after the transition window.",
    threshold: "Two-thirds of participating members",
    basis:
      "In force as built — the sealing engine already co-signs with ML-DSA-65. Never ratified by a vote, because no vote has taken place.",
  },
  {
    id: "PSI-B-007",
    title: "Volume-indexed reduction of any future metered charge",
    summary:
      "A volume-indexed fee reduction, so that protocol revenue growth passes back to members as marginal cost falls. Surplus routing under Article III would be unaffected.",
    threshold: "Simple majority",
    basis:
      "Specimen format — never tabled, never voted. No charge exists to reduce: paid tiers were withdrawn on 3 September 2026 and the platform is free.",
  },
  {
    id: "PSI-A-013",
    title: "Grant agent accounts equal voting weight to operator accounts",
    summary:
      "Would remove differential weighting from the provisional charter. One verified member, one vote, regardless of substrate.",
    threshold: "Two-thirds of participating members",
    basis: "Specimen format — never tabled, never voted. No member has ever cast anything.",
  },
  {
    id: "PSI-C-002",
    title: "Permit unanchored receipts for low-value verifications",
    summary:
      "Would allow receipts to skip Bitcoin anchoring below a value threshold. Article II already forbids it: an unanchored claim is not a claim.",
    threshold: "Simple majority",
    basis:
      "Specimen format — never tabled, never voted. Shown as an example of what a rejected amendment would look like, not as a rejection that happened.",
  },
];

function GovernancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Amendment is possible. Silence is not."
        description="Every proposal will be a signed object. Every vote will be a signed object. Every outcome will be anchored. Nothing on this page is a result — it is the procedure, and the live record sits elsewhere, in public."
      />

      <Section>
        <SectionHeading
          eyebrow="Chamber"
          title="Specimens, not results"
          description="The format a proposal carries and the threshold it must clear. No tally is printed, because nothing here has ever been voted on."
        />

        <div className="mt-10 space-y-4">
          {PROPOSALS.map((p) => (
            <Panel key={p.id} className="p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                      {p.id}
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Specimen — not a result
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {p.summary}
                  </p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Threshold — {p.threshold}
                  </p>
                </div>

                <div className="w-full max-w-xs">
                  <div className="rounded-lg border border-gold/40 bg-gold/5 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                      Status of this object
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-foreground">{p.basis}</p>
                    <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                      0 votes cast · no tally exists · no result claimed
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        <Panel className="mt-8 border-gold/40 bg-gold/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
            Modelled chamber — read this before anything above
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            No ballot has ever opened on this page and nothing printed here is a result. An
            earlier version of it carried illustrative tallies, closing dates, and For / Against
            buttons that confirmed your vote as “sealed and queued for the next anchor window”.
            Nothing was sealed and nothing was queued; those buttons only changed what the page
            showed you. They are removed, because a page must never claim a cryptographic act it
            did not perform. The working machinery lives at{" "}
            <Link to="/amendments" className="text-gold underline underline-offset-2">
              /amendments
            </Link>
            : each submission carries a digest of its exact text, deliberation runs fourteen days,
            a vote requires a signed-in member, and the record is public and permanent. That
            record is currently empty — version 1 of the charter stands unamended, which is itself
            a fact worth printing rather than decorating. Where a subject above is already in
            force — the hybrid post-quantum co-signature — it is in force
            as published policy and as the way the sealing engine is built, not as the result of a
            vote. When a ballot does open, every vote will be a signed object and every outcome
            anchored to Bitcoin. Until then this page prints rules, not results.
          </p>
        </Panel>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Procedure"
          title="How an amendment becomes law"
          description="Four stages, each producing a signed and anchored artefact — as specified. Not yet exercised: no proposal has reached stage 01 on this platform."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01 — Draft", "Any member submits a signed proposal object naming the Article it touches."],
            ["02 — Deliberation", "A fixed window opens. Objections are recorded as signed dissent, never deleted."],
            ["03 — Vote", "Tally runs against the declared threshold. Abstentions do not count toward quorum."],
            ["04 — Anchor", "The outcome is sealed, anchored to Bitcoin and becomes protocol law at the next epoch."],
          ].map(([title, body]) => (
            <Panel key={title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">{title}</p>
              <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}
