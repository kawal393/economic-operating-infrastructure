/**
 * Legal identity and mandatory disclosures.
 * Sovereign AI Services is COMMERCIAL SOFTWARE INFRASTRUCTURE — never a state.
 */

export const OPERATOR = {
  name: "Apex Intelligence Empire",
  abn: "71 672 237 795",
  jurisdiction: "Victoria, Australia",
  platform: "Sovereign AI Services",
  domain: "sovereign-ai.services",
} as const;

export const DISCLAIMER = `Sovereign AI Services is a commercial software platform operated by Apex Intelligence Empire (ABN 71 672 237 795, registered in Victoria, Australia). It is not a nation, state, government or sovereign entity and confers no citizenship, nationality, legal status or rights. "Charter", "credential", "workspace" and similar terms describe software features only. The platform provides cryptographic verification, timestamping and record-keeping tools; it does not provide legal, financial, immigration or investment advice. Use is governed by the Terms of Service.`;

/** The single approved independence sentence. Do not paraphrase. */
export const INDEPENDENCE_LINE =
  "Sovereign AI Services is a separate commercial platform, operated by Apex Intelligence Empire (ABN 71 672 237 795), built on the neutral APEX PSI protocol.";

/**
 * The single approved technical claim. Precise and checkable.
 *
 * "First" was struck on 3 September 2026. A priority claim cannot be checked
 * by a reader, cannot be substantiated against every protocol nobody has
 * surveyed, and is the classic exposure under s18 of the Australian Consumer
 * Law, which actionably catches representations that cannot be substantiated
 * whether or not they turn out to be true. Everything that remains here can
 * be independently recomputed by a stranger.
 */
export const PRECISION_CLAIM =
  "a hybrid post-quantum PSI sealing protocol whose public receipts print their own inputs (Ed25519 + ML-DSA-65 + LMS, RFC 8785 canonicalisation, Bitcoin-anchored)";

export const APEX_PORTAL = "https://www.ai-governance-standard.com";

export const FOUNDING_SEALS = [
  {
    receiptId: "APEX-NTR-7F4E5CC21099A0E1",
    title: "Article 50 Enforcement Watch — founding record",
    hash: "36bcebd3109ada79ba1e2fb08e9d939d3693e8bf1ef5053c8a3b3e62aeba0b9b",
    timestamp: "2026-08-22T10:43:09Z",
  },
  {
    receiptId: "APEX-NTR-D6B08044149ADE0D",
    title: "Dutch AP v Uber — €825M equivalence note",
    hash: "a884b187ee345206aeb2d2923a6655246f2713965e772fc899bcc2a27c2913c6",
    timestamp: "2026-08-22T10:43:12Z",
  },
  {
    receiptId: "APEX-NTR-F77F6C2198938410",
    title: "Sealed AI memory demo",
    hash: "2300fb5b6e08c480ec067b3c97fa7c55db0251afca753644a00a2d558894a3ff",
    timestamp: "2026-08-22T10:43:14Z",
  },
] as const;

/**
 * IMPLEMENTATION-STATUS FENCES.
 *
 * The charter text is sealed: /charter recomputes its SHA-256 digest and prints
 * whether the live text still matches, so not one word of an Article may be edited
 * to carry a disclaimer — that would silently break a sealed document and change a
 * digest members have already signed. The truth about what is built and what is
 * only specified therefore lives here, rendered BESIDE the charter text, never
 * inside it. Amending an Article is a governance act under /amendments.
 */

/** Article III is specification, not machinery. Rendered wherever routing is mentioned. */
export const ARTICLE3_STATUS =
  "Article III is charter text: it specifies how surplus would route. It is not operational. No value has ever been routed by this platform, and no routing meter exists to route it.";

/** The financial-services fence. Rendered wherever fees, surplus or value are mentioned. */
export const CUSTODY_FENCE =
  "The platform holds no client money, operates no float, takes no spread and provides no payment service. It is not a managed investment scheme and offers no financial product. No Australian Financial Services Licence is held, because the acts performed here — hashing, signing, timestamping and recording — are not financial services. Nothing on this site is financial advice.";

/** No contract exists. Rendered on /contracts and anywhere an on-chain mirror is mentioned. */
export const ONCHAIN_STATUS =
  "No smart contract is deployed and no contract address is published, because publishing an address invites funds to a place nobody controls. This site sends no blockchain transaction. The only anchor in use is OpenTimestamps into Bitcoin, performed server-side over Merkle roots and independently verifiable from any receipt.";

/** Why no counters are printed. Rendered on /protocols and any page listing protocols. */
export const USAGE_STATUS =
  "No invocation counters are printed for any protocol, because no meter exists to count them. Every number on this platform is either read live from the public ledger, or labelled as a model with its formula printed beside it.";

export const FOUNDING_RECORDS_COUNT = 3;
export const ENFORCEMENT_ACTIONS_RECORDED = 0;
