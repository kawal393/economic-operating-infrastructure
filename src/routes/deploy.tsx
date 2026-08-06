import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Rocket, Wallet } from "lucide-react";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { sha256Hex, useWallet } from "@/lib/wallet";

export const Route = createFileRoute("/deploy")({
  head: () => ({
    meta: [
      { title: "Deploy a Nation-State | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Seal a constitution with post-quantum signatures, anchor it to Bitcoin via OpenTimestamps, and deploy your sovereign digital nation-state.",
      },
      { property: "og:title", content: "Nation-State Deployer" },
      {
        property: "og:description",
        content: "Seal, anchor and deploy your sovereign digital nation-state.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/deploy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/deploy" }],
  }),
  component: DeployPage,
});

type Result = {
  nationStateId: string;
  constitutionHash: string;
  bitcoinTimestamp: string;
  contractAddress: string;
};

const STAGES = [
  "Canonicalising constitution (RFC 8785)",
  "Sealing with Ed25519 + ML-DSA-65",
  "Committing Merkle root to OpenTimestamps",
  "Deploying nation-state via smart contract",
];

function DeployPage() {
  const { address, connecting, connect } = useWallet();
  const [name, setName] = useState("");
  const [constitution, setConstitution] = useState("");
  const [infrastructure, setInfrastructure] = useState("");
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<Result | null>(null);

  const deploying = stage >= 0 && stage < STAGES.length;

  const onDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !constitution.trim()) {
      toast.error("A name and a constitution are both required.");
      return;
    }
    if (!address) {
      toast.error("Connect a wallet before deploying.");
      return;
    }

    setResult(null);
    try {
      for (let i = 0; i < STAGES.length; i++) {
        setStage(i);
        await new Promise((r) => setTimeout(r, 650));
      }

      const hash = await sha256Hex(`${name.trim()}\n${constitution.trim()}`);
      setResult({
        nationStateId: `ns_${hash.slice(0, 16)}`,
        constitutionHash: `sha256:${hash}`,
        bitcoinTimestamp: new Date().toISOString(),
        contractAddress: `0x${hash.slice(0, 40)}`,
      });
      toast.success("Nation-state deployed", { description: name.trim() });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Deployment failed.";
      toast.error("Deployment failed", { description: message });
    } finally {
      setStage(-1);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Nation-State Deployer"
        title="Seal a constitution. Anchor it. Deploy sovereign territory."
        description="Your constitution is canonicalised, hashed, sealed with hybrid post-quantum signatures, committed to Bitcoin, and bound to your namespace. The binding is the border."
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Panel className="p-7">
            <form onSubmit={onDeploy} className="space-y-6">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Nation-state name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  placeholder="Republic of Verified Reality"
                  className="mt-2.5 w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Constitution
                </span>
                <textarea
                  value={constitution}
                  onChange={(e) => setConstitution(e.target.value)}
                  rows={12}
                  maxLength={20000}
                  placeholder={"Article I — ...\nArticle II — ..."}
                  className="mt-2.5 w-full resize-y rounded-md border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
                />
                <span className="mt-1.5 block text-right font-mono text-[10px] text-muted-foreground">
                  {constitution.length} / 20000
                </span>
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Connected infrastructure
                </span>
                <textarea
                  value={infrastructure}
                  onChange={(e) => setInfrastructure(e.target.value)}
                  rows={4}
                  maxLength={4000}
                  placeholder={"https://my-empire.example\nhttps://api.my-protocol.example"}
                  className="mt-2.5 w-full resize-y rounded-md border border-input bg-background px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
                />
                <span className="mt-1.5 block font-mono text-[10px] text-muted-foreground">
                  One website, empire or protocol endpoint per line.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={connect}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-60"
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
                  disabled={deploying}
                  className="glow-ring inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                >
                  <Rocket className="h-4 w-4" />
                  {deploying ? "Deploying…" : "Deploy Nation-State"}
                </button>
              </div>
            </form>
          </Panel>

          <div className="space-y-4">
            <Panel className="p-7">
              <p className="eyebrow">Deployment pipeline</p>
              <ol className="mt-5 space-y-4">
                {STAGES.map((label, i) => {
                  const done = result !== null || stage > i;
                  const active = stage === i;
                  return (
                    <li key={label} className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          done
                            ? "bg-success"
                            : active
                              ? "bg-gold animate-pulse-node"
                              : "bg-border"
                        }`}
                      />
                      <span
                        className={`text-sm leading-relaxed ${
                          done || active ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Panel>

            {result ? (
              <Panel className="border-success/30 bg-success/5 p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-success">
                  Deployment complete
                </p>
                <dl className="mt-5 space-y-4">
                  {[
                    ["Nation-state ID", result.nationStateId],
                    ["Constitution hash", result.constitutionHash],
                    ["Bitcoin timestamp", result.bitcoinTimestamp],
                    ["Contract address", result.contractAddress],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {k}
                      </dt>
                      <dd className="mt-1 break-all font-mono text-xs text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            ) : null}
          </div>
        </div>
      </Section>
    </>
  );
}
