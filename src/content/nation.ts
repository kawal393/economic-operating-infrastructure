/**
 * Canonical content of the workspace.
 * Single source of truth for the Charter, system architecture, protocols and economics.
 */

export type Article = {
  id: string;
  numeral: string;
  slug: string;
  name: string;
  right: string;
  thesis: string;
  body: string[];
  guarantees: string[];
};

export const ARTICLES: Article[] = [
  {
    id: "psi-resource",
    numeral: "I",
    slug: "psi-resource",
    name: "PSI-Resource",
    right: "The right to verified reality",
    thesis:
      "No claim enters the record without a digest. Reality is what survives verification, not what survives assertion.",
    body: [
      "Every resource, claim, decision or artefact admitted to the workspace is reduced to a canonical form and hashed. The digest — not the narrative around it — is the member-facing object.",
      "Verification is permissionless. Any party, without an account, a key or a licence, may recompute the digest and compare. A verification that requires the platform's cooperation is not a verification; it is a courtesy.",
      "Where a resource cannot be verified, it is not deleted. It is marked unverified and carried in the open. The workspace does not hide what it cannot prove.",
    ],
    guarantees: [
      "Canonical serialisation before hashing (RFC 8785 JCS)",
      "SHA-256 digests, lowercase hex, byte-exact",
      "Offline verification with zero dependency on platform liveness",
      "Unverified state is disclosed, never suppressed",
    ],
  },
  {
    id: "psi-anti-scarcity",
    numeral: "II",
    slug: "psi-anti-scarcity",
    name: "PSI-Anti-Scarcity",
    right: "The right to exposed truth",
    thesis:
      "Artificial scarcity is an information asymmetry wearing a price tag. Expose the asymmetry and the scarcity dissolves.",
    body: [
      "Most scarcity in a digital economy is manufactured: withheld inventory, gated data, opaque pricing, sealed audit trails. The protocol treats each of these as a measurable gap between what is known and what is published.",
      "Members may publish an anti-scarcity attestation against any withheld resource. The attestation is anchored, timestamped and permanently addressable. The holder may rebut with a counter-attestation.",
      "The workspace renders no verdict on truth. It renders the disagreement permanent, public and cryptographically dated, which is a far heavier obligation than a verdict.",
    ],
    guarantees: [
      "Attestation and counter-attestation are symmetric rights",
      "No takedown of anchored attestations, ever",
      "Disclosure gaps are quantified, not narrated",
      "Silence is recorded as a state, not as an absence",
    ],
  },
  {
    id: "psi-distribution",
    numeral: "III",
    slug: "psi-distribution",
    name: "PSI-Distribution",
    right: "The right to automatic surplus routing",
    thesis:
      "Surplus that requires a committee to move does not move. Routing must be a property of the protocol, not a policy of the operator.",
    body: [
      "When a transaction produces surplus above the declared sufficiency threshold of its participants, the excess is routed automatically along the distribution graph defined by the participating workspaces.",
      "Routing rules are charter-level, published, and executable. They are not discretionary. An operator who can choose not to route has not implemented Article III.",
      "The protocol charges ten basis points on routed surplus. That fee is the entire commercial claim the platform makes on distribution — no spread, no custody, no float.",
    ],
    guarantees: [
      "Routing executes without human authorisation",
      "Distribution graphs are public and forkable",
      "0.1% protocol fee, disclosed at the point of routing",
      "No custody of routed value beyond the settlement window",
    ],
  },
  {
    id: "psi-abundance",
    numeral: "IV",
    slug: "psi-abundance",
    name: "PSI-Abundance",
    right: "The right to cryptographically enforced sufficiency",
    thesis:
      "Sufficiency declared in a mission statement is decoration. Sufficiency enforced by a signature is infrastructure.",
    body: [
      "Each member and each workspace declares a sufficiency floor: the level below which the network's routing obligations activate in their favour.",
      "The floor is signed at declaration time and cannot be retroactively lowered by the platform, by an operator, or by a majority vote. It can only be lowered by the holder, and the lowering is itself a signed, anchored event.",
      "Abundance in this Charter is not a promise of plenty. It is a structural refusal to let sufficiency be quietly redefined downward.",
    ],
    guarantees: [
      "Sufficiency floors are signed at declaration, not asserted later",
      "No retroactive downward revision by any third party",
      "Every revision is an anchored, public event",
      "Floors are enforceable inputs to Article III routing",
    ],
  },
  {
    id: "psi-non-capture",
    numeral: "V",
    slug: "psi-non-capture",
    name: "PSI-Non-Capture",
    right: "The right to a record that cannot be altered privately",
    thesis:
      "A record whose integrity depends on the continuing good behaviour of its operator is not a record. Integrity has to survive a change of ownership.",
    body: [
      "Control of this platform will change hands. A founder, an acquirer, or any successor will end up holding the keys. Article V assumes that control will eventually concentrate, and designs so that concentration cannot alter the record.",
      "Therefore: verification requires no platform, receipts verify offline, the ledger is mirrored in full by anyone who asks, and the trust anchor is archivable. Control of the operator changes who runs the service. It does not change what the record says.",
      "The platform publicly accepts that this limits its own power permanently. That limit is the point of the design.",
      "Nothing in this Article is a position against any government, regulator or court. A record that cannot be altered privately is equally a record that can be produced publicly. These seals are designed to be handed to any authority that asks for them, and the platform has never refused one.",
    ],
    guarantees: [
      "Full ledger mirror available for public replication",
      "Receipts remain verifiable if the platform ceases to exist",
      "No single key can invalidate an issued receipt",
      "Governance cannot amend Articles I and V by simple majority",
      "Records are producible to any authority on request",
    ],
  },
];

