/**
 * The Sovereign Capital Protocol — content source of truth.
 *
 * Design constraint: every instrument here is either (a) not an investment
 * contract at all, or (b) an investment contract offered only under a named
 * exemption to eligible persons. The protocol never takes custody, never
 * exercises discretion over pooled money, and never promises a return.
 */

export type Instrument = {
  id: string;
  name: string;
  oneLine: string;
  equityTaken: string;
  whoCanFund: string;
  returnShape: string;
  legalCharacter: string;
  exemptionPath: string;
  mechanics: string[];
};

export const INSTRUMENTS: Instrument[] = [
  {
    id: "covenant",
    name: "Covenant of Contribution",
    oneLine:
      "A non-refundable, non-returning grant into a founder's milestone escrow. Pure patronage with receipts.",
    equityTaken: "0%",
    whoCanFund: "Anyone, anywhere, no accreditation",
    returnShape: "No financial return. Recognition, sealed contributor record, product access.",
    legalCharacter:
      "Not a security in any major jurisdiction: no expectation of profit, no common enterprise, no repayment obligation.",
    exemptionPath:
      "No offering exemption required. Contributions are taxable receipts to the founder; the protocol issues 1099/invoice-grade sealed records.",
    mechanics: [
      "Funds settle in regulated stablecoin directly into a non-custodial milestone escrow contract.",
      "Release only on milestone attestation quorum; unreleased funds refundable on sunset.",
      "Every contribution produces a .praman receipt: amount, milestone, timestamp, chain-anchored.",
    ],
  },
  {
    id: "advance",
    name: "Advance Market Commitment",
    oneLine:
      "Customers pre-purchase future product at a discount. Capital today, delivery tomorrow — a commercial contract, not an investment.",
    equityTaken: "0%",
    whoCanFund: "Any business or individual buying the product",
    returnShape: "Product credit, typically 1.2x–2.0x face value, redeemable only in usage.",
    legalCharacter:
      "Prepaid goods/services. Consumptive intent, non-transferable, no yield, no secondary market — outside Howey and outside MiCA's asset-referenced and e-money token definitions.",
    exemptionPath:
      "Consumer-protection and prepayment law, not securities law. Escrowed until delivery; refund right on non-delivery.",
    mechanics: [
      "Credits are ledger entries, not tokens: non-transferable by construction, no wallet-to-wallet transfer function.",
      "Unused credits refundable in cash at face value if a milestone is missed.",
      "Founder recognises deferred revenue, not debt or equity.",
    ],
  },
  {
    id: "rpa",
    name: "Revenue Participation Agreement",
    oneLine:
      "A capped share of future revenue until a fixed multiple is returned. The founder keeps 100% of the company, forever.",
    equityTaken: "0%",
    whoCanFund:
      "Eligible investors only: US accredited (Reg D 506(c)) or non-US (Reg S); UK/EU/AU professional & sophisticated persons",
    returnShape:
      "A stated percentage of monthly revenue (typically 2–8%) until 1.3x–2.0x of principal is repaid. Then the obligation terminates permanently.",
    legalCharacter:
      "An investment contract — treated as a security and offered as one. No pretence otherwise.",
    exemptionPath:
      "Reg D Rule 506(c) with verified accreditation + Form D; Reg S for offshore; UK FSMA s.21 approved communications to certified sophisticated/HNW investors; EU private placement under the prospectus exemption; AU Corporations Act s.708.",
    mechanics: [
      "Payments computed from sealed revenue attestations, not self-reported spreadsheets.",
      "Hard cap, hard sunset: if the multiple is not reached by the sunset date, the obligation lapses. No perpetual claim.",
      "No board seat, no veto, no information rights beyond the sealed revenue receipt.",
      "Transfer restricted; no protocol-operated secondary market.",
    ],
  },
  {
    id: "commons",
    name: "Commons Yield Pool",
    oneLine:
      "Protocol fee surplus, routed under Article III, funds founders who could never reach a VC. Nobody's money is at risk because it is nobody's money — it is the commons'.",
    equityTaken: "0%",
    whoCanFund: "The protocol itself, from metered fees",
    returnShape:
      "None to any private party. Repayments recycle into the pool in perpetuity.",
    legalCharacter:
      "Self-funded grant programme. No external subscribers, therefore no fund, no collective investment scheme, no AIFM.",
    exemptionPath:
      "Not a fund: no outside capital is raised, no units are issued, no management fee is charged.",
    mechanics: [
      "0.1% of routed surplus flows in automatically; the balance is public and anchored.",
      "Allocation by citizen vote on sealed applications — one citizen, one vote, published tallies.",
      "Recipients owe the commons a recycling covenant, not a return: repay if you can, at your discretion.",
    ],
  },
];

