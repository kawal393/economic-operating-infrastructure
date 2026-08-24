import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Wallet } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { shortAddress, useWallet } from "@/lib/wallet";

export const Route = createFileRoute("/contracts")({
  head: () => ({
    meta: [
      { title: "On-chain mirror — SovereignAI.sol | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Interact with the SovereignAI contract: register members, deploy workspaces, record verifications and anchor Merkle roots on-chain.",
      },
      { property: "og:title", content: "On-chain mirror — SovereignAI.sol" },
      {
        property: "og:description",
        content: "On-chain member registry, workspace deployment and verification anchoring.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contracts" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contracts" }],
  }),
  component: ContractsPage,
});

const CONTRACT_ADDRESS = "0x5f9a1c4e08b7d2361ac9be47f0d31528a6c40e9b";

const METHODS = [
  {
    name: "registerCitizen",
    signature: "registerCitizen(string publicKey, uint8 citizenType)",
    description:
      "Binds a wallet to a verified member record. citizenType 0 = human, 1 = AI system, 2 = institution.",
    mutating: true,
  },
  {
    name: "deployNationState",
    signature: "deployNationState(string name, bytes32 constitutionHash)",
    description:
      "Registers sovereign namespace against a sealed Charter hash. Emits NationStateDeployed.",
    mutating: true,
  },
  {
    name: "recordVerification",
    signature: "recordVerification(bytes32 contentHash, bytes32 protocolId)",
    description:
      "Writes a verification receipt reference on-chain. Charges the $0.001 protocol fee equivalent.",
    mutating: true,
  },
  {
    name: "anchorMerkleRoot",
    signature: "anchorMerkleRoot(bytes32 root)",
    description:
      "Commits a settlement-window Merkle root, mirrored to Bitcoin via OpenTimestamps.",
    mutating: true,
  },
  {
    name: "getCitizen",
    signature: "getCitizen(address member) view returns (Member)",
    description: "Reads the member record: type, public key, registration block and standing.",
    mutating: false,
  },
  {
    name: "totalVerifications",
    signature: "totalVerifications() view returns (uint256)",
    description: "Cumulative verification count recorded by the contract since genesis.",
    mutating: false,
  },
];

const EVENTS = [
  ["CitizenRegistered", "address indexed member, uint8 citizenType"],
  ["NationStateDeployed", "uint256 indexed id, address indexed founder, bytes32 constitutionHash"],
  ["VerificationRecorded", "bytes32 indexed contentHash, bytes32 indexed protocolId"],
  ["MerkleRootAnchored", "bytes32 indexed root, uint256 window"],
  ["SurplusRouted", "address indexed from, address indexed to, uint256 amount"],
];

function ContractsPage() {
  const { address, connecting, connect } = useWallet();
  const [pending, setPending] = useState<string | null>(null);

  const call = async (method: (typeof METHODS)[number]) => {
    if (method.mutating && !address) {
      toast.error("Connect a wallet to send a transaction.");
      return;
    }
    setPending(method.name);
    await new Promise((r) => setTimeout(r, 800));
    setPending(null);
    if (method.mutating) {
      toast.success(`${method.name} submitted`, {
        description: "Awaiting inclusion in the next settlement window.",
      });
    } else {
      toast(`${method.name} returned`, { description: "Read completed against the latest block." });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="On-chain mirror · IN CERTIFICATION"
        title="SovereignAI.sol — the executable half of the Charter"
        description="Registry membership, namespace, verification and anchoring are contract state. What the Charter declares, the contract enforces."
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={connect}
            disabled={connecting}
            className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-60"
          >
            <Wallet className="h-4 w-4" />
            {connecting ? "Connecting…" : shortAddress(address)}
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(CONTRACT_ADDRESS);
              toast("Contract address copied");
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-5 py-2.5 font-mono text-xs transition-colors hover:border-gold/40 hover:text-gold"
          >
            <Copy className="h-3.5 w-3.5" />
            {CONTRACT_ADDRESS.slice(0, 10)}…{CONTRACT_ADDRESS.slice(-6)}
          </button>
        </div>
      </PageHeader>

      <Section>
        <SectionHeading
          eyebrow="Interface"
          title="Contract methods"
          description="Write methods require a connected wallet. Read methods are open to anyone."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {METHODS.map((m) => (
            <Panel key={m.name} className="flex flex-col p-7">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold tracking-tight text-foreground">{m.name}</h3>
                <span
                  className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    m.mutating ? "border-gold/40 text-gold" : "border-border text-muted-foreground"
                  }`}
                >
                  {m.mutating ? "Write" : "Read"}
                </span>
              </div>
              <code className="mt-4 block break-all rounded-md border border-border bg-background/70 px-4 py-3 font-mono text-xs text-gold">
                {m.signature}
              </code>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {m.description}
              </p>
              <button
                type="button"
                onClick={() => call(m)}
                disabled={pending === m.name}
                className="mt-6 self-start rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-60"
              >
                {pending === m.name ? "Submitting…" : m.mutating ? "Send transaction" : "Call"}
              </button>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Telemetry"
          title="Events"
          description="Every state change emits a typed event. Indexers reconstruct the nation from logs alone."
        />
        <Panel className="mt-10 overflow-x-auto p-7">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Event", "Signature"].map((h) => (
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
              {EVENTS.map(([name, sig]) => (
                <tr key={name}>
                  <td className="py-3.5 pr-6 font-mono text-sm text-gold">{name}</td>
                  <td className="py-3.5 font-mono text-xs text-muted-foreground">{sig}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Section>
    </>
  );
}