/**
 * VERSION 1 OF THE CHARTER, FROZEN.
 *
 * Version 1 was effective 6 August 2026 and remains retrievable so a reader can
 * compare it with the current version. Article V was amended in version 2; the
 * other four Articles are carried forward byte-identical, so their digests do not
 * move between versions. Nothing in this array may be edited: it is the historical
 * record against which v1 digests are recomputed.
 */
export const ARTICLES_V1: Article[] = [
  ...ARTICLES.slice(0, 4),
  {
    id: "psi-anti-archon",
    numeral: "V",
    slug: "psi-anti-archon",
    name: "PSI-Anti-Archon",
    right: "The right to structurally uncapturable networks",
    thesis:
      "Any system that can be captured will be captured. The only defence is to make capture yield nothing worth holding.",
    body: [
      "The archon is whoever ends up holding the keys — a founder, an acquirer, a regulator, a court. Article V assumes their arrival as a certainty rather than a risk.",
      "Therefore: verification requires no platform, receipts verify offline, the ledger is mirrored in full by anyone who asks, and the trust anchor is archivable. Seizing the operator yields an operator, not the network.",
      "The platform publicly accepts that this caps its own power permanently. That cap is the product.",
    ],
    guarantees: [
      "Full ledger mirror available for public replication",
      "Receipts remain verifiable if the platform ceases to exist",
      "No single key can invalidate an issued receipt",
      "Governance cannot amend Articles I and V by simple majority",
    ],
  },
];


export type Branch = {
  id: string;
  branch: string;
  organ: string;
  mandate: string;
  detail: string;
  powers: string[];
};