export const REFUSALS = [
  {
    title: "No token sale. Ever.",
    body: "We issue no coin, no governance token, no points with a wink. A token is how a project sells the future to fund the present and calls the buyers a community. It is also the fastest route to an unregistered securities offering.",
  },
  {
    title: "No custody of your money.",
    body: "The protocol never holds funder capital. Fiat rails run through a licensed money transmitter; on-chain rails run through non-upgradeable escrow contracts where only the funder and the milestone quorum can move value.",
  },
  {
    title: "No discretionary pooling.",
    body: "Funders choose a specific founder and a specific milestone. There is no blind pool, no manager exercising judgement over other people's money — the thing that makes something a fund, an AIFM, or a collective investment scheme.",
  },
  {
    title: "No equity, no control, no cap table.",
    body: "Not a single instrument here takes ownership, a board seat, a liquidation preference, a pro-rata right, or a veto. The founder who takes capital on this protocol owns exactly as much of their company afterwards as before.",
  },
  {
    title: "No transaction-based commissions.",
    body: "Broker-dealer registration attaches to people paid per deal. Our fee is a flat, published, metered protocol fee, identical whether a raise closes at zero or at ten million.",
  },
  {
    title: "No unbounded claim.",
    body: "Every obligation has a cap and a sunset. A founder can always compute the exact worst case and the exact date it ends.",
  },
];

export const ESCROW_STAGES = [
  {
    step: "01",
    name: "Sealed application",
    body: "Founder publishes an application: identity, plan, milestones, revenue definition. Canonicalised (RFC 8785), hashed, Ed25519-signed, chain-anchored. It can never be quietly edited later.",
  },
  {
    step: "02",
    name: "Eligibility gate",
    body: "Funder passes KYC/AML and, for the Revenue Participation Agreement only, accreditation or professional-investor verification through a licensed provider. Geofencing blocks prohibited jurisdictions before a page even renders.",
  },
  {
    step: "03",
    name: "Milestone escrow",
    body: "Capital settles into a per-raise, non-upgradeable escrow. The protocol is not a signer. Only the milestone quorum can release; only the funder and time can refund.",
  },
  {
    step: "04",
    name: "Attestation quorum",
    body: "A milestone releases when the founder's evidence is sealed and a quorum of independent attestors signs it. Attestors stake reputation, are publicly named, and can be counter-attested by anyone.",
  },
  {
    step: "05",
    name: "Sealed settlement",
    body: "Revenue-share payments derive from sealed revenue receipts, computed on-chain, paid in stablecoin. Every payment is a public receipt with the running multiple attached.",
  },
  {
    step: "06",
    name: "Termination",
    body: "At cap or sunset — whichever comes first — the contract self-terminates and emits a sealed release. The founder is free, provably and permanently.",
  },
];

