import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { FEES, SCALE_MODEL } from "@/content/nation";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Fractions of a Cent, at Planetary Scale | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Transparent microtransaction pricing: $0.001 per verification, $0.01 per Bitcoin anchor, $0.10 per compliance check, 0.1% of routed surplus.",
      },
      { property: "og:title", content: "Pricing — Sovereign AI Services" },
      {
        property: "og:description",
        content: "No subscriptions. No rent. Metered protocol fees published in the open.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
  component: PricingPage,
});

const TIERS = [
  {
    name: "Citizen",
    price: "Free",
    cadence: "forever",
    description:
      "Full constitutional standing. Verify anything, vote on everything, pay only for metered actions.",
    features: [
      "Citizenship registration and voting rights",
      "Unlimited permissionless local verification",
      "10,000 metered API verifications / month",
      "Public receipt explorer access",
      "Community support",
    ],
    cta: "Register as citizen",
    to: "/citizenship" as const,
    highlight: false,
  },
  {
    name: "Sovereign",
    price: "$0.001",
    cadence: "per verification, metered",
    description:
      "For nation-state founders running production infrastructure on the protocol. Pay only for what the world actually uses.",
    features: [
      "Everything in Citizen",
      "Unlimited nation-state deployments",
      "Bitcoin anchoring at $0.01 per anchor",
      "Compliance checks at $0.10 per check",
      "Surplus routing under Article III (0.1%)",
      "Priority settlement windows",
    ],
    cta: "Deploy a nation-state",
    to: "/deploy" as const,
    highlight: true,
  },
  {
    name: "Institution",
    price: "Custom",
    cadence: "volume-indexed",
    description:
      "For regulators, exchanges and platforms verifying at planetary volume with sector-specific conformity duties.",
    features: [
      "Everything in Sovereign",
      "Volume-indexed fee reductions",
      "Dedicated anchor windows",
      "Sector protocol authoring rights",
      "Regulator-grade audit exports",
      "Named protocol liaison",
    ],
    cta: "Read the API docs",
    to: "/docs" as const,
    highlight: false,
  },
];

const FAQ = [
  [
    "Why is verification not free?",
    "Local, permissionless verification is free and always will be — the math is public. The fee covers metered API infrastructure and the anchoring that makes claims settlement-grade.",
  ],
  [
    "Are there subscriptions or seats?",
    "No. Seat-based pricing taxes access. The protocol taxes usage, which means an idle account costs nothing and a useful one pays proportionally.",
  ],
  [
    "What does 0.1% surplus routing mean?",
    "Article III routes surplus above a declared sufficiency floor. Ten basis points of routed value funds the protocol. No spread, no float, no custody.",
  ],
  [
    "Can fees change?",
    "Only by constitutional amendment, voted by citizens and anchored to Bitcoin. Prices cannot be raised quietly.",
  ],
];

function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Fractions of a cent. Multiplied by the whole world."
        description="The old system charges rent for access. This one charges a metered fee for a mathematical service, published in the open and changeable only by vote."
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <Panel
              key={tier.name}
              className={`flex flex-col p-8 ${tier.highlight ? "glow-ring border-gold/40" : ""}`}
            >
              {tier.highlight ? (
                <span className="mb-5 self-start rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
                  Most deployed
                </span>
              ) : null}
              <h2 className="text-lg font-semibold tracking-tight">{tier.name}</h2>
              <p className="mt-5 text-4xl font-semibold tracking-tight text-gold">{tier.price}</p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {tier.cadence}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {tier.description}
              </p>
              <ul className="mt-7 flex-1 space-y-3.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={tier.to}
                className={`mt-8 inline-flex justify-center rounded-md px-5 py-3 text-sm font-semibold transition-colors ${
                  tier.highlight
                    ? "bg-gold text-primary-foreground hover:bg-gold/90"
                    : "border border-border bg-secondary/40 hover:border-gold/40 hover:text-gold"
                }`}
              >
                {tier.cta}
              </Link>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Metered schedule"
          title="Every protocol action, priced in the open"
          description="Identical for every citizen, from a single developer to a central bank."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEES.map((fee) => (
            <Panel key={fee.label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {fee.label}
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-gold">{fee.price}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {fee.unit}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{fee.note}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Scale model"
          title="What the arithmetic implies"
          description="Assumes 300 verifications per citizen per month at the published rate."
        />
        <Panel className="mt-10 overflow-x-auto p-7">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Horizon", "Annual verifications", "Annual protocol revenue"].map((h) => (
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
              {SCALE_MODEL.map((row) => (
                <tr key={row.horizon}>
                  <td className="py-4 pr-6 text-sm font-medium text-foreground">{row.horizon}</td>
                  <td className="py-4 pr-6 font-mono text-sm text-muted-foreground">
                    {row.verifications}
                  </td>
                  <td className="py-4 font-mono text-sm text-gold">{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
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
