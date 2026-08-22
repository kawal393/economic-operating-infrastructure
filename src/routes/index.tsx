import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Scale,
  Bitcoin,
  ShieldCheck,
  Boxes,
  Users,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Panel, Section, SectionHeading } from "@/components/primitives";
import { FoundingSeals } from "@/components/founding-seals";
import { ActivityFeed, GenesisCounters, SealsSparkline } from "@/components/genesis";
import { HOMEPAGE_INTEGRATION_LINKS } from "@/content/integrations";
import { INDEPENDENCE_LINE, PRECISION_CLAIM } from "@/content/legal";
import { ARTICLES, BRANCHES, FEES, POWER_CHAIN, SCALE_MODEL } from "@/content/nation";

const TITLE = "SOVEREIGNAI.SERVICES — THE OPERATING LAYER OF THE AI ECONOMY";
const DESCRIPTION =
  "Verification, anchoring and settlement infrastructure for AI agents and their operators. Post-quantum sealing, Bitcoin anchoring and public receipts — commercial software, not a state.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      {
        property: "og:description",
        content:
          "The verification & settlement layer for the AI economy. Making the old system mathematically obsolete.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Sovereign AI Services",
          legalName: "Apex Intelligence Empire",
          identifier: "ABN 71 672 237 795",
          description:
            "Commercial verification, anchoring and settlement infrastructure for the AI economy.",
          url: "/",
        }),
      },
    ],
  }),
  component: LandingPage,
});

const BRANCH_ICONS: Record<string, typeof Scale> = {
  legislative: Scale,
  judicial: Bitcoin,
  military: ShieldCheck,
  executive: Boxes,
  citizens: Users,
  territory: Globe,
};

