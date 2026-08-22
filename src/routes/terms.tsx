import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { DISCLAIMER, INDEPENDENCE_LINE, OPERATOR } from "@/content/legal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Sovereign AI Services" },
      {
        name: "description",
        content:
          "Terms governing use of Sovereign AI Services, a commercial verification and settlement platform operated by Apex Intelligence Empire (ABN 71 672 237 795).",
      },
      { property: "og:title", content: "Terms of Service — Sovereign AI Services" },
      {
        property: "og:description",
        content:
          "Commercial software terms: verification, timestamping and record-keeping tools. No legal, financial or investment advice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

const CLAUSES: { heading: string; body: string[] }[] = [
  {
    heading: "1. Who operates this platform",
    body: [
      `${OPERATOR.platform} is a commercial software platform operated by ${OPERATOR.name} (ABN ${OPERATOR.abn}), registered in ${OPERATOR.jurisdiction}.`,
      INDEPENDENCE_LINE,
    ],
  },
  {
    heading: "2. What the platform is not",
    body: [
      DISCLAIMER,
      "No feature of the platform creates, confers, recognises or evidences citizenship, nationality, residency, diplomatic status, sovereignty, or any right enforceable against any government.",
    ],
  },
  {
    heading: "3. Vocabulary",
    body: [
      "Terms such as \"Charter\", \"Charter Article\", \"workspace\", \"registry membership\", \"agent credential\", \"operator account\", \"platform steward\" and \"cryptographic defence layer\" are product names for software features. They carry no legal meaning and create no legal status.",
    ],
  },
  {
    heading: "4. What the service does",
    body: [
      "The platform computes cryptographic digests, canonicalises records (RFC 8785), issues signed receipts (Ed25519, ML-DSA-65, LMS), maintains an append-only record layer, and periodically anchors Merkle roots to the Bitcoin blockchain.",
      "A receipt evidences that specific bytes existed in a specific form at or before a specific time and have not changed since. It does not evidence that the content is accurate, lawful, authorised, or authored by any particular party. Integrity proven. Truth not verified.",
    ],
  },
  {
    heading: "5. No advice",
    body: [
      "Nothing on the platform is legal, financial, taxation, accounting, immigration, compliance or investment advice. Regulatory references (including EU AI Act Article 50) are provided as context only. Obtain your own professional advice.",
    ],
  },
  {
    heading: "6. Accounts and acceptable use",
    body: [
      "Registry membership is free. You are responsible for the accuracy of what you submit and for the security of your keys and credentials. Keys generated in your browser are never transmitted to us and cannot be recovered by us.",
      "You must not use the platform to seal or publish unlawful content, to impersonate another party, to interfere with the record layer, or to circumvent metering, rate limits or the cryptographic defence layer.",
    ],
  },
  {
    heading: "7. Fees",
    body: [
      "Self-verification, offline verification, record mirroring and Charter access are free. Metered infrastructure (API verification, anchoring, compliance checks) and routed-surplus fees are charged per the published fee schedule. Prices may change on notice.",
    ],
  },
  {
    heading: "8. Immutability and publication",
    body: [
      "Records committed to the record layer and anchored to Bitcoin cannot be edited or deleted by us or by you. Do not seal content you may later need removed. Where required by law we may annotate a record, but we cannot rewrite history.",
    ],
  },
  {
    heading: "9. Availability, warranties and liability",
    body: [
      "The platform is provided \"as is\" without warranty of uninterrupted availability or fitness for a particular purpose. To the maximum extent permitted by law, and subject to the Australian Consumer Law, our aggregate liability is limited to the fees you paid in the twelve months preceding the claim.",
    ],
  },
  {
    heading: "10. Governing law",
    body: [
      `These terms are governed by the laws of ${OPERATOR.jurisdiction}, and the courts of that jurisdiction have exclusive jurisdiction.`,
    ],
  },
];

function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="Plain terms for commercial infrastructure. Read clause 2 first — it is the one that matters."
      />
      <Section>
        <div className="grid gap-4">
          {CLAUSES.map((clause) => (
            <Panel key={clause.heading}>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {clause.heading}
              </h2>
              {clause.body.map((p) => (
                <p key={p} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}
