import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Lock, KeyRound, Wrench, X } from "lucide-react";
import { Panel, Section, SectionHeading } from "@/components/primitives";

const TITLE = "The Verification Layer for the Global AI Economy — Sovereign AI Services";
const DESCRIPTION =
  "One common standard. Local control. Global verification. We record what happened — we do not decide what is true. Open to all, run by each, anchored for everyone.";

export const Route = createFileRoute("/verification-layer")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/verification-layer" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/verification-layer" }],
  }),
  component: VerificationLayerPage,
});

function VerificationLayerPage() {
  return (
    <>
      <Hero />
      <BigIdea />
      <ProblemSolution />
      <DataSovereignty />
      <OpenStructure />
      <Benefits />
      <SimpleRules />
      <BiggerPicture />
      <ClosingCta />
    </>
  );
}

/* ── Opening ─────────────────────────────────────────────────────────────── */

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
      <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="animate-rise inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/8 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-node" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
            Sovereign AI Services
          </span>
        </div>

        <h1
          className="animate-rise mt-8 max-w-5xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          The Verification Layer for the <span className="text-sovereign">Global AI Economy</span>
        </h1>

        <p
          className="animate-rise mt-8 max-w-2xl font-mono text-sm uppercase tracking-[0.14em] text-gold"
          style={{ animationDelay: "140ms" }}
        >
          We record what happened. We do not decide what is true.
        </p>

        <p
          className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80 lg:text-xl"
          style={{ animationDelay: "180ms" }}
        >
          Every day millions of AI decisions are made across the world. Every day data is shared
          across borders. Every day systems speak to each other — but nothing proves when it was
          said, that it wasn't changed, or where it came from.
        </p>

        <p
          className="animate-rise mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground"
          style={{ animationDelay: "220ms" }}
        >
          This is the missing layer. Not an opinion. Not a judgement.{" "}
          <span className="text-gold">A receipt.</span>
        </p>

        <p
          className="animate-rise mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          style={{ animationDelay: "260ms" }}
        >
          Open to all. Run by each. Anchored for everyone.
        </p>

        <div
          className="animate-rise mt-10 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            to="/seal"
            className="glow-ring group inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Seal something now
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/verify"
            search={{ hash: "" }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Verify a receipt
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── One standard, many implementations ──────────────────────────────────── */

const INSTANCE_RIGHTS = [
  {
    title: "Run their own instance",
    detail: "Full control over their own operations.",
  },
  {
    title: "Hold their own data",
    detail: "Nothing leaves their jurisdiction unless they choose it to.",
  },
  {
    title: "Set their own rules",
    detail: "Who joins, what they submit, how it is used.",
  },
  {
    title: "Verify globally",
    detail: "Cross-check any receipt against the public anchors anywhere.",
  },
  {
    title: "Stay aligned",
    detail: "All instances speak the same language. All receipts work everywhere.",
  },
];

function BigIdea() {
  return (
    <Section>
      <SectionHeading
        eyebrow="The big idea"
        title="One common standard. Local control. Global verification."
        description="This is shared infrastructure, not a central authority. Think of it like the internet itself: one protocol used by every country, every company, every person — but no single country owns it."
      />
      <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
        Every nation, every organisation, every community may:
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {INSTANCE_RIGHTS.map((right) => (
          <Panel key={right.title} interactive>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-success/30 bg-success/10">
              <Check className="h-4 w-4 text-success" />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
              {right.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{right.detail}</p>
          </Panel>
        ))}
        <Panel className="flex flex-col justify-center bg-gold/5 md:col-span-2 lg:col-span-1">
          <p className="font-mono text-sm uppercase leading-loose tracking-[0.14em] text-gold">
            Common verification.
            <br />
            Local sovereignty.
            <br />
            Universal trust.
          </p>
        </Panel>
      </div>
    </Section>
  );
}

/* ── Problem → solution ──────────────────────────────────────────────────── */

const PROBLEMS = [
  {
    problem: "\u201CI didn't say that\u201D → endless argument",
    solution: "Timestamp proves exactly when it was said.",
  },
  {
    problem: "Files altered after delivery → undetectable",
    solution: "The seal proves it was never changed.",
  },
  {
    problem: "Data sent across borders → lost or unaccounted for",
    solution: "Traceable every step. Owned where it sits.",
  },
  {
    problem: "AI output from another country → no way to check it",
    solution: "One receipt → verifiable anywhere.",
  },
  {
    problem: "Different systems, different rules → no compatibility",
    solution: "One format. One method. Works with all.",
  },
  {
    problem: "New technology → new rules → years of delay",
    solution: "Ready today. Works tomorrow.",
  },
  {
    problem: "\u201CWho watches the watchers?\u201D → no answer",
    solution: "Everyone watches everyone. The math watches all.",
  },
];

function ProblemSolution() {
  return (
    <Section className="bg-surface/30">
      <SectionHeading
        eyebrow="The problem — and the solution"
        title="Everyday problems. One simple answer."
        description="Millions of problems, one shared solution — not because anyone forced it, but because it makes sense."
      />
      <div className="mt-12 overflow-hidden rounded-lg border border-border">
        {PROBLEMS.map((row, i) => (
          <div
            key={row.problem}
            className={
              "grid gap-3 px-5 py-4 md:grid-cols-2 md:gap-6 " +
              (i % 2 === 0 ? "bg-secondary/20" : "bg-transparent")
            }
          >
            <div className="flex items-start gap-3">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm leading-relaxed text-muted-foreground">{row.problem}</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p className="text-sm leading-relaxed text-foreground/90">{row.solution}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Data sovereignty ────────────────────────────────────────────────────── */

const SOVEREIGNTY_POINTS = [
  {
    title: "Where it sits = where it stays",
    detail: "No mandatory cross-border transfers.",
  },
  {
    title: "Your laws = your rules",
    detail: "Your instance follows your jurisdiction.",
  },
  {
    title: "You choose what to share",
    detail: "You choose what to keep local.",
  },
  {
    title: "Global anchor, local data",
    detail: "The proof travels. The information stays.",
  },
];

function DataSovereignty() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Data sovereignty"
        title="Your data stays yours."
        description="Clear and unmistakable: verification is global, custody is local."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {SOVEREIGNTY_POINTS.map((point) => (
          <Panel key={point.title} interactive>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-success/30 bg-success/10">
              <Check className="h-4 w-4 text-success" />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
              {point.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.detail}</p>
          </Panel>
        ))}
      </div>
      <p className="mt-10 text-center font-mono text-sm uppercase tracking-[0.2em] text-gold">
        Verify everywhere. Move nothing.
      </p>
    </Section>
  );
}

/* ── Open structure: three layers ────────────────────────────────────────── */

const LAYERS = [
  {
    icon: Lock,
    name: "The Seal",
    rule: "Stays the same, forever",
    points: [
      "How data is hashed, signed, and anchored",
      "The format of every receipt",
      "The mathematical method",
      "This part never changes. Every implementation uses it.",
    ],
    why: "So a receipt from India verifies the same way in Canada.",
  },
  {
    icon: KeyRound,
    name: "The Ledger",
    rule: "Run it your way",
    points: [
      "Who joins your instance",
      "What data you accept",
      "How long you keep it",
      "Who can see what",
      "This part is yours. Fully.",
    ],
    why: "Your community. Your laws. Your choices.",
  },
  {
    icon: Wrench,
    name: "The Tools",
    rule: "Build anything",
    points: [
      "Interfaces, apps, dashboards",
      "New uses, new integrations, new ideas",
      "Fork, adapt, improve, extend",
      "This part belongs to everyone.",
    ],
    why: "Progress does not stop. It grows.",
  },
];

function OpenStructure() {
  return (
    <Section className="bg-surface/30">
      <SectionHeading
        eyebrow="Open structure"
        title="Three layers. One rule."
        description="Standard at the bottom. Choice at the top."
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {LAYERS.map((layer) => (
          <Panel key={layer.name} interactive className="flex flex-col">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/25 bg-gold/10">
              <layer.icon className="h-4.5 w-4.5 text-gold" />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              {layer.name}
            </h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-gold">
              {layer.rule}
            </p>
            <ul className="mt-5 flex-1 space-y-3">
              {layer.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-foreground/85">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-border pt-4 text-sm italic text-muted-foreground">
              Why? {layer.why}
            </p>
          </Panel>
        ))}
      </div>
      <p className="mt-10 text-center font-mono text-sm uppercase tracking-[0.2em] text-gold">
        One foundation. Endless possibilities.
      </p>
    </Section>
  );
}

/* ── Benefits ────────────────────────────────────────────────────────────── */

const BENEFIT_GROUPS = [
  {
    audience: "For nations & regulators",
    points: [
      "Data stays within borders — sovereignty preserved",
      "Foreign AI output — verifiable locally without sending data abroad",
      "Compliance made simple — one standard fits all frameworks",
      "Forensic evidence — self-verifying, no expert needed",
      "Choose your own balance — open or restricted, public or private",
    ],
  },
  {
    audience: "For developers & businesses",
    points: [
      "One integration — works globally",
      "No lock-in — move to any compatible system anytime",
      "Liability reduced — \u201Cthis is exactly what was delivered, when\u201D",
      "Trust built in — users see the seal and know it's verifiable",
      "Open tools — build on, adapt, improve, share",
    ],
  },
  {
    audience: "For everyone",
    points: [
      "Transparent but neutral — the system does not favour anyone",
      "Publicly auditable — anyone can check the math",
      "Future-ready — post-quantum secure, built for coming decades",
      "If not this implementation — another can be built the same way",
    ],
  },
];

function Benefits() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Benefits"
        title="For everyone, simply stated."
        description="It does not remove your choices. It removes the confusion between your choices."
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {BENEFIT_GROUPS.map((group) => (
          <Panel key={group.audience} interactive className="flex flex-col">
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-gold">
              {group.audience}
            </h3>
            <ul className="mt-5 flex-1 space-y-3">
              {group.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {point}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </Section>
  );
}

/* ── The simple rules ────────────────────────────────────────────────────── */

const RULES = [
  {
    name: "We record, we do not endorse",
    detail:
      'A receipt means "this existed at this time." It does not mean "this is correct."',
  },
  {
    name: "Neutral math",
    detail: "Same rules for every submitter. No special treatment.",
  },
  {
    name: "Local choice",
    detail: "Instance operators set their own policies. The protocol does not.",
  },
  {
    name: "Open & auditable",
    detail: "The method is public. The code is open. Anyone may inspect it.",
  },
  {
    name: "No single control",
    detail: "No one holds the master key. The anchors are public.",
  },
  {
    name: "Alternatives exist",
    detail: "This is one implementation. The standard belongs to all.",
  },
];

const CAVEATS = [
  "Proof of existence ≠ proof of truth.",
  "Proof of integrity ≠ proof of legality.",
  "The submitter is responsible for what they submit.",
  "The system is responsible for recording it accurately.",
];

function SimpleRules() {
  return (
    <Section className="bg-surface/30">
      <SectionHeading
        eyebrow="The simple rules"
        title="How it works. No fine print."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {RULES.map((rule, i) => (
          <Panel key={rule.name} interactive>
            <span className="font-mono text-2xl font-semibold text-gold/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
              {rule.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rule.detail}</p>
          </Panel>
        ))}
      </div>
      <Panel className="mt-8 border-gold/25 bg-gold/5">
        <p className="eyebrow">Clearly stated</p>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {CAVEATS.map((caveat) => (
            <li key={caveat} className="text-sm font-medium text-foreground/90">
              {caveat}
            </li>
          ))}
        </ul>
      </Panel>
    </Section>
  );
}

/* ── The bigger picture ──────────────────────────────────────────────────── */

function BiggerPicture() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow justify-center">The bigger picture</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
          The question is not whether this will exist.
        </h2>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          AI decisions, automated data, cross-border systems — they are already here. Verification
          is needed. The gap is real. The question is:
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Panel className="border-gold/30 bg-gold/5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Open</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              Available to all. Method public.
            </p>
          </Panel>
          <Panel>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Closed
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Owned by one. Controlled from one place.
            </p>
          </Panel>
        </div>
        <p className="mt-8 text-base leading-relaxed text-foreground/85">
          We chose open. Not because it is easier. Because it serves everyone.
        </p>
        <p className="mt-8 font-mono text-sm uppercase leading-loose tracking-[0.2em] text-gold">
          Build it your way. Verify it the same way.
          <br />
          One layer. Many worlds.
        </p>
      </div>
    </Section>
  );
}

/* ── Closing ─────────────────────────────────────────────────────────────── */

function ClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-border">
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
          This solves your problems. <span className="text-sovereign">Use it your way.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Sealing, verification and reading the ledger are free, keyless and need no account.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/seal"
            className="glow-ring group inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Seal something now
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/deploy"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Run your own instance
          </Link>
          <Link
            to="/charter"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Read the Charter
          </Link>
        </div>
      </div>
    </section>
  );
}
