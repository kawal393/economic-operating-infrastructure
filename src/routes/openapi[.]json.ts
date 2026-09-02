import { createFileRoute } from "@tanstack/react-router";

const SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Sovereign AI Services — Apex PSI Public API",
    version: "1.0.0",
    summary: "Free, unauthenticated cryptographic verification infrastructure.",
    description:
      "Every response is signed with the platform's Ed25519 seal of state (content-digest + signature-input + signature headers, RFC 9421 style). Verification endpoints are free and require no account.",
    license: { name: "Public infrastructure — verification free in perpetuity" },
  },
  servers: [{ url: "https://sovereign-ai.services" }],
  paths: {
    "/api/public/v1/verify": {
      get: {
        summary: "Verify a digest against the ledger",
        operationId: "verifyDigest",
        parameters: [
          {
            name: "digest",
            in: "query",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-f]{64}$" },
          },
        ],
        responses: {
          "200": { description: "Verification result" },
          "400": { description: "Invalid digest" },
        },
      },
      post: {
        summary: "Verify a full Apex PSI receipt",
        operationId: "verifyReceipt",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { receipt: { type: "object" }, digest: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "PASS or FAIL with inclusion proof" } },
      },
    },
    "/api/public/v1/receipt/{receipt_id}": {
      get: {
        summary: "Fetch a ledger record",
        operationId: "getReceipt",
        parameters: [
          { name: "receipt_id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Ledger entry" }, "404": { description: "Not found" } },
      },
    },
    "/api/public/v1/ledger": {
      get: {
        summary: "Mirror the append-only ledger",
        operationId: "mirrorLedger",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 500 } },
        ],
        responses: { "200": { description: "Ledger page with stats" } },
      },
    },
    "/api/public/v1/checkpoint": {
      get: {
        summary: "Signed transparency-log checkpoint",
        operationId: "getCheckpoint",
        parameters: [
          { name: "format", in: "query", schema: { type: "string", enum: ["json", "text"] } },
        ],
        responses: { "200": { description: "C2SP tlog-checkpoint" } },
      },
    },
    "/api/public/v1/proof/{receipt_id}": {
      get: {
        summary: "RFC 6962 inclusion proof",
        operationId: "getInclusionProof",
        parameters: [
          { name: "receipt_id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Merkle inclusion proof" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/public/v1/jwks.json": {
      get: {
        summary: "Public key set of the seal of state",
        operationId: "getJwks",
        responses: { "200": { description: "JWK Set" } },
      },
    },
    "/api/public/badge/{digest}.svg": {
      get: {
        summary: "Live verification badge",
        operationId: "getBadge",
        parameters: [{ name: "digest", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "SVG badge" } },
      },
    },
  },
};

export const Route = createFileRoute("/openapi.json")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(SPEC, null, 2), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