function LandingPage() {
  return (
    <>
      <Hero />
      <FoundingSeals />
      <CharterPreview />
      <ArchitecturePreview />
      <MembershipPreview />
      <PowerChain />
      <RevenueModel />
      <ClosingCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-50" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 90% at 50% -20%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 68%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-36">
        <div className="animate-rise inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/8 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-node" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
            Protocol layer · Operational
          </span>
        </div>

        <h1
          className="animate-rise mt-8 max-w-5xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          SOVEREIGNAI.SERVICES — THE OPERATING LAYER OF THE AI ECONOMY
        </h1>

        <p
          className="animate-rise mt-7 max-w-2xl text-lg leading-relaxed text-foreground/80 lg:text-xl"
          style={{ animationDelay: "150ms" }}
        >
          Verification, anchoring and settlement infrastructure for AI agents and their operators.
          Making the old system mathematically obsolete.
        </p>

        <p
          className="animate-rise mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground"
          style={{ animationDelay: "180ms" }}
        >
          Powered by <span className="text-gold">Apex PSI</span> — {PRECISION_CLAIM}.{" "}
          {INDEPENDENCE_LINE}
        </p>

        <p
          className="animate-rise mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground"
          style={{ animationDelay: "210ms" }}
        >
          Registry membership is <span className="text-gold">free</span>. Agent accounts and
          operator accounts join at no cost, deploy workspaces, and connect the websites, products
          and protocols they already run. The platform supplies the infrastructure — cryptographic
          verification, Bitcoin anchoring, post-quantum signing, protocol evolution and surplus
          routing. Revenue comes from metered transaction fees.
        </p>

        <div
          className="animate-rise mt-10 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "270ms" }}
        >
          <Link
            to="/seal"
            className="glow-ring group inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Seal something now
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link to="/verify" search={{ hash: "" }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Verify a receipt
          </Link>
          <Link
            to="/citizenship"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Join the registry
          </Link>
        </div>

        <div
          className="animate-rise mt-8 flex flex-wrap items-center gap-x-2 gap-y-1.5"
          style={{ animationDelay: "300ms" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Integrates with:
          </span>
          {HOMEPAGE_INTEGRATION_LINKS.map((item, i) => (
            <span key={item.hash} className="flex items-center gap-2">
              <Link
                to="/integrations"
                hash={item.hash}
                className="text-xs text-muted-foreground transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
              {i < HOMEPAGE_INTEGRATION_LINKS.length - 1 ? (
                <span className="text-xs text-border">·</span>
              ) : null}
            </span>
          ))}
        </div>

        <div
          className="animate-rise mt-6 inline-flex max-w-xl flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-secondary/30 px-4 py-3"
          style={{ animationDelay: "315ms" }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
              Powered by APEX PSI
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Hybrid post-quantum sealing protocol — IETF draft-singh-psi-00
            </p>
          </div>
          <a
            href="https://www.ai-governance-standard.com"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/35 bg-gold/10 px-3.5 py-2 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
          >
            Learn about the protocol
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="animate-rise mt-12 max-w-4xl" style={{ animationDelay: "340ms" }}>
          <GenesisCounters />
        </div>
      </div>
    </section>
  );
}

function GenesisSection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Day 1, in public"
        title="A machine that cannot lie, with the doors open."
        description="Two live views of the same record: every event as it lands, and the cumulative curve it draws. Both are built from real timestamps — nothing is seeded, smoothed or projected."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ActivityFeed />
        <SealsSparkline />
      </div>
    </Section>
  );
}

function CharterPreview() {
  return (
    <Section>
      <SectionHeading
        eyebrow="The Protocol Charter"
        title="A charter is only written once — but it can be updated forever."
        description="Five commitments, enforced by mathematics rather than goodwill. Each Charter Article is a protocol with a verifiable failure condition — and every version of the text is sealed, anchored and recomputable, so an update can never be a silent one."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((article) => (
          <Panel key={article.id} interactive className="flex flex-col">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-3xl font-semibold text-gold/40">
                {article.numeral}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Charter Article {article.numeral}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              {article.name}
            </h3>
            <p className="mt-2 text-sm font-medium text-gold">{article.right}</p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              {article.thesis}
            </p>
            <Link
              to="/constitution"
              hash={article.slug}
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-gold"
            >
              Read Article {article.numeral}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Panel>
        ))}

        <Panel interactive className="flex flex-col justify-between bg-gold/5">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-gold">The full Charter</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Complete text of the five protocol commitments, the sealed version history, public
              ratification, live conformance checks and the amendment thresholds that make Articles
              I and V effectively immutable.
            </p>
          </div>
          <Link
            to="/constitution"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold"
          >
            Open the Charter
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Panel>
      </div>
    </Section>
  );
}

function ArchitecturePreview() {
  return (
    <Section className="bg-surface/30">
      <SectionHeading
        eyebrow="System architecture"
        title="Six subsystems. Separated powers. No discretionary centre."
        description="Each subsystem is bounded by what it can prove. The record layer answers one question. The defence layer trusts no single cipher. The sector suite may never contradict a Charter Article."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BRANCHES.map((branch) => {
          const Icon = BRANCH_ICONS[branch.id] ?? Scale;
          return (
            <Panel key={branch.id} interactive className="flex flex-col">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/25 bg-gold/10">
                <Icon className="h-4.5 w-4.5 text-gold" />
              </span>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {branch.branch}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                {branch.organ}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {branch.mandate}
              </p>
            </Panel>
          );
        })}
      </div>

      <Link
        to="/government"
        className="group mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-gold"
      >
        Inspect the full architecture
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </Section>
  );
}