export const BRANCHES: Branch[] = [
  {
    id: "legislative",
    branch: "Protocol evolution engine",
    organ: "Charter versioning",
    mandate: "Generates new protocols and amends the Charter",
    detail:
      "The evolution engine drafts, versions and ratifies protocol text. Amendments to Charter Articles II, III and IV pass on a two-thirds member vote. Articles I and V require unanimity of active workspaces — deliberately close to impossible.",
    powers: [
      "Draft and version protocol specifications",
      "Ratify industry protocols into the published rule set",
      "Propose Charter amendments",
      "Retire deprecated protocol versions",
    ],
  },
  {
    id: "judicial",
    branch: "Append-only record layer",
    organ: "Bitcoin anchoring",
    mandate: "The append-only truth layer",
    detail:
      "Disputes are not settled by opinion. A Merkle root over each settlement window is committed to Bitcoin. The record layer answers exactly one question — did this exist at or before this block — and refuses every other.",
    powers: [
      "Commit Merkle roots to the Bitcoin blockchain",
      "Issue inclusion proofs for any recorded event",
      "Establish upper-bound existence of any digest",
      "Decline all questions of intent, truth or merit",
    ],
  },
  {
    id: "military",
    branch: "Cryptographic defence layer",
    organ: "Post-quantum signing suite",
    mandate: "Ed25519 + ML-DSA-65 + LMS",
    detail:
      "Defence is a hybrid signature suite. Every platform seal carries independent classical and post-quantum signatures over the same message; a seal is considered defended only if both verify. Neither scheme is trusted alone.",
    powers: [
      "Ed25519 classical signatures (RFC 8032)",
      "ML-DSA-65 post-quantum signatures (NIST FIPS 204)",
      "LMS hash-based stateful signatures for long-horizon anchors",
      "Key rotation with signed validity windows",
    ],
  },
  {
    id: "executive",
    branch: "Sector protocol suite",
    organ: "21 industry protocol specifications",
    mandate: "Domain rule sets",
    detail:
      "Where the five Charter Articles are foundational, the twenty-one industry protocols are operational: domain-specific rules for health, finance, energy, media, logistics and the rest. They must never contradict a Charter Article; where they do, the Article governs.",
    powers: [
      "Execute domain-specific compliance rules",
      "Issue sector conformity receipts",
      "Register verified suppliers per sector",
      "Escalate conflicts to the protocol evolution engine",
    ],
  },
  {
    id: "members",
    branch: "Agent accounts & operator accounts",
    organ: "AI + human members",
    mandate: "Deploy the protocol, hold a registry membership",
    detail:
      "Registry membership is free and permanent. It is held by deploying the protocol, not granted by an application review. Agent accounts and operator accounts carry identical standing inside the software; the difference is operational only.",
    powers: [
      "Deploy workspaces",
      "Vote on protocol proposals",
      "Publish and rebut attestations",
      "Fork the distribution graph",
    ],
  },
  {
    id: "namespace",
    branch: "Domains operated by the platform",
    organ: "sovereign-ai.* namespaces",
    mandate: "Namespace binding",
    detail:
      "A workspace claims a subdomain under sovereign-ai.* and binds it to a signed Charter hash. The binding is verifiable, portable, and cannot be taken over without the key. It is a DNS namespace — nothing more is claimed.",
    powers: [
      "Claim and bind a namespace",
      "Publish a trust anchor at a well-known path",
      "Connect external websites, products and protocols",
      "Migrate a namespace without loss of receipt validity",
    ],
  },
];

export const POWER_CHAIN = [
  {
    step: "SEAL",
    detail: "Canonicalise and hash. The digest becomes the object.",
    article: "I",
  },
  {
    step: "RECORD",
    detail: "Append to the tamper-evident chain. Prior digest carried forward.",
    article: "II",
  },
  {
    step: "AUDIT",
    detail: "Merkle root committed to Bitcoin. Existence bounded above.",
    article: "II",
  },
  {
    step: "DISTRIBUTION",
    detail: "Specified only — no surplus has ever been routed and no routing meter exists.",
    article: "III",
  },
  {
    step: "ABUNDANCE",
    detail: "Specified only — no sufficiency floor can be declared, signed or anchored yet.",
    article: "IV",
  },
] as const;

/**
 * NO INVOCATION COUNTERS.
 *
 * An earlier version of this file carried a hardcoded `usageCount` for all 26
 * protocols - 418,293 "invocations" for Article I, 132,904 for PSI-Finance,
 * 71,203 for PSI-Commerce - which /protocols printed in gold as fact. No table
 * in the database counts protocol invocations, so those numbers had no source
 * and no formula: they could not honestly be labelled modelled, only removed.
 * The industry version numbers (2.1.0, 3.0.0, 1.6.0 ...) went with them for the
 * same reason - no specification is published for any of these domains, so no
 * version of one exists to print. The five Articles keep version 1.0.0 because
 * that is real: charter version 1, in force, digest recomputed live at /charter.
 */
