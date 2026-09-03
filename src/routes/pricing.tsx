import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { ARTICLE3_STATUS, CUSTODY_FENCE } from "@/content/legal";

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
    "No. None exist, none are planned on this page, and nothing on this platform is chargeable. There is no payment processor connected to it.",
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
