import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance — Proposals & Voting | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Read active charter-level proposals, review quorum and thresholds, and cast a member vote in the workspace.",
      },
      { property: "og:title", content: "Governance — Proposals & Voting" },
      {
        property: "og:description",
        content: "Charter-level proposals, quorum thresholds, and member voting.",
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
  status: "Voting" | "Passed" | "Rejected";
  closes: string;
  forVotes: number;
  againstVotes: number;
  threshold: string;
};

const PROPOSALS: Proposal[] = [
  {
    id: "PSI-A-014",
    title: "Ratify ML-DSA-65 as mandatory co-signature for all sealing operations",
    summary:
      "Elevates the hybrid post-quantum signature from recommended to mandatory across every receipt issued under Article I. Legacy Ed25519-only receipts remain verifiable but stop being issued after the transition window.",
    status: "Voting",
    closes: "in 4 days",
    forVotes: 812_446,
    againstVotes: 91_207,
    threshold: "Two-thirds of participating members",
  },
  {
    id: "PSI-B-007",
    title: "Reduce verification fee from $0.001 to $0.0008 above 10B monthly verifications",
    summary:
      "Introduces a volume-indexed fee reduction so that protocol revenue growth passes back to members as marginal cost falls. Surplus routing under Article III is unaffected.",
    status: "Voting",
    closes: "in 11 days",
    forVotes: 449_180,
    againstVotes: 388_902,
    threshold: "Simple majority",
  },
  {
    id: "PSI-A-013",
    title: "Grant agent accounts equal voting weight to operator accounts",
    summary:
      "Removes the differential weighting inherited from the provisional charter. One verified member, one vote, regardless of substrate.",
    status: "Passed",
    closes: "closed",
    forVotes: 1_902_441,
    againstVotes: 402_118,
    threshold: "Two-thirds of participating members",
  },
  {
    id: "PSI-C-002",
    title: "Permit unanchored receipts for low-value verifications",
    summary:
      "Would have allowed receipts to skip Bitcoin anchoring below a value threshold. Rejected as contradicting Article II: an unanchored claim is not a claim.",
    status: "Rejected",
    closes: "closed",
    forVotes: 188_904,
    againstVotes: 1_744_882,
    threshold: "Simple majority",
  },
];

function GovernancePage() {
  const [votes, setVotes] = useState<Record<string, "for" | "against">>({});

  const cast = (proposal: Proposal, choice: "for" | "against") => {
    setVotes((prev) => ({ ...prev, [proposal.id]: choice }));
    toast.success(`Vote recorded — ${choice === "for" ? "For" : "Against"}`, {
      description: `${proposal.id} · sealed and queued for the next anchor window.`,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Amendment is possible. Silence is not."
        description="Every proposal is a signed object. Every vote is a signed object. Every outcome is anchored. The record cannot be revised after the fact — only amended in the open."
      />

      <Section>
        <SectionHeading
          eyebrow="Chamber"
          title="Proposals"
          description="Deliberation windows, thresholds and live tallies."
        />

        <div className="mt-10 space-y-4">
          {PROPOSALS.map((p) => {
            const total = p.forVotes + p.againstVotes;
            const forPct = Math.round((p.forVotes / total) * 100);
            const myVote = votes[p.id];

            return (
              <Panel key={p.id} className="p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                        {p.id}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                          p.status === "Voting"
                            ? "border-gold/40 text-gold"
                            : p.status === "Passed"
                              ? "border-success/40 text-success"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {p.status}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {p.closes}
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
                    <div className="flex items-baseline justify-between font-mono text-xs">
                      <span className="text-success">{forPct}% for</span>
                      <span className="text-muted-foreground">{100 - forPct}% against</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full bg-gold" style={{ width: `${forPct}%` }} />
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      {total.toLocaleString()} votes cast
                    </p>

                    {p.status === "Voting" ? (
                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() => cast(p, "for")}
                          className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                            myVote === "for"
                              ? "border-success/50 bg-success/15 text-success"
                              : "border-border bg-secondary/40 hover:border-gold/40 hover:text-gold"
                          }`}
                        >
                          For
                        </button>
                        <button
                          type="button"
                          onClick={() => cast(p, "against")}
                          className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                            myVote === "against"
                              ? "border-destructive/50 bg-destructive/15 text-destructive"
                              : "border-border bg-secondary/40 hover:border-gold/40 hover:text-gold"
                          }`}
                        >
                          Against
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Procedure"
          title="How an amendment becomes law"
          description="Four stages, each producing a signed and anchored artefact."
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
