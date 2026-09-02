import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Section } from "@/components/primitives";
import { DISCLAIMER, OPERATOR } from "@/content/legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Sovereign AI Services" },
      {
        name: "description",
        content:
          "How Sovereign AI Services handles personal information: local-first hashing, minimal collection, and permanent records you choose to publish.",
      },
      { property: "og:title", content: "Privacy Policy — Sovereign AI Services" },
      {
        property: "og:description",
        content:
          "Local-first hashing, minimal collection, and an honest account of what cannot be deleted once anchored.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Who handles your data",
    body: [
      `${OPERATOR.name} (ABN ${OPERATOR.abn}), ${OPERATOR.jurisdiction}, operating the ${OPERATOR.platform} platform, is the entity responsible for personal information collected here. We handle personal information in accordance with the Australian Privacy Principles.`,
      DISCLAIMER,
    ],
  },
  {
    heading: "2. What we collect",
    body: [
      "Account data you provide (email, display name, organisation, domain claims). Usage and security telemetry (request metadata, IP address, rate-limit and threat-screening events).",
      "No payment data is collected. No payment processor is connected to the platform and nothing on it is chargeable, so there are no purchase records to hold. If metered capacity is ever sold, this policy will be updated before the first transaction and payment records will be handled by that processor, not by us.",
      "We do not sell personal information and we do not use it to train models.",
    ],
  },
  {
    heading: "3. What never reaches us",
    body: [
      "Sealing and verification hash your content locally in your browser. The file bytes, the pasted text and any signing key generated in the browser are not uploaded. Only a digest — and only if you choose to publish it — reaches the record layer.",
    ],
  },
  {
    heading: "4. Public and permanent records",
    body: [
      "Anything you publish to the public record layer (digests, receipt identifiers, registry profiles, attestations) is public by design and is anchored to Bitcoin. Anchored records cannot be edited or erased by us or by you. Do not publish personal information you may later need withdrawn.",
    ],
  },
  {
    heading: "5. Cookies and local storage",
    body: [
      "We use strictly necessary storage for your session and for remembering that you dismissed the legal notice. We do not run advertising trackers.",
    ],
  },
  {
    heading: "6. Retention and your rights",
    body: [
      "Account and telemetry data are retained only as long as needed for the service, security and legal obligations. You may request access to, correction of, or deletion of account data. Where data is anchored on a public chain, deletion is technically impossible and we will say so rather than pretend otherwise.",
    ],
  },
  {
    heading: "7. Contact",
    body: [
      "Privacy requests and complaints: privacy@sovereign-ai.services. If unresolved, you may contact the Office of the Australian Information Commissioner.",
    ],
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="Local-first by construction: most of your content never reaches our servers at all."
      />
      <Section>
        <div className="grid gap-4">
          {SECTIONS.map((s) => (
            <Panel key={s.heading}>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{s.heading}</h2>
              {s.body.map((p) => (
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
