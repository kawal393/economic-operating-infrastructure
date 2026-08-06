import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { PageHeader, Panel, Section, SectionHeading } from "@/components/primitives";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Documentation — Seal, Verify, Anchor | Sovereign AI Services" },
      {
        name: "description",
        content:
          "REST API reference for sealing content, verifying receipts, anchoring to Bitcoin, running compliance checks and registering citizens.",
      },
      { property: "og:title", content: "Sovereign AI Services API Documentation" },
      {
        property: "og:description",
        content: "Seal, verify, anchor and comply — the full REST reference.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/docs" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/docs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Sovereign AI Services API Documentation",
          description:
            "REST API reference for sealing content, verifying receipts and anchoring to Bitcoin.",
        }),
      },
    ],
  }),
  component: DocsPage,
});

const ENDPOINTS = [
  {
    method: "POST",
    path: "/v1/seal",
    summary: "Seal content and receive a signed provenance receipt.",
    body: `{
  "content_hash": "sha256:9f2c...41ab",
  "protocol_id": "psi-media",
  "metadata": { "model": "gpt-x", "purpose": "editorial" }
}`,
    response: `{
  "receipt_id": "rcpt_8fa10c",
  "signature": {
    "ed25519": "base64...",
    "ml_dsa_65": "base64..."
  },
  "anchor_status": "pending",
  "fee": "0.001"
}`,
  },
  {
    method: "GET",
    path: "/v1/verify/{receipt_id}",
    summary: "Verify a receipt and its anchor inclusion proof.",
    body: "// no body",
    response: `{
  "valid": true,
  "protocol_id": "psi-media",
  "anchored": true,
  "bitcoin_block": 932141,
  "verified_at": "2026-08-06T09:14:22Z"
}`,
  },
  {
    method: "POST",
    path: "/v1/anchor",
    summary: "Commit a Merkle root to Bitcoin via OpenTimestamps.",
    body: `{ "merkle_root": "0x4f1a...9c2b" }`,
    response: `{
  "anchor_id": "anc_20f4b1",
  "window": 88214,
  "ots_proof": "base64...",
  "fee": "0.01"
}`,
  },
  {
    method: "POST",
    path: "/v1/compliance/check",
    summary: "Run a sector protocol evaluation and issue a conformity receipt.",
    body: `{
  "receipt_id": "rcpt_8fa10c",
  "framework": "EU_AI_ACT_ART_50"
}`,
    response: `{
  "conformant": true,
  "framework": "EU_AI_ACT_ART_50",
  "findings": [],
  "fee": "0.10"
}`,
  },
  {
    method: "POST",
    path: "/v1/citizens",
    summary: "Register a human, AI or institutional citizen.",
    body: `{
  "citizen_type": "ai",
  "public_key": "ed25519:MCowBQ...",
  "declaration": "I accept the five Articles."
}`,
    response: `{
  "citizen_id": "ctz_4a91e0",
  "citizen_type": "ai",
  "status": "verified",
  "registered_at": "2026-08-06T09:00:00Z"
}`,
  },
];

const ERRORS = [
  ["400", "invalid_request", "Body failed schema validation."],
  ["401", "unauthenticated", "Missing or malformed API key."],
  ["402", "fee_required", "Account balance below the metered fee."],
  ["404", "receipt_not_found", "No receipt exists for the supplied identifier."],
  ["409", "already_anchored", "The Merkle root is already committed for this window."],
  ["422", "protocol_violation", "The request contradicts a constitutional Article."],
  ["429", "rate_limited", "Too many requests for this key's tier."],
];

function DocsPage() {
  const [active, setActive] = useState(ENDPOINTS[0]!.path);
  const endpoint = ENDPOINTS.find((e) => e.path === active) ?? ENDPOINTS[0]!;

  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text);
    toast("Copied to clipboard");
  };

  return (
    <>
      <PageHeader
        eyebrow="API Documentation"
        title="Four verbs run the nation: seal, verify, anchor, comply"
        description="A REST surface over the protocol. Every response is a signed object; every signed object is independently recomputable without asking us for permission."
      />

      <Section>
        <SectionHeading
          eyebrow="Getting started"
          title="Authentication"
          description="Send your key as a bearer token. Keys are scoped per nation-state and rotate without downtime."
        />
        <Panel className="mt-8 p-7">
          <div className="flex items-start justify-between gap-4">
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-gold">
{`curl https://api.sovereign-ai.services/v1/verify/rcpt_8fa10c \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json"`}
            </pre>
            <button
              type="button"
              onClick={() =>
                copy(
                  'curl https://api.sovereign-ai.services/v1/verify/rcpt_8fa10c -H "Authorization: Bearer sk_live_..."',
                )
              }
              className="shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
              aria-label="Copy example request"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </Panel>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading eyebrow="Reference" title="Endpoints" />
        <div className="mt-10 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <nav className="space-y-2">
            {ENDPOINTS.map((e) => (
              <button
                key={e.path}
                type="button"
                onClick={() => setActive(e.path)}
                className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
                  active === e.path
                    ? "border-gold/40 bg-gold/10"
                    : "border-border bg-secondary/30 hover:border-gold/25"
                }`}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                    e.method === "GET" ? "text-success" : "text-gold"
                  }`}
                >
                  {e.method}
                </span>
                <span className="font-mono text-xs text-foreground">{e.path}</span>
              </button>
            ))}
          </nav>

          <Panel className="p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  endpoint.method === "GET"
                    ? "border-success/40 text-success"
                    : "border-gold/40 text-gold"
                }`}
              >
                {endpoint.method}
              </span>
              <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{endpoint.summary}</p>

            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {[
                ["Request", endpoint.body],
                ["Response", endpoint.response],
              ].map(([label, code]) => (
                <div key={label}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-background/70 p-4 font-mono text-xs leading-relaxed text-gold">
                    {code}
                  </pre>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Failure modes"
          title="Error codes"
          description="Errors are explicit. The protocol never fails silently."
        />
        <Panel className="mt-10 overflow-x-auto p-7">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Status", "Code", "Meaning"].map((h) => (
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
              {ERRORS.map((row) => (
                <tr key={row[1]}>
                  <td className="py-3.5 pr-6 font-mono text-sm text-gold">{row[0]}</td>
                  <td className="py-3.5 pr-6 font-mono text-xs text-foreground">{row[1]}</td>
                  <td className="py-3.5 text-sm text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <p className="mt-8 text-sm text-muted-foreground">
          Metering and tier limits are published on the{" "}
          <Link to="/pricing" className="text-gold hover:underline">
            pricing page
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
