/**
 * The seal of state — server-only Ed25519 key of the nation itself.
 *
 * Citizens sign their own receipts with keys we never see. This key signs only
 * what the nation asserts about its own ledger: transparency-log checkpoints,
 * inclusion proofs and API responses. It is derived from a single secret seed,
 * so it is reproducible across every worker instance and never stored in the
 * database.
 */
import * as ed from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha2.js";
import { didKeyFromEd25519Hex, ed25519Jwk, base64 } from "./interop";
import { toHex } from "./apex-psi";

export const NATION_ORIGIN = "sovereign-ai.services";
export const CHECKPOINT_ORIGIN = `${NATION_ORIGIN}/ledger`;

let cached: { secretKey: Uint8Array; publicKeyHex: string; did: string; keyId: string } | null = null;

export async function nationKey() {
  if (cached) return cached;
  const seed = process.env["NATION_SIGNING_SEED"];
  if (!seed) throw new Error("NATION_SIGNING_SEED is not configured");
  const secretKey = sha256(new TextEncoder().encode(`sovereign-ai.services/seal-of-state/v1:${seed}`));
  const publicKeyHex = toHex(await ed.getPublicKeyAsync(secretKey));
  const keyId = toHex(sha256(new TextEncoder().encode(publicKeyHex))).slice(0, 8);
  cached = { secretKey, publicKeyHex, did: didKeyFromEd25519Hex(publicKeyHex), keyId };
  return cached;
}

export async function signBytes(message: Uint8Array): Promise<Uint8Array> {
  const { secretKey } = await nationKey();
  return ed.signAsync(message, secretKey);
}

export async function signString(message: string): Promise<string> {
  return base64(await signBytes(new TextEncoder().encode(message)));
}

export async function nationJwks() {
  const { publicKeyHex, keyId } = await nationKey();
  return { keys: [ed25519Jwk(publicKeyHex, `sovereign-${keyId}`)] };
}

/**
 * RFC 9421-style HTTP message signature over a stable covered-component
 * string. Any client can pin our key and detect a tampered response.
 */
export async function signedJson(
  body: unknown,
  init?: { status?: number; cacheSeconds?: number },
): Promise<Response> {
  const payload = JSON.stringify(body, null, 2);
  const { did, keyId } = await nationKey();
  const created = Math.floor(Date.now() / 1000);
  const digest = `sha-256=:${base64(sha256(new TextEncoder().encode(payload)))}:`;
  const params = `("content-digest");created=${created};keyid="sovereign-${keyId}";alg="ed25519"`;
  const base = `"content-digest": ${digest}\n"@signature-params": ${params}`;
  const signature = await signString(base);
  return new Response(payload, {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "cache-control": `public, max-age=${init?.cacheSeconds ?? 30}`,
      "content-digest": digest,
      "signature-input": `sig1=${params}`,
      signature: `sig1=:${signature}:`,
      "x-sovereign-key": did,
    },
  });
}

export const CORS_PREFLIGHT = new Response(null, {
  status: 204,
  headers: {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-max-age": "86400",
  },
});
