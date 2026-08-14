/**
 * The Transparency Log — RFC 6962 Merkle tree over the notarisation chain.
 *
 * The chain already makes rewriting history detectable to anyone reading the
 * whole ledger. This makes it detectable to someone holding a single receipt
 * and 200 bytes of proof, offline, forever. Checkpoints are signed with the
 * seal of state in the C2SP tlog-checkpoint format, so third-party witnesses
 * can co-sign and catch us if we ever fork our own history.
 */
import { sha256 } from "@noble/hashes/sha2.js";
import { toHex } from "./apex-psi";
import { base64 } from "./interop";
import { CHECKPOINT_ORIGIN, nationKey, signString } from "./nation-key.server";
import { publicClient } from "./ledger.server";

export type Leaf = {
  sequence: number;
  receipt_id: string;
  content_hash: string;
  chain_hash: string;
  created_at: string;
};

export type Checkpoint = {
  origin: string;
  size: number;
  rootHash: string;
  rootBase64: string;
  timestamp: string;
  keyId: string;
  did: string;
  signature: string;
  note: string;
};

export type InclusionProof = {
  receiptId: string;
  leafIndex: number;
  leafHash: string;
  treeSize: number;
  rootHash: string;
  path: string[];
  checkpoint: Checkpoint;
  verifyHint: string;
};

const utf8 = (value: string) => new TextEncoder().encode(value);

/** RFC 6962 §2.1 — leaf hash is SHA-256(0x00 || leaf data). */
export function leafHash(leaf: Leaf): Uint8Array {
  const data = utf8(
    `${leaf.sequence}|${leaf.receipt_id}|${leaf.content_hash}|${leaf.chain_hash}|${leaf.created_at}`,
  );
  const buf = new Uint8Array(data.length + 1);
  buf[0] = 0x00;
  buf.set(data, 1);
  return sha256(buf);
}

/** RFC 6962 §2.1 — interior node is SHA-256(0x01 || left || right). */
function nodeHash(left: Uint8Array, right: Uint8Array): Uint8Array {
  const buf = new Uint8Array(1 + left.length + right.length);
  buf[0] = 0x01;
  buf.set(left, 1);
  buf.set(right, 1 + left.length);
  return sha256(buf);
}

export function merkleRoot(leaves: Uint8Array[]): Uint8Array {
  if (leaves.length === 0) return sha256(new Uint8Array(0));
  let level = leaves;
  while (level.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(i + 1 < level.length ? nodeHash(level[i]!, level[i + 1]!) : level[i]!);
    }
    level = next;
  }
  return level[0]!;
}

export function inclusionPath(leaves: Uint8Array[], index: number): Uint8Array[] {
  const path: Uint8Array[] = [];
  let level = leaves;
  let i = index;
  while (level.length > 1) {
    const sibling = i % 2 === 0 ? level[i + 1] : level[i - 1];
    if (sibling) path.push(sibling);
    const next: Uint8Array[] = [];
    for (let j = 0; j < level.length; j += 2) {
      next.push(j + 1 < level.length ? nodeHash(level[j]!, level[j + 1]!) : level[j]!);
    }
    level = next;
    i = Math.floor(i / 2);
  }
  return path;
}

async function readAllLeaves(): Promise<Leaf[]> {
  const { data, error } = await publicClient()
    .from("notarizations")
    .select("sequence, receipt_id, content_hash, chain_hash, created_at")
    .order("sequence", { ascending: true })
    .limit(10_000);
  if (error) throw new Error(error.message);
  return (data ?? []) as Leaf[];
}

/** C2SP tlog-checkpoint body: origin, size, base64 root, then signature line. */
export function checkpointText(cp: Checkpoint): string {
  return `${cp.origin}\n${cp.size}\n${cp.rootBase64}\n\n— ${cp.origin} ${cp.signature}\n`;
}

async function sign(size: number, rootBase64: string) {
  const { did, keyId } = await nationKey();
  const body = `${CHECKPOINT_ORIGIN}\n${size}\n${rootBase64}\n`;
  return { signature: await signString(body), did, keyId };
}

export async function currentCheckpoint(): Promise<Checkpoint & { leaves: number }> {
  const leaves = await readAllLeaves();
  const root = merkleRoot(leaves.map(leafHash));
  const rootBase64 = base64(root);
  const { signature, did, keyId } = await sign(leaves.length, rootBase64);
  return {
    origin: CHECKPOINT_ORIGIN,
    size: leaves.length,
    rootHash: toHex(root),
    rootBase64,
    timestamp: new Date().toISOString(),
    keyId,
    did,
    signature,
    note: "Signed by the seal of state. Witnesses may co-sign; a fork of this log would need two contradictory signatures under the same key.",
    leaves: leaves.length,
  };
}

export async function proofFor(receiptId: string): Promise<InclusionProof | null> {
  const leaves = await readAllLeaves();
  const index = leaves.findIndex((l) => l.receipt_id === receiptId);
  if (index < 0) return null;
  const hashes = leaves.map(leafHash);
  const root = merkleRoot(hashes);
  const rootBase64 = base64(root);
  const { signature, did, keyId } = await sign(leaves.length, rootBase64);
  return {
    receiptId,
    leafIndex: index,
    leafHash: toHex(hashes[index]!),
    treeSize: leaves.length,
    rootHash: toHex(root),
    path: inclusionPath(hashes, index).map(toHex),
    checkpoint: {
      origin: CHECKPOINT_ORIGIN,
      size: leaves.length,
      rootHash: toHex(root),
      rootBase64,
      timestamp: new Date().toISOString(),
      keyId,
      did,
      signature,
      note: "RFC 6962 inclusion proof. Recompute upward from the leaf hash and compare to the signed root.",
    },
    verifyHint:
      "h = leafHash; for each sibling s in path: h = SHA-256(0x01 || min-side ordering by index parity). Reference implementation ships in the offline verifier.",
  };
}
