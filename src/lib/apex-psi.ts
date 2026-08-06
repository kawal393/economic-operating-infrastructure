/**
 * Apex PSI receipt layer — client-side only.
 *
 * Nothing here touches the network. Content never leaves the browser:
 * hashing is streamed locally, signing happens locally, and the receipt
 * is written to the visitor's disk. A receipt verifies without this site.
 */
import { createSHA256 } from "hash-wasm";
import * as ed from "@noble/ed25519";

export const ISSUER = "sovereign-ai.services";
export const PROTOCOL = "Apex PSI";
export const CANONICALISATION = "RFC 8785";
export const RECEIPT_VERSION = "1.0";

export type ReceiptPredicates = {
  source: "file" | "text";
  name: string;
  size: number;
  mime: string;
};

export type ReceiptBody = {
  version: string;
  protocol: string;
  issuer: string;
  receipt_id: string;
  digest: string;
  digest_algorithm: "SHA-256";
  canonicalisation_method: string;
  timestamp: string;
  predicates: ReceiptPredicates;
  verify_url: string;
  public_key: string;
};

export type Receipt = ReceiptBody & {
  signatures: { ed25519: string };
};

/* ------------------------------------------------------------------ */
/* RFC 8785 canonical JSON                                             */
/* ------------------------------------------------------------------ */

export function canonicalise(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "number") {
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalise).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalise(v)}`).join(",")}}`;
  }
  throw new Error("Value is not canonicalisable");
}

/* ------------------------------------------------------------------ */
/* Encoding helpers                                                    */
/* ------------------------------------------------------------------ */

export function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase();
  if (clean.length % 2 !== 0 || /[^0-9a-f]/.test(clean)) throw new Error("Invalid hex string");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/* ------------------------------------------------------------------ */
/* Streaming SHA-256                                                   */
/* ------------------------------------------------------------------ */

const CHUNK = 4 * 1024 * 1024;

export async function digestFile(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const hasher = await createSHA256();
  hasher.init();
  let read = 0;
  while (read < file.size) {
    const slice = file.slice(read, Math.min(read + CHUNK, file.size));
    hasher.update(new Uint8Array(await slice.arrayBuffer()));
    read += CHUNK;
    onProgress?.(Math.min(1, read / Math.max(file.size, 1)));
  }
  onProgress?.(1);
  return hasher.digest("hex");
}

export async function digestText(text: string): Promise<string> {
  const hasher = await createSHA256();
  hasher.init();
  hasher.update(new TextEncoder().encode(text));
  return hasher.digest("hex");
}

/* ------------------------------------------------------------------ */
/* Ed25519                                                             */
/* ------------------------------------------------------------------ */

export type Keypair = { secretKey: Uint8Array; publicKey: string };

export async function generateKeypair(): Promise<Keypair> {
  const secretKey = ed.utils.randomSecretKey();
  const publicKey = await ed.getPublicKeyAsync(secretKey);
  return { secretKey, publicKey: toHex(publicKey) };
}

export async function signBody(body: ReceiptBody, secretKey: Uint8Array): Promise<string> {
  const message = new TextEncoder().encode(canonicalise(body));
  return toHex(await ed.signAsync(message, secretKey));
}

export async function verifyReceiptSignature(receipt: Receipt): Promise<boolean> {
  try {
    const { signatures, ...body } = receipt;
    const message = new TextEncoder().encode(canonicalise(body));
    return await ed.verifyAsync(
      fromHex(signatures.ed25519),
      message,
      fromHex(receipt.public_key),
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Receipt construction                                                */
/* ------------------------------------------------------------------ */

export function receiptId(digest: string, timestamp: string): string {
  return `psi_${digest.slice(0, 16)}${timestamp.replace(/\D/g, "").slice(8, 14)}`;
}

export async function buildReceipt(input: {
  digest: string;
  predicates: ReceiptPredicates;
  keypair: Keypair;
}): Promise<Receipt> {
  const timestamp = new Date().toISOString();
  const id = receiptId(input.digest, timestamp);
  const body: ReceiptBody = {
    version: RECEIPT_VERSION,
    protocol: PROTOCOL,
    issuer: ISSUER,
    receipt_id: id,
    digest: input.digest,
    digest_algorithm: "SHA-256",
    canonicalisation_method: CANONICALISATION,
    timestamp,
    predicates: input.predicates,
    verify_url: `https://${ISSUER}/verify?id=${id}`,
    public_key: input.keypair.publicKey,
  };
  return { ...body, signatures: { ed25519: await signBody(body, input.keypair.secretKey) } };
}

export function parseReceipt(raw: string): Receipt {
  const parsed = JSON.parse(raw) as Partial<Receipt>;
  if (
    !parsed ||
    typeof parsed.digest !== "string" ||
    typeof parsed.public_key !== "string" ||
    typeof parsed.timestamp !== "string" ||
    !parsed.signatures ||
    typeof parsed.signatures.ed25519 !== "string"
  ) {
    throw new Error("Not a valid Apex PSI receipt");
  }
  return parsed as Receipt;
}

export function downloadText(filename: string, contents: string, mime = "application/json") {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} ${units[i]}`;
}
