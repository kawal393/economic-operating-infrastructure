import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";
import { ONCHAIN_STATUS } from "@/content/legal";

export const Route = createFileRoute("/contracts")({
  head: () => ({
    meta: [
      { title: "On-chain mirror — specified, not deployed | Sovereign AI Services" },
      {
        name: "description",
        content:
          "The SovereignAI.sol interface as specified: member registration, workspace deployment, verification records and Merkle-root anchoring. No contract is deployed, no address is published, and this site sends no transaction.",
      },
      { property: "og:title", content: "On-chain mirror — specified, not deployed" },
      {
        property: "og:description",
        content: "A published interface design. No contract deployed. No transaction is sent.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contracts" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contracts" }],
  }),
  component: ContractsPage,
});

// No contract address is published on this page, on purpose. An address nobody
// controls is a place real funds can be sent and never retrieved.

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
    description: "Commits a settlement-window Merkle root, mirrored to Bitcoin via OpenTimestamps.",
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
  return (
    <>
      <PageHeader
        eyebrow="On-chain mirror — specification, not deployed"
        title="SovereignAI.sol — the interface the Charter would execute against"
        description="This page publishes a design. No contract is deployed at any address, this site sends no transaction, and nothing here enforces anything yet. What the Charter declares is checked today by mathematics anyone can run for free; the contract layer is the part that has not been built."
      />

      <Section className="py-14">
        <Panel className="border-gold/40 bg-gold/5 p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
            Nothing on this page is live — read this first
          </p>
          <p className="mt-3.5 text-sm leading-relaxed text-foreground">
            {ONCHAIN_STATUS} An earlier version of this page printed a contract address and a button
            under every method which reported “submitted — awaiting inclusion in the next settlement
            window” after waiting 800 milliseconds. No transaction was ever constructed, signed or
            broadcast; the button only produced the sentence. Both are removed. A page that tells a
            reader their transaction was submitted when nothing was sent is the most dangerous kind
            of lie on a platform whose entire claim is verifiability — and an address nobody
            controls invites real funds to a place nobody can retrieve them from. The machinery that
            IS live needs no contract: sealing, hashing, signing and Bitcoin anchoring run
            server-side and every receipt can be checked by a stranger with no key, no login and no
            permission from us.
          </p>
        </Panel>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Specified interface"
          title="Contract methods"
          description="The interface as designed. Mutating methods would require a wallet signature; view methods would be open to anyone. Neither exists yet, so nothing below can be called."
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
              <p className="mt-6 self-start font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Not deployed — no call is possible
              </p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="Specified telemetry"
          title="Events"
          description="The events the interface would emit. None has ever been emitted, so there are no logs to index and nothing to reconstruct from them."
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
