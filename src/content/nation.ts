/**
 * Canonical content of the digital nation-state.
 * Single source of truth for the constitution, government, protocols and economics.
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
      "Every resource, claim, decision or artefact admitted to the nation-state is reduced to a canonical form and hashed. The digest — not the narrative around it — is the citizen-facing object.",
      "Verification is permissionless. Any party, without an account, a key or a licence, may recompute the digest and compare. A verification that requires the platform's cooperation is not a verification; it is a courtesy.",
      "Where a resource cannot be verified, it is not deleted. It is marked unverified and carried in the open. The nation-state does not hide what it cannot prove.",
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
      "Citizens may publish an anti-scarcity attestation against any withheld resource. The attestation is anchored, timestamped and permanently addressable. The holder may rebut with a counter-attestation.",
      "The nation-state renders no verdict on truth. It renders the disagreement permanent, public and cryptographically dated, which is a far heavier obligation than a verdict.",
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
      "When a transaction produces surplus above the declared sufficiency threshold of its participants, the excess is routed automatically along the distribution graph defined by the participating nation-states.",
      "Routing rules are constitutional, published, and executable. They are not discretionary. An operator who can choose not to route has not implemented Article III.",
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
      "Each citizen and each nation-state declares a sufficiency floor: the level below which the network's routing obligations activate in their favour.",
      "The floor is signed at declaration time and cannot be retroactively lowered by the platform, by an operator, or by a majority vote. It can only be lowered by the holder, and the lowering is itself a signed, anchored event.",
      "Abundance in this constitution is not a promise of plenty. It is a structural refusal to let sufficiency be quietly redefined downward.",
    ],
    guarantees: [
      "Sufficiency floors are signed at declaration, not asserted later",
      "No retroactive downward revision by any third party",
      "Every revision is an anchored, public event",
      "Floors are enforceable inputs to Article III routing",
    ],
  },
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
    branch: "Immutable record layer",
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
    organ: "21 industry protocols",
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
    id: "citizens",
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
    id: "territory",
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
    detail: "Surplus routed automatically along the public graph.",
    article: "III",
  },
  {
    step: "ABUNDANCE",
    detail: "Sufficiency floors enforced by signature, not by promise.",
    article: "IV",
  },
] as const;

export type Protocol = {
  id: string;
  name: string;
  description: string;
  kind: "unification" | "industry";
  version: string;
  status: "Active" | "Draft";
  usageCount: number;
};

export const UNIFICATION_PROTOCOLS: Protocol[] = ARTICLES.map((a, i) => ({
  id: a.id,
  name: `Article ${a.numeral}: ${a.name}`,
  description: a.right,
  kind: "unification" as const,
  version: "1.0.0",
  status: "Active" as const,
  usageCount: [418293, 297140, 186552, 121874, 96310][i] ?? 0,
}));

export const INDUSTRY_PROTOCOLS: Protocol[] = [
  ["psi-health", "PSI-Health", "Clinical decision provenance and consent receipts", "2.1.0", "Active", 84120],
  ["psi-finance", "PSI-Finance", "Model-driven credit and trading decision attestation", "2.0.3", "Active", 132904],
  ["psi-energy", "PSI-Energy", "Grid dispatch and carbon claim verification", "1.4.0", "Active", 41288],
  ["psi-media", "PSI-Media", "Synthetic content marking and provenance chains", "3.0.0", "Active", 209771],
  ["psi-logistics", "PSI-Logistics", "Chain-of-custody sealing across carriers", "1.9.2", "Active", 57340],
  ["psi-legal", "PSI-Legal", "Evidentiary sealing and disclosure attestation", "1.6.1", "Active", 38914],
  ["psi-education", "PSI-Education", "Credential issuance and assessment integrity", "1.3.0", "Active", 26507],
  ["psi-gov", "PSI-Government", "Public-sector algorithmic accountability records", "2.2.0", "Active", 63180],
  ["psi-defence", "PSI-Defence", "Autonomy oversight and engagement audit trails", "1.1.0", "Draft", 4102],
  ["psi-insurance", "PSI-Insurance", "Underwriting model transparency and claim receipts", "1.7.0", "Active", 45830],
  ["psi-agri", "PSI-Agriculture", "Yield, input and provenance attestation", "1.2.4", "Active", 18294],
  ["psi-mfg", "PSI-Manufacturing", "Process telemetry and defect-chain sealing", "1.5.0", "Active", 31760],
  ["psi-retail", "PSI-Retail", "Pricing transparency and anti-scarcity disclosure", "1.4.2", "Active", 52218],
  ["psi-telco", "PSI-Telecom", "Traffic shaping and routing decision records", "1.0.9", "Active", 22405],
  ["psi-realestate", "PSI-RealEstate", "Valuation model and title provenance", "1.1.5", "Active", 15982],
  ["psi-labour", "PSI-Labour", "Algorithmic management and scheduling audit", "1.0.2", "Draft", 6740],
  ["psi-climate", "PSI-Climate", "Emissions accounting and offset verification", "2.0.0", "Active", 48117],
  ["psi-research", "PSI-Research", "Result reproducibility and dataset sealing", "1.8.0", "Active", 29653],
  ["psi-identity", "PSI-Identity", "Personhood and agent attribution without surveillance", "2.3.1", "Active", 118460],
  ["psi-commerce", "PSI-Commerce", "Marketplace surplus routing and settlement", "1.6.0", "Active", 71203],
  ["psi-culture", "PSI-Culture", "Attribution and derivative lineage for creative work", "1.0.0", "Draft", 3891],
].map(([id, name, description, version, status, usageCount]) => ({
  id: id as string,
  name: name as string,
  description: description as string,
  kind: "industry" as const,
  version: version as string,
  status: status as "Active" | "Draft",
  usageCount: usageCount as number,
}));

export const ALL_PROTOCOLS = [...UNIFICATION_PROTOCOLS, ...INDUSTRY_PROTOCOLS];

export const FEES = [
  { label: "Verification", price: "$0.001", unit: "per verification", note: "Permissionless recompute is free; metered API verification carries the fee." },
  { label: "Bitcoin anchor", price: "$0.01", unit: "per anchor", note: "Merkle inclusion in the next settlement window, OpenTimestamps proof included." },
  { label: "Compliance check", price: "$0.10", unit: "per check", note: "Sector protocol evaluation with a signed conformity receipt." },
  { label: "Surplus routing", price: "0.1%", unit: "of routed surplus", note: "Ten basis points on value routed under Article III. No spread, no float." },
] as const;

export const SCALE_MODEL = [
  { horizon: "1M members", verifications: "3.6B", revenue: "$1.46M" },
  { horizon: "100M members", verifications: "365B", revenue: "$146M" },
  { horizon: "1B members", verifications: "3.65T", revenue: "$1.46B+" },
] as const;


export const FOOTER_CREED = "The math does not negotiate. Neither do we.";
