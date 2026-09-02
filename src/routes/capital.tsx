// WHY THIS PAGE WAS GUTTED
//
// Date: 3 September 2026.
//
// This route previously described four priced funding instruments, a flat
// protocol fee percentage, return multiples of 1.3x-2.0x, a Solidity escrow
// contract, a table of named securities exemptions (Reg D Rule 506(c), Form D,
// Reg S, FSMA s.21, the EU Prospectus Regulation, Corporations Act s.708 and
// MiCA), and present-tense claims that the operator performs KYC/AML screening,
// Travel Rule compliance, geofencing and regulatory filings.
//
// None of that machinery existed. The operator, Apex Intelligence Empire
// (ABN 71 672 237 795), holds no Australian Financial Services Licence and has
// no payment processor, escrow agent or custodian connected to this platform.
// Publishing that material to the general public is a financial promotion:
// s911A and s1041E of the Corporations Act 2001 (Cth) in Australia, and s21 of
// the Financial Services and Markets Act 2000 in the United Kingdom.
//
// The content was WITHDRAWN, not relabelled. Annotating an offer as
// "illustrative" does not make it lawful to publish without a licence.
//
// The route is deliberately kept alive so old links, crawlers, the sitemap and
// archived copies resolve to this notice rather than to nothing. This is not a
// deletion that was forgotten to be finished. DO NOT RESTORE THE OFFER.

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { ARTICLE3_STATUS, CUSTODY_FENCE } from "@/content/legal";

const TITLE = "No funding instrument is offered here | Sovereign AI Services";
const DESCRIPTION =
  "No security, token, investment opportunity or funding instrument is offered on this platform. The operator holds no financial services licence, and no payment processor, escrow agent or custodian is connected.";

export const Route = createFileRoute("/capital")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "No funding instrument is offered here" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WithdrawnPage,
});

const REMOVED = [
  "Four priced funding instruments, each with a named contribution range.",
  "A stated flat protocol fee expressed as a percentage of capital released.",
  "Return multiples on contributed funds.",
  "A milestone escrow contract, including its Solidity source.",
  "A jurisdiction and exemption table naming Reg D Rule 506(c), Form D, Reg S, FSMA s.21, the EU Prospectus Regulation, Corporations Act s.708 and MiCA.",
  "Present-tense claims that KYC/AML screening, Travel Rule compliance, geofencing, regulatory filings and licensed money-transmitter rails were in operation.",
];

const TRUE_POINTS = [
  "The operator holds no Australian Financial Services Licence and has never held one.",
  "No payment processor, escrow agent, custodian or money-transmitter is connected to this platform. There is no way to send money to it.",
  "Nothing described on the previous version of this page was ever built, deployed, filed or relied upon.",
  "No token exists, no token sale has occurred, and no security has been offered or issued by the operator.",
  "If this platform's operator ever raises funds, it will be done privately, through a lawyer and a licensed partner, under an exemption actually relied on — not advertised on a public page by a company with no licence.",
];

function WithdrawnPage() {
  return (
    <>
      <PageHeader
        eyebrow="Withdrawn — this page is not an offer"
        title="No funding instrument is offered on this platform"
        description="This page previously described funding instruments, their pricing and the legal routes said to permit them. Those descriptions were withdrawn on 3 September 2026 because the operator holds no financial services licence and none of the machinery described here was ever in place."
      />

      <Section>
        <Panel className="border-warning/35 bg-warning/5">
          <h2 className="text-lg font-semibold tracking-tight">What this page used to say</h2>
          <ul className="mt-5 space-y-3">
            {REMOVED.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-warning" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-foreground/85">
            None of that machinery existed at the time it was described.
          </p>
        </Panel>

        <Panel className="mt-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Why it was withdrawn rather than relabelled
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{CUSTODY_FENCE}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{ARTICLE3_STATUS}</p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/85">
            Relabelling an offer as illustrative does not make it lawful to publish it without a
            licence, so it was removed rather than annotated.
          </p>
        </Panel>

        <Panel className="mt-6">
          <h2 className="text-lg font-semibold tracking-tight">What is actually true</h2>
          <ol className="mt-5 space-y-4">
            {TRUE_POINTS.map((line, i) => (
              <li key={line} className="flex gap-4 text-sm leading-relaxed text-muted-foreground">
                <span className="font-mono text-[11px] text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/charter"
            className="rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
          >
            Read the Protocol Charter
          </Link>
          <Link
            to="/ledger"
            className="rounded-md border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Read the public ledger
          </Link>
        </div>
      </Section>
    </>
  );
}
