import { createFileRoute } from "@tanstack/react-router";
import { readStats } from "@/lib/ledger.server";
import { currentCheckpoint } from "@/lib/transparency.server";
import { nationKey } from "@/lib/nation-key.server";

/**
 * The nation manifest — one fetch tells a machine everything it needs to
 * verify us, mirror us, or route work to us. No SDK, no key, no signup.
 */
export const Route = createFileRoute("/.well-known/sovereign-ai.json")({
  server: {
    handlers: {
      GET: async () => {
        const [stats, checkpoint, key] = await Promise.all([
          readStats().catch(() => null),
          currentCheckpoint().catch(() => null),
          nationKey(),
        ]);
        const base = "https://sovereign-ai.services";
        const manifest = {
          protocol: "Apex PSI",
          nation: "Sovereign AI Services",
          tagline: "The System architecture of the Workspace",
          version: "1.0",
          did: "did:web:sovereign-ai.services",
          key: { alg: "Ed25519", did: key.did, jwks: `${base}/api/public/v1/jwks.json` },
          capabilities: ["seal", "verify", "anchor", "attest", "mirror", "delegate"],
          endpoints: {
            verify: `${base}/api/public/v1/verify`,
            receipt: `${base}/api/public/v1/receipt/{receipt_id}`,
            ledger: `${base}/api/public/v1/ledger`,
            checkpoint: `${base}/api/public/v1/checkpoint`,
            inclusion_proof: `${base}/api/public/v1/proof/{receipt_id}`,
            badge: `${base}/api/public/badge/{sha256}.svg`,
            openapi: `${base}/openapi.json`,
            agents: `${base}/agents.json`,
            offline_verifier: `${base}/offline-verifier.html`,
          },
          standards: {
            canonicalisation: "RFC 8785 (JCS)",
            signature: "Ed25519 (RFC 8032)",
            transparency_log: "RFC 6962 Merkle tree, C2SP tlog-checkpoint",
            http_signatures: "RFC 9421 style (content-digest + signature-input)",
            credentials: "W3C Verifiable Credentials 2.0",
            attestations: "in-toto Statement v1 / DSSE",
            provenance: "C2PA-compatible sidecar manifest",
            identity: "did:web + did:key",
          },
          ledger: stats
            ? { entries: stats.entries, head: stats.head, members: stats.members }
            : null,
          checkpoint: checkpoint
            ? { size: checkpoint.size, root: checkpoint.rootHash, signature: checkpoint.signature }
            : null,
          guarantees: [
            "Verification is free and requires no account.",
            "Receipts verify offline, without this site existing.",
            "The ledger is append-only and publicly mirrorable.",
          ],
          limitation: "Integrity proven. Truth not verified.",
        };
        return new Response(JSON.stringify(manifest, null, 2), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=120",
          },
        });
      },
    },
  },
});
