import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { ARTICLE3_STATUS, CUSTODY_FENCE } from "@/content/legal";
import { submitPilotRequest } from "@/lib/pilot.functions";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Free, Keyless, No Account | Sovereign AI Services" },
      {
        name: "description",
        content:
          "There is nothing to buy. Sealing, verification, Bitcoin anchoring and reading the public ledger are free, keyless and need no account. Paid tiers and the metered schedule were withdrawn on 3 September 2026.",
      },
      { property: "og:title", content: "Pricing — Sovereign AI Services" },
      {
        property: "og:description",
        content: "No plans, no tiers, no subscriptions, no charges. The platform is free to use.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
  component: PricingPage,
});

// COMMERCE IS WITHDRAWN FROM THIS PLATFORM.
//
// Earlier versions of this page listed plans, a metered schedule and a revenue
// scale model. None of it was ever chargeable: there is no payment processor, no
// quota meter and no settlement queue. Rather than keep publishing prices for
// things that are not sold, the whole commercial layer is withdrawn. The platform
// is free.

const FREE_CAPABILITIES = [
  "Seal a digest and publish the receipt to the public record",
  "Verify any receipt locally, offline, with no account",
  "Submit an OpenTimestamps Bitcoin anchor",
  "Read the full public ledger and the public API",
  "Register a workspace in the public registry",
  "Mirror the entire record layer",
];

const FAQ = [
  [
    "What does it cost?",
    "Nothing. Sealing, verification, anchoring and reading the ledger are free, keyless and need no account. Local verification is free permanently because the maths is public and needs nothing from us.",
  ],
  [
    "Are there subscriptions, seats, plans or tiers?",
    "Not today. Nothing on this platform is chargeable and no payment processor is connected. Workspace features for teams are in design — see the roadmap below — and no price has been set.",
  ],
  [
    "What happened to the published fee schedule?",
    "It was withdrawn on 3 September 2026 and recorded as a correction on the amendments page. Publishing prices for a service nobody can buy told readers less than saying plainly that the platform is free.",
  ],
  [
    "What does Article III say, then?",
    "Article III is sealed charter text describing routing of surplus. It is not machinery: no value has ever been routed, no routing meter exists, and nothing is charged. Changing sealed text requires an amendment under /amendments.",
  ],
];

const ROADMAP = [
  {
    status: "Available today",
    title: "Free workspace",
    audience: "Single operators and small teams",
    items: [
      "Local, in-browser sealing for one operator",
      "Offline verification with no account",
      "Read the public commons ledger",
      "Basic entry in the public registry",
    ],
    note: "Free, keyless, accountless — and permanent.",
  },
  {
    status: "In design — not available yet",
    title: "Team & agent workspace",
    audience: "Organisations running AI agents",
    items: [
      "Deploy and manage multiple autonomous AI agent identities",
      "Webhook pipelines for continuous sealing of model decisions",
      "Exportable compliance vaults for audits",
    ],
    note: "No price published. No payment taken. Nothing to buy today.",
  },
  {
    status: "In design — not available yet",
    title: "Dedicated organisational node",
    audience: "Regulated and multi-team institutions",
    items: [
      "Dedicated namespace on this platform",
      "Custom governance charters with multi-signature controls",
      "Unlimited team seats and high-frequency agent event pipelines",
    ],
    note: "No price published. No payment taken. Nothing to buy today.",
  },
];

function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="There is nothing to buy"
        description="Sealing, verification, Bitcoin anchoring and reading the public ledger are free, keyless and need no account."
      />

      <Section className="pb-0 pt-10">
        <Panel className="border-warning/40 bg-warning/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
            Paid tiers withdrawn · 3 September 2026
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            Every paid tier, subscription and published price has been withdrawn from this platform.
            No payment processor is connected, no quota is enforced, and no invoice can be issued
            from this site. Everything the platform does is free at the point of use, for everyone,
            without an account or a key. The withdrawal is recorded as a correction on the{" "}
            <Link to="/amendments" className="text-gold hover:underline">
              amendments record
            </Link>
            .
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">{ARTICLE3_STATUS}</p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">{CUSTODY_FENCE}</p>
        </Panel>
      </Section>

      <Section>
        <Panel className="glow-ring flex flex-col border-gold/40 p-8">
          <span className="mb-5 self-start rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
            Available today
          </span>
          <h2 className="text-lg font-semibold tracking-tight">Everything on this platform</h2>
          <p className="mt-5 text-4xl font-semibold tracking-tight text-gold">Free</p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            keyless, accountless, for everyone
          </p>
          <ul className="mt-7 grid flex-1 gap-3.5 sm:grid-cols-2">
            {FREE_CAPABILITIES.map((f) => (
              <li key={f} className="flex gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/deploy"
            className="mt-8 inline-flex self-start justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold/90"
          >
            Seal &amp; register a workspace
          </Link>
        </Panel>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          There are no plans, tiers, seats or entitlements, and no schedule of charges. Earlier
          versions of this page listed both. They are deleted rather than relabelled.
        </p>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Protocol vs platform"
          title="Two sites, two different jobs"
          description="APEX PSI is the open standard and its high-volume sealing service. Sovereign AI Services is the free workspace, registry and audit layer built on top of it."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Panel className="p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
              APEX PSI · ai-governance-standard.com
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>Canonical protocol specification and receipt format</li>
              <li>High-volume API sealing for developers</li>
              <li>Paid API plans are offered there, by that service, under its own terms</li>
            </ul>
            <a
              href="https://ai-governance-standard.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block text-sm text-gold hover:underline"
            >
              Visit the protocol site →
            </a>
          </Panel>
          <Panel className="p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
              Sovereign AI Services · this site
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>Workspaces, public registry and agent credentials</li>
              <li>Ledger reading, verification and audit views</li>
              <li>Free, keyless, no account — nothing is sold here</li>
            </ul>
          </Panel>
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {FAQ.map(([q, a]) => (
            <Panel key={q}>
              <h3 className="text-base font-semibold tracking-tight text-foreground">{q}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}
