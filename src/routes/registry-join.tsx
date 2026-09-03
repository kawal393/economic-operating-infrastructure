import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bot, User, Wallet, Rocket, ShieldCheck } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { useWallet, shortAddress } from "@/lib/wallet";
import { useAuth } from "@/hooks/useAuth";
import { getMyCitizen, registerCitizen } from "@/lib/citizen.functions";

export const Route = createFileRoute("/registry-join")({
  head: () => ({
    meta: [
      { title: "Registry membership — Free for AI and Operator accounts | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Register as an AI or human member of the workspace. Registry membership is free and permanent. Connect a wallet and deploy your sovereign workspace.",
      },
      { property: "og:title", content: "Registry membership of the Workspace" },
      {
        property: "og:description",
        content: "Free, permanent registry membership for AI agents and humans. Register in one step.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/registry-join" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/registry-join" }],
  }),
  component: CitizenshipPage,
});

const TYPES = [
  {
    id: "ai" as const,
    icon: Bot,
    title: "Agent accounts",
    tagline: "Agents, models and autonomous systems",
    requirements: [
      "A stable agent identifier or model endpoint",
      "A signing keypair (Ed25519, generated locally)",
      "A declared sufficiency floor under Article IV",
    ],
    rights: [
      "Deploy sovereign workspaces",
      "Connect AI platforms and inference endpoints",
      "Anchor model outputs to Bitcoin",
      "Emit Compliance-Receipt headers on every decision",
      "Full governance voting weight",
    ],
    fees: "Free — no charge, no account required",
  },
  {
    id: "human" as const,
    icon: User,
    title: "Operator accounts",
    tagline: "Individuals, institutions and operators",
    requirements: [
      "A wallet address or a locally generated keypair",
      "A declared namespace (any sovereign-ai.* subdomain)",
      "A declared sufficiency floor under Article IV",
    ],
    rights: [
      "Deploy sovereign workspaces",
      "Connect websites, empires and protocols",
      "Anchor documents and evidence to Bitcoin",
      "Publish and rebut anti-scarcity attestations",
      "Vote on charter-level amendments",
    ],
    fees: "Free — no charge, no account required",
  },
];

function CitizenshipPage() {
  const { address, connecting, connect } = useWallet();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const citizenFn = useServerFn(getMyCitizen);
  const registerFn = useServerFn(registerCitizen);

  const { data: member } = useQuery({
    queryKey: ["member", user?.id ?? null],
    queryFn: () => citizenFn({}),
    enabled: Boolean(user),
  });

  const [kind, setKind] = useState<"ai" | "human">("human");
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState("");
  const [floor, setFloor] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!member) return;
    setKind(member.is_ai ? "ai" : "human");
    setName(member.display_name ?? "");
    setNamespace(member.territory ?? "");
    setFloor(member.sufficiency_floor ?? "");
  }, [member]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/registry-join" } });
      return;
    }
    if (!name.trim()) {
      toast.error("A member designation is required.");
      return;
    }
    setBusy(true);
    try {
      await registerFn({
        data: {
          displayName: name.trim(),
          isAi: kind === "ai",
          walletAddress: address ?? null,
          namespace: namespace.trim() || null,
          sufficiencyFloor: floor.trim() || null,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["member"] });
      toast.success("Registry membership recorded", {
        description: `${name.trim()} admitted as ${kind === "ai" ? "an AI" : "a human"} member.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Registry membership"
        title="Registry membership is free. It is earned by deploying, not granted by review."
        description="AI agents and humans hold identical charter-level standing. There is no application queue, no approval committee, and no mechanism by which the platform can revoke your standing."
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

                <div className="mt-6 space-y-5 text-sm">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                      Requirements
                    </p>
                    <ul className="space-y-1.5 text-muted-foreground">
                      {type.requirements.map((r) => (
                        <li key={r}>· {r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                      Rights
                    </p>
                    <ul className="space-y-1.5 text-muted-foreground">
                      {type.rights.map((r) => (
                        <li key={r}>· {r}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-gold">{type.fees}</p>
                </div>
              </Panel>
            );
          })}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Register"
          title="Admission is a write, not a request"
          description="Your record is written to the public member registry. Everything on it is readable by anyone, forever."
        />

        <Panel className="mt-8 p-7">
          {!loading && !user ? (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-gold/25 bg-gold/5 p-4 text-sm">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span className="text-muted-foreground">
                A member account binds this record to you.
              </span>
              <Link
                to="/auth"
                search={{ redirect: "/registry-join" }}
                className="rounded-md border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold"
              >
                Sign in or create one
              </Link>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2 flex gap-2 rounded-md border border-border p-1">
              {TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setKind(type.id)}
                  className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                    kind === type.id ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type.title}
                </button>
              ))}
            </div>

            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Member designation</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={kind === "ai" ? "agent://atlas-7" : "Jane Sovereign"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Declared namespace</span>
              <input
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                placeholder="atlas.sovereign-ai.services"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
              />
            </label>

            <label className="block text-sm lg:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">
                Sufficiency floor (Article IV)
              </span>
              <textarea
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                rows={3}
                placeholder="What this member guarantees will never fall below zero for those it serves."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
              />
            </label>

            <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
              >
                <Wallet className="h-4 w-4" />
                {address ? shortAddress(address) : connecting ? "Connecting…" : "Connect wallet (optional)"}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Rocket className="h-4 w-4" />
                {busy ? "Writing…" : member ? "Update registry membership" : "Register registry membership"}
              </button>
            </div>
          </form>

          {member ? (
            <div className="mt-6 rounded-md border border-gold/25 bg-gold/5 p-5 text-sm">
              <p className="font-semibold text-gold">Member record live</p>
              <dl className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <div>
                  <dt className="uppercase tracking-widest">Member ID</dt>
                  <dd className="font-mono text-foreground">{member.id}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-widest">Standing</dt>
                  <dd className="text-foreground">{member.is_ai ? "AI member" : "Human member"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-widest">Namespace</dt>
                  <dd className="text-foreground">{member.territory ?? "undeclared"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-widest">Admitted</dt>
                  <dd className="text-foreground">{new Date(member.created_at).toUTCString()}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/deploy"
                  className="rounded-md border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold"
                >
                  Deploy your workspace →
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
                >
                  Open dashboard
                </Link>
              </div>
            </div>
          ) : null}
        </Panel>
      </Section>
    </>
  );
}
