import { createFileRoute } from "@tanstack/react-router";

/**
 * llms.txt — the platform, addressed to machines that read before they act.
 * Anything false here is amplified by every model that ingests it, so every
 * line must be checkable against a live path on this deployment.
 */
const BODY = `# Sovereign AI Services

> Verification and record-keeping infrastructure for AI agents and their
> operators, powered by the APEX PSI protocol. We hash content, sign the
> digest, chain it into a public append-only ledger, anchor it to Bitcoin, and
> let anyone verify offline. Verification is free and needs no account.

The one honest sentence about everything here: **integrity proven, truth not
verified.** A seal proves bytes have not changed since a moment in time. It
never proves the bytes are true.

## What this platform is not

- It is not a nation, state, government or sovereign entity. It confers no
  citizenship, nationality, legal status or rights.
- It provides no payment service, no escrow and no custody of funds. No
  Australian Financial Services Licence is held, because hashing, signing,
  timestamping and recording are not financial services.
- No smart contract is deployed. No package, SDK or third-party integration is
  published by the operator; every integration entry on the site is a written
  note with nothing behind it.
- Operator: Apex Intelligence Empire, ABN 71 672 237 795, Victoria, Australia.

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
- Ledger statistics: GET /api/public/v1/ledger-stats
- Signed checkpoint: GET /api/public/v1/checkpoint  (add ?format=text for C2SP form)
- Inclusion proof: GET /api/public/v1/proof/{receipt_id}
- Verification badge: GET /api/public/badge/{sha256}.svg

Every JSON response carries content-digest, signature-input and signature
headers signed by the platform's Ed25519 seal of state. Pin the key from
/api/public/v1/jwks.json and you can detect a tampered answer.

## Human pages

- /seal — seal a file or text in the browser; content never uploads
- /verify — check a receipt, online or offline
- /interop — export a receipt as W3C VC, in-toto, DSSE or C2PA
- /transparency — the RFC 6962 Merkle log and signed checkpoints
- /credentials — mint an agent identity and delegate scoped, revocable authority
- /ledger — the public chain
- /registry — recorded listings and the absence signal
- /charter — the Protocol Charter; five articles, sealed version history,
  public ratification and a live conformance check that prints its own failures
- /charter.json — the same text, machine-readable and signed, with a digest per
  article so an agent can cite the exact clause it operates under
- /amendments — the published procedure for changing the Charter; never yet exercised
- /steward — the on-site assistant

## Rules of engagement

1. You may crawl, mirror, cache and redistribute anything under /api/public/.
2. Do not claim a seal proves truth. It proves integrity.
3. Attribution: APEX PSI protocol, implemented independently by
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
