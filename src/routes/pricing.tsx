import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { ARTICLE3_STATUS, CUSTODY_FENCE } from "@/content/legal";
import { FEES, SCALE_MODEL } from "@/content/nation";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Fractions of a Cent, at Planetary Scale | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Published microtransaction schedule: $0.001 per verification, $0.01 per Bitcoin anchor, $0.10 per compliance check. Nothing is chargeable yet: no payment processor is connected, so every action on the platform is currently free at the point of use.",
      },
      { property: "og:title", content: "Pricing — Sovereign AI Services" },
      {
        property: "og:description",
        content: "No subscriptions. No rent. A published fee schedule that is not yet chargeable.",
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
    name: "Member",
    price: "Free",
    cadence: "forever",
    description:
      "Full charter-level standing. Verify anything, vote on everything, pay only for metered actions.",
    features: [
      "Registry membership registration and voting rights",
      "Unlimited permissionless local verification",
      "Public API verification — no quota is enforced today",
      "Public receipt explorer access",
      "Community support",
    ],
    cta: "Register as member",
    to: "/registry-join" as const,
    highlight: false,
  },
  {
    name: "Sovereign",
    price: "$0.001",
    cadence: "per verification, metered",
    description:
      "For workspace founders running production infrastructure on the protocol. Pay only for what the world actually uses.",
    features: [
      "Everything in Member",
      "Unlimited workspace deployments",
      "Bitcoin anchoring at $0.01 per anchor",
      "Compliance checks at $0.10 per check",
      "Surplus routing under Article III (0.1%) — charter text, not operational",
      "Priority settlement windows",
    ],
    cta: "Deploy a workspace",
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
    "It is what Article III says the protocol would charge if surplus were routed. It is charter text, not machinery: no value has ever been routed, no routing meter exists, and nothing is charged. No spread, no float, no custody.",
  ],
  [
    "Can fees change?",
    "Two different answers, because two different things are priced. The ten-basis-point figure in Article III is sealed charter text and can only change by amendment under /amendments. The metered prices on this page are published in the site source; today the operator can change them, and no fee has ever been put to a member ballot. This page is where any change would appear.",
  ],
  [
    "Can I buy any of this right now?",
    "No. No payment processor is connected to the platform, no plan is chargeable and no invoice can be issued from this site. Every action available today — sealing, verification, anchoring, reading the ledger — is free at the point of use. The schedule is published so the price is known before it is ever charged, not because it is being charged.",
  ],
];

function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Fractions of a cent. Multiplied by the whole world."
        description="The old system charges rent for access. This one publishes a metered fee for a mathematical service — in the open, before it is ever charged."
      />

      <Section className="pb-0 pt-10">
        <Panel className="border-warning/40 bg-warning/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
            Nothing on this page can be bought yet
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            No payment processor is connected to this platform. No plan below is chargeable, no
            quota is enforced, and no invoice can be issued from this site. Every action available
            today — sealing, verification, Bitcoin anchoring, reading the public ledger — is free at
            the point of use. The schedule is published so the price is known in advance rather than
            discovered later, which is the only honest order to do it in.
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">{ARTICLE3_STATUS}</p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">{CUSTODY_FENCE}</p>
        </Panel>
      </Section>

      <Section>
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <Panel
              key={tier.name}
              className={`flex flex-col p-8 ${tier.highlight ? "glow-ring border-gold/40" : ""}`}
            >
              {tier.highlight ? (
                <span className="mb-5 self-start rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
                  Metered tier
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
          description="Identical for every member, from a single developer to a central bank."
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
          description="Assumes 300 metered verifications per member per month at the published $0.001 rate. Modelled projections — not realised revenue."
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
