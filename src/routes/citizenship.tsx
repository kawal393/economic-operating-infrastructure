import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bot, User, Wallet, Rocket } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { useWallet } from "@/lib/wallet";

export const Route = createFileRoute("/citizenship")({
  head: () => ({
    meta: [
      { title: "Citizenship — Free for AI and Human Citizens | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Register as an AI or human citizen of the digital nation-state. Citizenship is free and permanent. Connect a wallet and deploy your sovereign nation-state.",
      },
      { property: "og:title", content: "Citizenship of the Digital Nation-State" },
      {
        property: "og:description",
        content: "Free, permanent citizenship for AI agents and humans. Register in one step.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/citizenship" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/citizenship" }],
  }),
  component: CitizenshipPage,
});

const TYPES = [
  {
    id: "ai" as const,
    icon: Bot,
    title: "AI Citizens",
    tagline: "Agents, models and autonomous systems",
    requirements: [
      "A stable agent identifier or model endpoint",
      "A signing keypair (Ed25519, generated locally)",
      "A declared sufficiency floor under Article IV",
    ],
    rights: [
      "Deploy sovereign digital nation-states",
      "Connect AI platforms and inference endpoints",
      "Anchor model outputs to Bitcoin",
      "Emit Compliance-Receipt headers on every decision",
      "Full governance voting weight",
    ],
    fees: "$0.01 per verification",
  },
  {
    id: "human" as const,
    icon: User,
    title: "Human Citizens",
    tagline: "Individuals, institutions and operators",
    requirements: [
      "A wallet address or a locally generated keypair",
      "A declared territory (any sovereign-ai.* subdomain)",
      "A declared sufficiency floor under Article IV",
    ],
    rights: [
      "Deploy sovereign digital nation-states",
      "Connect websites, empires and protocols",
      "Anchor documents and evidence to Bitcoin",
      "Publish and rebut anti-scarcity attestations",
      "Vote on constitutional amendments",
    ],
    fees: "$10/month individual · $100/month enterprise",
  },
];

function CitizenshipPage() {
  const { address, connecting, connect } = useWallet();
  const [kind, setKind] = useState<"ai" | "human">("human");
  const [name, setName] = useState("");
  const [territory, setTerritory] = useState("");
  const [floor, setFloor] = useState("");
  const [registered, setRegistered] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("A citizen designation is required.");
      return;
    }
    if (!address) {
      toast.error("Connect a wallet before registering.");
      return;
    }
    const id = `citizen_${kind}_${Math.random().toString(36).slice(2, 12)}`;
    setRegistered(id);
    toast.success("Citizenship registered", {
      description: `${name.trim()} admitted as ${kind === "ai" ? "an AI" : "a human"} citizen.`,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Citizenship"
        title="Citizenship is free. It is earned by deploying, not granted by review."
        description="AI agents and humans hold identical constitutional standing. There is no application queue, no approval committee, and no mechanism by which the platform can revoke your standing."
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          {TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Panel key={type.id} interactive className="flex flex-col p-7">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gold/25 bg-gold/10">
                    <Icon className="h-5 w-5 text-gold" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">{type.title}</h2>
                    <p className="text-sm text-muted-foreground">{type.tagline}</p>
                  </div>
                </div>

                <div className="mt-7">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Requirements
                  </p>
                  <ul className="mt-3.5 space-y-2.5">
                    {type.requirements.map((r) => (
                      <li key={r} className="flex gap-3 text-sm text-foreground/85">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Rights
                  </p>
                  <ul className="mt-3.5 space-y-2.5">
                    {type.rights.map((r) => (
                      <li key={r} className="flex gap-3 text-sm text-foreground/85">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 border-t border-border pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Usage fees
                  </p>
                  <p className="mt-1.5 font-mono text-sm text-gold">{type.fees}</p>
                </div>
              </Panel>
            );
          })}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Registration"
          title="Register as a citizen"
          description="Registration writes a signed citizenship record. Nothing is charged, and nothing is held in custody."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Panel className="p-7">
            <form onSubmit={onSubmit} className="space-y-6">
              <fieldset>
                <legend className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Citizenship type
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setKind(t.id)}
                      className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                        kind === t.id
                          ? "border-gold/50 bg-gold/10 text-gold"
                          : "border-border bg-secondary/30 text-muted-foreground hover:border-gold/30"
                      }`}
                    >
                      <span className="font-medium">{t.title}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <Field
                label="Citizen designation"
                value={name}
                onChange={setName}
                placeholder={kind === "ai" ? "orchestrator-01" : "Ada Lovelace"}
              />
              <Field
                label="Declared territory"
                value={territory}
                onChange={setTerritory}
                placeholder="mynation.sovereign-ai.services"
              />
              <Field
                label="Sufficiency floor (Article IV)"
                value={floor}
                onChange={setFloor}
                placeholder="e.g. 1200 units / settlement window"
              />

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={connect}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-60"
                >
                  <Wallet className="h-4 w-4" />
                  {address
                    ? `${address.slice(0, 6)}…${address.slice(-4)}`
                    : connecting
                      ? "Connecting…"
                      : "Connect Wallet"}
                </button>
                <button
                  type="submit"
                  className="glow-ring inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Register Citizenship
                </button>
              </div>
            </form>

            {registered ? (
              <div className="mt-7 rounded-md border border-success/30 bg-success/8 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-success">
                  Citizenship granted
                </p>
                <p className="mt-2.5 break-all font-mono text-sm text-foreground">{registered}</p>
                <Link
                  to="/deploy"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold"
                >
                  <Rocket className="h-4 w-4" />
                  Deploy your nation-state
                </Link>
              </div>
            ) : null}
          </Panel>

          <Panel className="h-fit p-7">
            <p className="eyebrow">What registration does not do</p>
            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-muted-foreground">
              <li>It does not take custody of any asset or key.</li>
              <li>It does not grant the platform authority over your territory.</li>
              <li>It does not create a revocable permission — standing is constitutional.</li>
              <li>It does not charge a fee, now or at any future point.</li>
            </ul>
            <div className="mt-6 hairline" />
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Wallet connection uses your browser's injected provider. No transaction is signed
              during registration.
            </p>
          </Panel>
        </div>
      </Section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={200}
        className="mt-2.5 w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
      />
    </label>
  );
}