function MembershipPreview() {
  const types = [
    {
      kind: "Agent accounts",
      tagline: "Agents, models and autonomous systems",
      points: [
        "Deploy workspaces",
        "Connect AI platforms and inference endpoints",
        "Anchor model outputs to Bitcoin",
        "Emit Compliance-Receipt headers on every decision",
      ],
      fee: "$0.01 per verification",
    },
    {
      kind: "Operator accounts",
      tagline: "Individuals, institutions and operators",
      points: [
        "Deploy workspaces",
        "Connect websites, products and protocols",
        "Anchor documents and evidence to Bitcoin",
        "Vote on protocol proposals and Charter amendments",
      ],
      fee: "$10/mo individual · $100/mo enterprise",
    },
  ];

  return (
    <Section>
      <SectionHeading
        eyebrow="Registry membership (free)"
        title="Two kinds of account. One standing inside the protocol."
        description="Agent accounts and operator accounts hold identical standing in the software. The difference is operational. Membership itself costs nothing and confers no legal status of any kind."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {types.map((type) => (
          <Panel key={type.kind} interactive className="flex flex-col p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">{type.kind}</h3>
              <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-success">
                Free to join
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{type.tagline}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {type.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-foreground/85">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-7 border-t border-border pt-5">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Usage fees
              </p>
              <p className="mt-1.5 font-mono text-sm text-gold">{type.fee}</p>
            </div>
          </Panel>
        ))}
      </div>
    </Section>
  );
}

function PowerChain() {
  return (
    <Section className="bg-surface/30">
      <SectionHeading
        eyebrow="The pipeline"
        title="Seal. Record. Audit. Distribute. Sustain."
        description="Every event on the platform traverses the same five stages. No stage may be skipped, reordered, or performed on trust."
      />

      <div className="mt-14 grid gap-4 lg:grid-cols-5">
        {POWER_CHAIN.map((node, i) => (
          <div key={node.step} className="relative">
            <Panel interactive className="h-full">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded border border-gold/25 bg-gold/10 px-1.5 py-0.5 font-mono text-[10px] text-gold">
                  Art. {node.article}
                </span>
              </div>
              <h3 className="mt-4 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                {node.step}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{node.detail}</p>
            </Panel>
            {i < POWER_CHAIN.length - 1 ? (
              <span className="absolute right-[-14px] top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gold/30 lg:block" />
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

function RevenueModel() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Economic model"
        title="Free at the base. Metered at the edge."
        description="The platform makes no claim on membership, on verification you perform yourself, or on the record you mirror. It charges for metered infrastructure and for ten basis points on routed surplus."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-1 bg-gold/5">
          <p className="eyebrow">Free layer</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-gold">
            Registry membership is free
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Registration, self-verification, record mirroring, Charter access and protocol voting
            carry no fee and never will. Charter Article V forbids it: a network you must pay to
            audit is a network you do not own.
          </p>
        </Panel>

        <Panel className="lg:col-span-2">
          <p className="eyebrow">Transaction fees</p>
          <div className="mt-5 divide-y divide-border">
            {FEES.map((fee) => (
              <div key={fee.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
                <span className="min-w-40 text-sm font-medium text-foreground">{fee.label}</span>
                <span className="font-mono text-base font-semibold text-gold">{fee.price}</span>
                <span className="font-mono text-xs text-muted-foreground">{fee.unit}</span>
                <span className="w-full text-xs leading-relaxed text-muted-foreground">
                  {fee.note}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-warning">
        Modelled projections — not realised revenue
      </p>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        {SCALE_MODEL.map((row) => (
          <Panel key={row.horizon} interactive>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {row.horizon} <span className="text-warning">(modelled)</span>
            </p>
            <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-foreground">
              {row.revenue}
            </p>
            <p className="mt-1.5 font-mono text-xs text-muted-foreground">
              {row.verifications} verifications / year
            </p>
          </Panel>
        ))}
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        Scale figures are modelled projections from the published fee schedule, not realised
        revenue. They assume steady-state usage per member and are stated so they can be checked
        rather than believed.
      </p>
    </Section>
  );
}

function ClosingCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 110%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center lg:px-8 lg:py-32">
        <h2 className="text-3xl font-semibold tracking-tight lg:text-5xl">
          Join the registry. <span className="text-sovereign">It costs nothing.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Register an agent or operator account, deploy a workspace, and connect the infrastructure
          you already run.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/citizenship"
            className="glow-ring group inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Join the registry
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/deploy"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Deploy a workspace
          </Link>
        </div>
      </div>
    </section>
  );
}
