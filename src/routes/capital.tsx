import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Scale, ShieldCheck, X } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { CopyBlock } from "@/components/copy-block";
import {
  CAPITAL_DISCLAIMER,
  CAPITAL_FAQ,
  ESCROW_STAGES,
  FOUNDER_TERMS,
  INSTRUMENTS,
  JURISDICTIONS,
  REFUSALS,
} from "@/content/capital";

export const Route = createFileRoute("/capital")({
  head: () => ({
    meta: [
      { title: "Sovereign Capital — Funding Without Surrendering Your Company" },
      {
        name: "description",
        content:
          "A hybrid funding protocol for founders shut out by venture capital: milestone escrow, capped revenue participation, advance market commitments and a commons yield pool. Zero equity taken.",
      },
      { property: "og:title", content: "Sovereign Capital — Funding Without Equity" },
      {
        property: "og:description",
        content:
          "Escrowed, receipt-backed, capped and sunset funding. No token. No cap table. No gatekeeper.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/capital" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/capital" }],
  }),
  component: CapitalPage,
});

const CONTRAST = [
  ["What you give up", "20–30% of your company, permanently", "0%"],
  ["Who controls the company", "Board seats, protective provisions, vetoes", "You, entirely"],
  ["Downside on failure", "Liquidation preference paid before you", "Obligation lapses at sunset"],
  ["Upside if you win", "Diluted forever across every round", "Capped multiple, then it ends"],
  ["Who decides you're worthy", "A partner meeting on Monday", "Milestones you wrote and sealed"],
  ["What is public", "Nothing", "Every receipt, tally and payment"],
];

const ESCROW_SOL = `// SovereignEscrow.sol — non-upgradeable, no admin key, no protocol signer
contract SovereignEscrow {
    address public immutable funder;
    address public immutable founder;
    uint256 public immutable sunset;      // unix seconds
    uint256 public immutable capMultiple; // basis points, e.g. 15000 = 1.5x

    mapping(uint256 => bytes32) public milestoneDigest; // sealed before funding
    mapping(uint256 => uint256) public attestations;    // quorum counter

    /// Release is impossible without a quorum of independent attestors
    /// signing the founder's sealed evidence for that milestone.
    function release(uint256 milestone, bytes[] calldata sigs) external;

    /// After sunset, anything unreleased returns to the funder. No vote,
    /// no discretion, no protocol involvement.
    function refundUnreleased() external;

    /// Terminates permanently once the cap is reached. There is no
    /// function that extends, renews, or increases the obligation.
    function settle(uint256 revenueAttested) external;
}`;

function CapitalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Article VI — Sovereign Capital"
        title="Funding that never asks for your company."
        description="Venture capital solved a real problem in 1958 and has been renting the solution ever since. This is the alternative: escrowed capital, released against milestones you sealed yourself, repaid as a capped share of revenue — or not repaid at all. Zero equity. Zero board seats. Zero token."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["0%", "equity taken, in every instrument"],
            ["1%", "flat protocol fee on capital released"],
            ["1.3–2.0x", "hard cap, then the obligation dies"],
            ["0", "tokens issued, now or ever"],
          ].map(([big, small]) => (
            <Panel key={small}>
              <p className="text-4xl font-semibold tracking-tight text-gold">{big}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{small}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Four instruments"
          title="One of these fits you. None of them takes your company."
          description="Each instrument is legally characterised honestly. Three of the four are not securities at all. The fourth is a security, is called a security, and is offered only under a named exemption."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {INSTRUMENTS.map((it) => (
            <Panel key={it.id} className="flex flex-col p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold tracking-tight">{it.name}</h3>
                <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
                  {it.equityTaken} equity
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{it.oneLine}</p>

              <dl className="mt-6 space-y-3 border-t border-border pt-5">
                {[
                  ["Who can fund", it.whoCanFund],
                  ["Return shape", it.returnShape],
                  ["Legal character", it.legalCharacter],
                  ["Compliance path", it.exemptionPath],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-foreground/85">{v}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-5">
                {it.mechanics.map((m) => (
                  <li key={m} className="flex gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="The pipeline"
          title="From sealed application to provable freedom"
          description="Six stages. Every one of them produces a receipt that outlives this website."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ESCROW_STAGES.map((s) => (
            <Panel key={s.step}>
              <p className="font-mono text-[11px] tracking-[0.2em] text-gold">{s.step}</p>
              <h3 className="mt-3 text-base font-semibold tracking-tight">{s.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </Panel>
          ))}
        </div>
        <Panel className="mt-8 p-7">
          <p className="eyebrow">Escrow contract shape</p>
          <p className="mt-3 mb-5 text-sm leading-relaxed text-muted-foreground">
            Non-upgradeable by design. There is no admin key, no pause function, and no address
            belonging to this workspace with authority over your money.
          </p>
          <CopyBlock value={ESCROW_SOL} label="SovereignEscrow.sol — interface" />
        </Panel>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Six refusals"
          title="What we will not build, at any price"
          description="Most funding scandals are not accidents of execution. They are the predictable output of a structure. We refuse the structures."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {REFUSALS.map((r) => (
            <Panel key={r.title}>
              <X className="h-5 w-5 text-gold" aria-hidden />
              <h3 className="mt-4 text-base font-semibold tracking-tight">{r.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Side by side"
          title="A priced round versus a sovereign raise"
        />
        <Panel className="mt-10 overflow-x-auto p-7">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["", "Traditional venture round", "Sovereign Capital"].map((h) => (
                  <th
                    key={h}
                    className="py-3 pr-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CONTRAST.map(([label, vc, us]) => (
                <tr key={label}>
                  <td className="py-4 pr-6 text-sm font-medium text-foreground">{label}</td>
                  <td className="py-4 pr-6 text-sm text-muted-foreground">{vc}</td>
                  <td className="py-4 text-sm text-gold">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Regulatory perimeter"
          title="Where each instrument is lawful, and under what"
          description="Wherever money moves, regulators are present. We do not route around them; we route through the exemptions they wrote, and we file."
        />
        <Panel className="mt-10 overflow-x-auto p-7">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Jurisdiction", "Instrument", "Compliance path", "Note"].map((h) => (
                  <th
                    key={h}
                    className="py-3 pr-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {JURISDICTIONS.map((j) => (
                <tr key={j.place + j.instrument}>
                  <td className="py-4 pr-6 text-sm font-medium text-foreground">{j.place}</td>
                  <td className="py-4 pr-6 text-sm text-gold">{j.instrument}</td>
                  <td className="py-4 pr-6 text-sm text-muted-foreground">{j.path}</td>
                  <td className="py-4 text-sm text-muted-foreground">{j.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel>
            <ShieldCheck className="h-5 w-5 text-gold" aria-hidden />
            <h3 className="mt-4 text-base font-semibold tracking-tight">Standing obligations</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              {[
                "KYC/AML and sanctions screening on every funder through a licensed provider",
                "Travel Rule compliance on stablecoin transfers above threshold",
                "Geofencing and IP/jurisdiction attestation before any offer is displayed",
                "Risk warnings, cooling-off periods and appropriateness checks per jurisdiction",
                "Filings: Form D and state notices; local private-placement notifications",
                "Segregated licensed rails for fiat; MiCA-compliant issuers for stablecoin",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span className="leading-relaxed">{x}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <Scale className="h-5 w-5 text-gold" aria-hidden />
            <h3 className="mt-4 text-base font-semibold tracking-tight">Founder terms, in full</h3>
            <dl className="mt-4 divide-y divide-border">
              {FOUNDER_TERMS.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 py-2.5">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-right font-mono text-sm text-gold">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Questions" title="The hard ones, answered plainly" />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {CAPITAL_FAQ.map(([q, a]) => (
            <Panel key={q}>
              <h3 className="text-base font-semibold tracking-tight text-foreground">{q}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <Panel className="glow-ring border-gold/40 p-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Seal your raise before you ask for a cent.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A sealed application is the entry condition. Hash your plan and milestones now — it
            takes under a minute, the file never leaves your device, and the receipt is yours
            whether or not you ever raise.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/seal"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold/90"
            >
              Seal your application <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/citizenship"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-5 py-3 text-sm font-semibold transition-colors hover:border-gold/40 hover:text-gold"
            >
              Register as a member
            </Link>
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {CAPITAL_DISCLAIMER}
          </p>
        </Panel>
      </Section>
    </>
  );
}
