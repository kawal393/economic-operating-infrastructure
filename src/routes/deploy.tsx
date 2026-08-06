import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Rocket, Wallet, Bitcoin } from "lucide-react";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { shortAddress, useWallet } from "@/lib/wallet";
import { useAuth } from "@/hooks/useAuth";
import { buildReceipt, digestText, downloadText, generateKeypair } from "@/lib/apex-psi";
import { publishReceipt } from "@/lib/ledger.functions";
import { anchorReceipt, createNationState } from "@/lib/citizen.functions";

export const Route = createFileRoute("/deploy")({
  head: () => ({
    meta: [
      { title: "Deploy a Nation-State | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Seal a constitution with Ed25519, publish it to the append-only ledger, anchor it to Bitcoin via OpenTimestamps and register your sovereign digital nation-state.",
      },
      { property: "og:title", content: "Nation-State Deployer" },
      {
        property: "og:description",
        content: "Seal, publish, anchor and deploy your sovereign digital nation-state.",
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
  slug: string;
  name: string;
  constitutionHash: string;
  receiptId: string;
  chainHash: string;
  anchorStatus: string;
  calendar: string | null;
};

const STAGES = [
  "Canonicalising constitution (RFC 8785)",
  "Sealing with Ed25519 (keys generated locally)",
  "Publishing to the append-only ledger",
  "Committing chain head to OpenTimestamps",
  "Registering nation-state in the public registry",
];

function DeployPage() {
  const { address, connecting, connect } = useWallet();
  const { user } = useAuth();
  const navigate = useNavigate();
  const publishFn = useServerFn(publishReceipt);
  const anchorFn = useServerFn(anchorReceipt);
  const registerFn = useServerFn(createNationState);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [territory, setTerritory] = useState("");
  const [constitution, setConstitution] = useState("");
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<Result | null>(null);

  const deploying = stage >= 0 && stage < STAGES.length;

  const onDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/deploy" } });
      return;
    }
    if (!name.trim() || constitution.trim().length < 20) {
      toast.error("A name and a constitution of at least 20 characters are required.");
      return;
    }

    setResult(null);
    try {
      setStage(0);
      const text = `${name.trim()}\n\n${constitution.trim()}`;
      const digest = await digestText(text);

      setStage(1);
      const keypair = await generateKeypair();
      const receipt = await buildReceipt({
        digest,
        predicates: {
          source: "text",
          name: `${name.trim()} — constitution`,
          size: new TextEncoder().encode(text).length,
          mime: "text/plain",
        },
        keypair,
      });

      setStage(2);
      const published = await publishFn({ data: { receipt: JSON.stringify(receipt) } });
      if (!published.ok) throw new Error(published.reason);

      setStage(3);
      let anchorStatus = "pending";
      let calendar: string | null = null;
      try {
        const anchored = await anchorFn({ data: { receiptId: receipt.receipt_id } });
        if (anchored.ok) {
          anchorStatus = anchored.status;
          calendar = anchored.calendar;
        }
      } catch {
        // Anchoring is best-effort; the ledger entry stands regardless.
      }

      setStage(4);
      const registered = await registerFn({
        data: {
          name: name.trim(),
          tagline: tagline.trim() || null,
          territory: territory.trim() || null,
          constitutionText: constitution.trim(),
          constitutionHash: digest,
          receiptId: receipt.receipt_id,
        },
      });
      if (!registered.ok) throw new Error(registered.reason);

      downloadText(`${receipt.receipt_id}.praman`, JSON.stringify(receipt, null, 2));

      setResult({
        slug: registered.nationState.slug ?? "",
        name: registered.nationState.name,
        constitutionHash: `sha256:${digest}`,
        receiptId: receipt.receipt_id,
        chainHash: published.entry.chain_hash,
        anchorStatus,
        calendar,
      });
      toast.success("Nation-state deployed", { description: registered.nationState.name });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Deployment failed.");
    } finally {
      setStage(-1);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Deployer"
        title="A nation-state is not applied for. It is sealed, chained and anchored."
        description="Your constitution is hashed in your browser, signed with a keypair that never leaves it, appended to the public chain, committed to Bitcoin through OpenTimestamps and listed in the open registry."
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel className="p-7">
            {!user ? (
              <div className="mb-6 rounded-md border border-gold/25 bg-gold/5 p-4 text-sm text-muted-foreground">
                Deployment writes to the public registry under your citizen record.{" "}
                <Link to="/auth" search={{ redirect: "/deploy" }} className="font-semibold text-gold">
                  Sign in
                </Link>{" "}
                first.
              </div>
            ) : null}

            <form onSubmit={onDeploy} className="space-y-5">
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted-foreground">Nation-state name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The Republic of Verifiable Output"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted-foreground">Tagline</span>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Every model output carries its own proof."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted-foreground">Territory</span>
                <input
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  placeholder="verifiable.sovereign-ai.services"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted-foreground">Constitution</span>
                <textarea
                  value={constitution}
                  onChange={(e) => setConstitution(e.target.value)}
                  rows={10}
                  placeholder="Article I. …"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-gold/50"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
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
                  disabled={deploying}
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Rocket className="h-4 w-4" />
                  {deploying ? "Deploying…" : "Deploy nation-state"}
                </button>
              </div>
            </form>
          </Panel>

          <div className="space-y-4">
            <Panel className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Pipeline</p>
              <ol className="mt-4 space-y-3 text-sm">
                {STAGES.map((label, i) => (
                  <li key={label} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        stage > i ? "bg-gold" : stage === i ? "animate-pulse bg-gold" : "bg-border"
                      }`}
                    />
                    <span className={stage >= i ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                  </li>
                ))}
              </ol>
            </Panel>

            {result ? (
              <Panel className="p-6 text-sm">
                <p className="font-semibold text-gold">{result.name} is live</p>
                <dl className="mt-4 space-y-3 text-xs">
                  <div>
                    <dt className="uppercase tracking-widest text-muted-foreground">Constitution hash</dt>
                    <dd className="break-all font-mono text-foreground">{result.constitutionHash}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-widest text-muted-foreground">Receipt</dt>
                    <dd className="break-all font-mono text-foreground">{result.receiptId}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-widest text-muted-foreground">Chain hash</dt>
                    <dd className="break-all font-mono text-foreground">{result.chainHash}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 uppercase tracking-widest text-muted-foreground">
                      <Bitcoin className="h-3 w-3" /> Bitcoin anchor
                    </dt>
                    <dd className="text-foreground">
                      {result.anchorStatus}
                      {result.calendar ? ` · ${result.calendar}` : ""}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to="/registry/$slug"
                    params={{ slug: result.slug }}
                    className="rounded-md border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold"
                  >
                    View public page →
                  </Link>
                  <Link
                    to="/r/$receiptId"
                    params={{ receiptId: result.receiptId }}
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    Proof permalink
                  </Link>
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      </Section>
    </>
  );
}
