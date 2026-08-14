import { createFileRoute } from "@tanstack/react-router";
import { parseReceipt, verifyReceiptSignature } from "@/lib/apex-psi";
import { findByDigest, readEntry } from "@/lib/ledger.server";
import { proofFor } from "@/lib/transparency.server";
import { CORS_PREFLIGHT, signedJson } from "@/lib/nation-key.server";

/**
 * The open verification endpoint. No key, no account, no rate card — verifying
 * the truth of a receipt must never cost anything, or the proof is not public.
 */
async function verifyDigest(digest: string) {
  const entries = await findByDigest(digest);
  return {
    query: { digest },
    sealed: entries.length > 0,
    occurrences: entries.length,
    entries: entries.map((e) => ({
      receipt_id: e.receipt_id,
      sequence: e.sequence,
      chain_hash: e.chain_hash,
      anchor_status: e.anchor_status,
      created_at: e.created_at,
      permalink: `https://sovereign-ai.services/r/${e.receipt_id}`,
    })),
    assertion: entries.length
      ? "These bytes were sealed at the stated time and have not changed since."
      : "No seal on record for these bytes. Absence of a seal is not evidence of alteration.",
    limitation: "Integrity proven. Truth not verified.",
  };
}

export const Route = createFileRoute("/api/public/v1/verify")({
  server: {
    handlers: {
      OPTIONS: () => CORS_PREFLIGHT.clone(),
      GET: async ({ request }) => {
        const digest = (new URL(request.url).searchParams.get("digest") ?? "").toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(digest)) {
          return signedJson(
            { error: "invalid_digest", message: "Pass ?digest= a 64-character SHA-256 hex digest." },
            { status: 400, cacheSeconds: 0 },
          );
        }
        return signedJson(await verifyDigest(digest));
      },
      POST: async ({ request }) => {
        let payload: { receipt?: unknown; digest?: unknown };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return signedJson({ error: "invalid_json" }, { status: 400, cacheSeconds: 0 });
        }

        if (typeof payload.digest === "string" && /^[0-9a-f]{64}$/.test(payload.digest)) {
          return signedJson(await verifyDigest(payload.digest.toLowerCase()));
        }

        const raw =
          typeof payload.receipt === "string" ? payload.receipt : JSON.stringify(payload.receipt);
        try {
          const receipt = parseReceipt(raw);
          const signatureValid = await verifyReceiptSignature(receipt);
          const entry = await readEntry(receipt.receipt_id);
          const proof = entry ? await proofFor(receipt.receipt_id) : null;
          return signedJson(
            {
              receipt_id: receipt.receipt_id,
              digest: receipt.digest,
              signature_valid: signatureValid,
              signer: receipt.public_key,
              sealed_at: receipt.timestamp,
              on_ledger: Boolean(entry),
              sequence: entry?.sequence ?? null,
              anchor_status: entry?.anchor_status ?? "unpublished",
              inclusion_proof: proof
                ? { leafIndex: proof.leafIndex, treeSize: proof.treeSize, rootHash: proof.rootHash, path: proof.path }
                : null,
              verdict: signatureValid ? "PASS" : "FAIL",
              limitation: "Integrity proven. Truth not verified.",
            },
            { cacheSeconds: 0 },
          );
        } catch {
          return signedJson(
            { error: "invalid_receipt", message: "Body must be { receipt } or { digest }." },
            { status: 400, cacheSeconds: 0 },
          );
        }
      },
    },
  },
});
