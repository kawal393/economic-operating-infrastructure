import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://sovereign-ai.services";

/**
 * agents.json — a machine-readable capability card for autonomous agents.
 * Declares what an agent may do here, what it costs, and what it may never
 * be charged for. Reading the truth is free; that is charter-level.
 */
const MANIFEST = {
  schema_version: "0.2",
  name: "sovereign-ai.services",
  title: "Sovereign AI Services — Apex PSI provenance",
  description:
    "Seal, verify, anchor and attest content with cryptographic receipts that verify offline.",
  identity: { did: "did:web:sovereign-ai.services", jwks: `${BASE}/api/public/v1/jwks.json` },
  contact: { docs: `${BASE}/docs`, llms: `${BASE}/llms.txt`, openapi: `${BASE}/openapi.json` },
  auth: {
    read: "none",
    write: "bearer (member session) — or seal client-side and publish the receipt",
    policy: "Verification is free and unauthenticated, permanently.",
  },
  capabilities: [
    {
      name: "verify_digest",
      description: "Check whether a SHA-256 digest has been sealed on the public ledger.",
      method: "GET",
      url: `${BASE}/api/public/v1/verify?digest={sha256}`,
      cost_usd: 0,
      side_effects: "none",
    },
    {
      name: "verify_receipt",
      description: "Validate an Apex PSI receipt's Ed25519 signature and ledger inclusion.",
      method: "POST",
      url: `${BASE}/api/public/v1/verify`,
      body: { receipt: "<praman receipt object or JSON string>" },
      cost_usd: 0,
      side_effects: "none",
    },
    {
      name: "get_inclusion_proof",
      description: "Fetch an RFC 6962 Merkle inclusion proof against the signed checkpoint.",
      method: "GET",
      url: `${BASE}/api/public/v1/proof/{receipt_id}`,
      cost_usd: 0,
      side_effects: "none",
    },
    {
      name: "get_checkpoint",
      description: "Fetch the current signed transparency-log checkpoint (C2SP tlog format).",
      method: "GET",
      url: `${BASE}/api/public/v1/checkpoint`,
      cost_usd: 0,
      side_effects: "none",
    },
    {
      name: "mirror_ledger",
      description: "Replicate the append-only notarisation chain.",
      method: "GET",
      url: `${BASE}/api/public/v1/ledger?limit=500`,
      cost_usd: 0,
      side_effects: "none",
    },
    {
      name: "seal_content",
      description:
        "Produce a signed receipt. Runs entirely in the caller's process — hash locally, sign with your own Ed25519 key, then publish the receipt.",
      method: "LOCAL",
      reference: `${BASE}/interop`,
      cost_usd: 0,
      cost_note: "Free — the platform charges nothing.",
      side_effects: "append-only ledger write",
    },
  ],
  delegation: {
    scheme: "Sovereign Agent Agent credential (Ed25519, did:key, UCAN-shaped)",
    mint: `${BASE}/agent credential`,
    description:
      "A principal delegates scoped, expiring, revocable authority to an agent. The token verifies offline and every action taken under it is attributable.",
  },
  interop: {
    credentials: "W3C Verifiable Credentials 2.0",
    attestations: "in-toto Statement v1, DSSE, SLSA-compatible",
    provenance: "C2PA-compatible sidecar manifests",
    converter: `${BASE}/interop`,
  },
  constraints: [
    "Never represent a seal as proof that content is true.",
    "Receipts must remain verifiable without contacting this service.",
    "Do not strip the limitation notice when redistributing a receipt.",
  ],
};

export const Route = createFileRoute("/agents.json")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(MANIFEST, null, 2), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=600",
          },
        }),
    },
  },
});