export const JURISDICTIONS = [
  {
    place: "United States",
    instrument: "Revenue Participation Agreement",
    path: "Reg D Rule 506(c), verified accredited investors, Form D filed, blue-sky notice filings",
    note: "Covenant and Advance Market Commitment are not securities and are unrestricted.",
  },
  {
    place: "United States (non-accredited)",
    instrument: "Covenant / Advance Market Commitment only",
    path: "No exemption needed — no security is offered",
    note: "Reg CF via a registered funding portal is the only route we would ever open to retail, and only through a licensed partner.",
  },
  {
    place: "European Union",
    instrument: "Revenue Participation Agreement",
    path: "Private placement to qualified investors under the Prospectus Regulation; ECSPR licensed partner for retail",
    note: "No token issuance, so MiCA's ART/EMT regimes do not attach. Stablecoin settlement uses MiCA-compliant issuers only.",
  },
  {
    place: "United Kingdom",
    instrument: "Revenue Participation Agreement",
    path: "FSMA s.21 financial promotion approved by an authorised person; certified sophisticated / high-net-worth exemptions",
    note: "Cooling-off and risk-warning requirements applied to every promotion.",
  },
  {
    place: "Australia",
    instrument: "Revenue Participation Agreement",
    path: "Corporations Act s.708 sophisticated/professional investor exemptions; CSF via licensed intermediary",
    note: "Design and distribution obligations documented per instrument.",
  },
  {
    place: "Rest of world",
    instrument: "Reg S / local private placement",
    path: "Offshore transaction, no directed selling efforts into the US, distribution compliance period observed",
    note: "Sanctioned and prohibited jurisdictions are geoblocked and screened.",
  },
];

export const FOUNDER_TERMS = [
  ["Equity given up", "0%"],
  ["Board seats given up", "0"],
  ["Liquidation preference", "None"],
  ["Pro-rata / anti-dilution", "None"],
  ["Information rights", "Sealed revenue receipt only"],
  ["Protocol fee", "1% of capital released, flat, published"],
  ["Worst case", "Cap multiple, then the obligation dies"],
  ["Failure case", "Sunset lapse — no personal guarantee, no clawback absent fraud"],
];

export const CAPITAL_FAQ: [string, string][] = [
  [
    "Why is this not just another crypto raise?",
    "Because there is no token. The overwhelming majority of crypto fundraising harm comes from issuing a transferable instrument whose price is the product. We issue receipts, escrow contracts and contracts of obligation — none of which trade.",
  ],
  [
    "Is the Revenue Participation Agreement a security?",
    "Yes, and we say so in the first line of the document. We do not run the tired argument that it is 'just a commercial agreement'. It is offered only to eligible investors under a named exemption, with filings made.",
  ],
  [
    "What stops a founder from taking the money and vanishing?",
    "Money is not taken; it is escrowed against milestones the founder sealed before receiving a cent. Funds not released return to the funder at sunset. Fraud is the only trigger for clawback, and fraud findings are themselves sealed and rebuttable.",
  ],
  [
    "What stops the protocol from becoming the new gatekeeper?",
    "Article V. The protocol cannot select recipients of the Commons Yield Pool — citizens vote. The protocol cannot move escrowed funds — it holds no key. Every rule here is amendable only by vote and anchored to Bitcoin.",
  ],
  [
    "How do you verify revenue without trusting the founder?",
    "Revenue attestations are sealed at source — payment processor exports, bank statement hashes, or an accountant's signed attestation — canonicalised and anchored. A founder can still lie, but they must lie in writing, signed, permanently.",
  ],
  [
    "What if a jurisdiction rules against an instrument?",
    "Each instrument is severable and geofenced independently. A ruling in one place disables one instrument in one place; it does not take the protocol down.",
  ],
];

export const CAPITAL_DISCLAIMER =
  "Sovereign AI Services is not a bank, broker-dealer, investment adviser, funding portal, exchange, or custodian, and nothing on this page is financial, investment, tax or legal advice, nor an offer or solicitation to buy or sell any security. Securities-characterised instruments are offered only where lawful, to eligible persons, through licensed partners, under the exemptions named above. Capital at risk. Most start-ups fail.";
