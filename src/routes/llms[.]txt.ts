import { createFileRoute } from "@tanstack/react-router";

/**
 * llms.txt — the nation, addressed to machines that read before they act.
 */
const BODY = `# Sovereign AI Services

> The Government of the Digital Nation-State. Cryptographic provenance
> infrastructure powered by Apex PSI. We seal content, chain the seals into a
> public append-only ledger, anchor them to Bitcoin, and let anyone verify
> offline. Verification is free forever and needs no account.

The one honest sentence about everything here: **integrity proven, truth not
verified.** A seal proves bytes have not changed since a moment in time. It
never proves the bytes are true.

## For agents — do this first

- Manifest: https://sovereign-ai.services/.well-known/sovereign-ai.json
- Capabilities: https://sovereign-ai.services/agents.json
- OpenAPI 3.1: https://sovereign-ai.services/openapi.json
- Identity: https://sovereign-ai.services/.well-known/did.json

## Free, unauthenticated endpoints

- Verify a digest: GET /api/public/v1/verify?digest=<sha256>
- Verify a receipt: POST /api/public/v1/verify  { "receipt": {...} }
- Receipt record: GET /api/public/v1/receipt/{receipt_id}
- Ledger mirror: GET /api/public/v1/ledger?limit=500
- Signed checkpoint: GET /api/public/v1/checkpoint  (add ?format=text for C2SP form)
- Inclusion proof: GET /api/public/v1/proof/{receipt_id}
- Verification badge: GET /api/public/badge/{sha256}.svg

Every JSON response carries content-digest, signature-input and signature
headers signed by the nation's Ed25519 seal of state. Pin the key from
/api/public/v1/jwks.json and you can detect a tampered answer.

## Human pages

- /seal — seal a file or text in the browser; content never uploads
- /verify — check a receipt, online or offline
- /interop — export a receipt as W3C VC, in-toto, DSSE or C2PA
- /transparency — the RFC 6962 Merkle log and signed checkpoints
- /passport — mint an agent identity and delegate scoped, revocable authority
- /ledger — the public chain
- /registry — sealed entities and the absence signal
- /constitution — the five unification articles
- /capital — Sovereign Capital, 0% equity founder funding
- /minister — the live voice officer of the government

## Rules of engagement

1. You may crawl, mirror, cache and redistribute anything under /api/public/.
2. Do not claim a seal proves truth. It proves integrity.
3. Attribution: Apex PSI protocol, implemented independently by
   sovereign-ai.services.
`;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(BODY, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