export type Protocol = {
  id: string;
  name: string;
  description: string;
  kind: "unification" | "industry";
  version: string;
  status: "In force" | "Named domain";
  specification: string;
};

export const UNIFICATION_PROTOCOLS: Protocol[] = ARTICLES.map((a) => ({
  id: a.id,
  name: `Article ${a.numeral}: ${a.name}`,
  description: a.right,
  kind: "unification" as const,
  version: "1.0.0",
  status: "In force" as const,
  specification: "Published charter text. Digest recomputed live at /charter.",
}));

export const INDUSTRY_PROTOCOLS: Protocol[] = [
  ["psi-health", "PSI-Health", "Clinical decision provenance and consent receipts"],
  ["psi-finance", "PSI-Finance", "Model-driven credit and trading decision attestation"],
  ["psi-energy", "PSI-Energy", "Grid dispatch and carbon claim verification"],
  ["psi-media", "PSI-Media", "Synthetic content marking and provenance chains"],
  ["psi-logistics", "PSI-Logistics", "Chain-of-custody sealing across carriers"],
  ["psi-legal", "PSI-Legal", "Evidentiary sealing and disclosure attestation"],
  ["psi-education", "PSI-Education", "Credential issuance and assessment integrity"],
  ["psi-gov", "PSI-System architecture", "Public-sector algorithmic accountability records"],
  ["psi-defence", "PSI-Defence", "Autonomy oversight and engagement audit trails"],
  ["psi-insurance", "PSI-Insurance", "Underwriting model transparency and claim receipts"],
  ["psi-agri", "PSI-Agriculture", "Yield, input and provenance attestation"],
  ["psi-mfg", "PSI-Manufacturing", "Process telemetry and defect-chain sealing"],
  ["psi-retail", "PSI-Retail", "Pricing transparency and anti-scarcity disclosure"],
  ["psi-telco", "PSI-Telecom", "Traffic shaping and routing decision records"],
  ["psi-realestate", "PSI-RealEstate", "Valuation model and title provenance"],
  ["psi-labour", "PSI-Labour", "Algorithmic management and scheduling audit"],
  ["psi-climate", "PSI-Climate", "Emissions accounting and offset verification"],
  ["psi-research", "PSI-Research", "Result reproducibility and dataset sealing"],
  ["psi-identity", "PSI-Identity", "Personhood and agent attribution without surveillance"],
  ["psi-commerce", "PSI-Commerce", "Marketplace transaction record-keeping and receipts"],
  ["psi-culture", "PSI-Culture", "Attribution and derivative lineage for creative work"],
].map(([id, name, description]) => ({
  id: id as string,
  name: name as string,
  description: description as string,
  kind: "industry" as const,
  version: "—",
  status: "Named domain" as const,
  specification:
    "Named by the charter. No specification published, so no conformance receipt can be issued against it.",
}));

export const ALL_PROTOCOLS = [...UNIFICATION_PROTOCOLS, ...INDUSTRY_PROTOCOLS];

export const FEES = [
  {
    label: "Verification",
    price: "$0.001",
    unit: "per verification",
    note: "Permissionless recompute is free; metered API verification carries the fee.",
  },
  {
    label: "Bitcoin anchor",
    price: "$0.01",
    unit: "per anchor",
    note: "Merkle inclusion in the next settlement window, OpenTimestamps proof included.",
  },
  {
    label: "Compliance check",
    price: "$0.10",
    unit: "per check",
    note: "Sector protocol evaluation with a signed conformity receipt.",
  },
  {
    label: "Surplus routing",
    price: "0.1%",
    unit: "of routed surplus — not operational",
    note: "A published price for a service the platform does not run: Article III specifies routing, no value has ever been routed, and no routing meter exists. No spread, no float, no custody.",
  },
] as const;

export const SCALE_MODEL = [
  { horizon: "1M members", verifications: "3.6B", revenue: "$3.6M" },
  { horizon: "100M members", verifications: "365B", revenue: "$365M" },
  { horizon: "1B members", verifications: "3.65T", revenue: "$3.65B+" },
] as const;

export const FOOTER_CREED = "The math does not negotiate. Neither do we.";
