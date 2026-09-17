/**
 * THE FIVE MASTER PRIMITIVES — one engine, five gates.
 *
 * Doctrine check: the primitives are not five products. They are five
 * PREDICATE PROFILES riding the one proven verb chain:
 *
 *   SEAL   — canonicalise (RFC 8785) -> SHA-256 -> Ed25519 sign (Apex PSI receipt)
 *   VERIFY — recompute the canonical form, verify the signature
 *   AUDIT  — flip one byte anywhere -> verification must fail
 *   ANCHOR — Merkle-root the batch (RFC 6962 s2.1, same math as the live ledger)
 *
 * Runs on Node 22:  node --experimental-strip-types primitives-demo.mts
 * No network. No secrets. The key is generated fresh in memory and printed
 * so every verdict below can be re-checked by anyone holding the receipts.
 */
import * as ed from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha2.js";
import {
  canonicalise,
  toHex,
  fromHex,
  digestText,
  receiptId,
  generateKeypair,
  ISSUER,
  PROTOCOL,
  CANONICALISATION,
  RECEIPT_VERSION,
  type ReceiptBody,
} from "./src/lib/apex-psi.ts";

type Body = Omit<ReceiptBody, "predicates"> & { predicates: Record<string, unknown> };
type Receipt = Body & { signatures: { ed25519: string } };

const utf8 = (s: string) => new TextEncoder().encode(s);
const concat = (...bufs: Uint8Array[]) => {
  const out = new Uint8Array(bufs.reduce((n, b) => n + b.length, 0));
  let o = 0;
  for (const b of bufs) { out.set(b, o); o += b.length; }
  return out;
};
const hx = (s: string) => `${s.slice(0, 16)}…${s.slice(-8)}`;
const bytesOf = (s: string) => utf8(s).length;

/* ------------------------------------------------------------------ */
/* SEAL + VERIFY — mirrors src/lib/apex-psi.ts byte-for-byte          */
/* ------------------------------------------------------------------ */

async function seal(
  title: string,
  contentText: string,
  predicates: Record<string, unknown>,
  keypair: { secretKey: Uint8Array; publicKey: string },
) {
  const digest = await digestText(contentText);
  const timestamp = new Date().toISOString();
  const id = receiptId(digest, timestamp);
  const body: Body = {
    version: RECEIPT_VERSION,
    protocol: PROTOCOL,
    issuer: ISSUER,
    receipt_id: id,
    digest,
    digest_algorithm: "SHA-256",
    canonicalisation_method: CANONICALISATION,
    timestamp,
    predicates,
    verify_url: `https://${ISSUER}/verify?id=${id}`,
    public_key: keypair.publicKey,
  };
  const signature = toHex(await ed.signAsync(utf8(canonicalise(body)), keypair.secretKey));
  return { title, receipt: { ...body, signatures: { ed25519: signature } } as Receipt };
}

async function verify(receipt: Receipt): Promise<boolean> {
  try {
    const { signatures, ...body } = receipt;
    return await ed.verifyAsync(
      fromHex(signatures.ed25519),
      utf8(canonicalise(body)),
      fromHex(receipt.public_key),
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* ANCHOR — RFC 6962 s2.1, mirrored from src/lib/transparency.server.ts */
/* ------------------------------------------------------------------ */

function merkleRoot(leaves: Uint8Array[]): Uint8Array {
  if (leaves.length === 0) return sha256(new Uint8Array(0));
  let level = leaves;
  while (level.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]!;
      const right = i + 1 < level.length ? level[i + 1]! : level[i]!;
      next.push(sha256(concat(new Uint8Array([0x01]), left, right)));
    }
    level = next;
  }
  return level[0]!;
}

/* ------------------------------------------------------------------ */
/* THE FIVE PRIMITIVES — five predicate profiles, one verb chain       */
/* ------------------------------------------------------------------ */

const DOC_I = `APEX ESTATE - QUARTERLY TRUTH REPORT (Q3 2026)
Prepared under the VOW: THE MIRROR DOES NOT BEND.
This report states only facts recorded in EMPIRE_STATE.md.
A seal certifies WORDS + TIME. It never certifies the truth of claims.`;

async function main() {
  const keypair = await generateKeypair();

  // II needs a prompt digest inside its predicates.
  const promptII =
    "You are the steward agent. Draft one reply to a public GitHub issue. Disclose AI assistance.";
  const promptDigestII = await digestText(promptII);

  const ledgerPayloadIII = canonicalise({
    ledger: "apex-infrastructure.com/notarizations",
    entries: 412,
    span: "2026-06-01/2026-08-31",
  });
  const ledgerDigestIII = await digestText(ledgerPayloadIII);

  const mediaDigestIV = await digestText("PRAMAAN witness sample - liveness challenge frame bundle");

  const five: { title: string; content: string; predicates: Record<string, unknown> }[] = [
    {
      title: "I   TRUTH & PROOF          - seal a document",
      content: DOC_I,
      predicates: {
        source: "file",
        name: "quarterly-truth-report-q3-2026.txt",
        size: bytesOf(DOC_I),
        mime: "text/plain",
      },
    },
    {
      title: "II  AGI & INTELLIGENCE     - seal an agent decision",
      content: canonicalise({
        agent_id: "apex-steward-01",
        model: "llama-3.2-3b-instruct (local)",
        decision: "draft_reply_to_public_issue",
        prompt_digest: promptDigestII,
        policy_version: "steward-rulebook-7/v1",
        accountable_human: "Kawaljeet Singh",
        disclosure: "AI-assisted, human-approved before posting",
      }),
      predicates: {
        agent_id: "apex-steward-01",
        model: "llama-3.2-3b-instruct (local)",
        decision: "draft_reply_to_public_issue",
        prompt_digest: promptDigestII,
        policy_version: "steward-rulebook-7/v1",
        accountable_human: "Kawaljeet Singh",
      },
    },
    {
      title: "III ECONOMIC & GOVERNANCE  - seal a settlement",
      content: ledgerPayloadIII,
      predicates: {
        parties: ["ROCKYFILMS888 PTY LTD", "counterparty-demo"],
        amount: 1500,
        currency: "AUD",
        ledger_digest: ledgerDigestIII,
        dispute_state: "none",
        settlement_reference: "RCPT-2026-Q3-001",
      },
    },
    {
      title: "IV  IDENTITY & REALITY     - seal a media witness",
      content: "PRAMAAN witness sample - liveness challenge frame bundle",
      predicates: {
        media_digest: mediaDigestIV,
        media_type: "video/mp4",
        duration_seconds: 41,
        liveness_method: "challenge-response",
        deepfake_scan: "clean",
        witness: "PRAMAAN/v1",
      },
    },
    {
      title: "V   INDUSTRY & SOVEREIGNTY - seal a conformance attestation",
      content: canonicalise({
        standard: "draft-singh-apex-psi-05",
        profile: "age-assurance",
        jurisdiction: "AU",
      }),
      predicates: {
        standard: "draft-singh-apex-psi-05",
        profile: "age-assurance",
        jurisdiction: "AU",
        conformance: "conformant",
        evaluated_by: "apex-psi-verifier/1.0",
      },
    },
  ];

  console.log("====================================================================");
  console.log(" THE FIVE MASTER PRIMITIVES - SEALED LIVE ON THE APEX PSI ENGINE");
  console.log(" RFC 8785 canonical JSON | SHA-256 | Ed25519 | RFC 6962 Merkle");
  console.log("====================================================================");
  console.log(` Signing public key : ${hx(keypair.publicKey)}  (full key printed at end)`);
  console.log("");

  const sealed = [];
  for (const spec of five) {
    const s = await seal(spec.title, spec.content, spec.predicates, keypair);
    const ok = await verify(s.receipt);
    console.log(`[${s.title}]`);
    console.log(`    digest    : ${hx(s.receipt.digest)}   (SHA-256, full 64 hex in the JSON)`);
    console.log(`    receipt   : ${s.receipt.receipt_id}`);
    console.log(`    signature : ${hx(s.receipt.signatures.ed25519)}`);
    console.log(`    VERIFY    : ${ok ? "PASS" : "FAIL"} - Ed25519 signature valid over the canonical form`);
    if (!ok) throw new Error("A freshly sealed receipt failed verification - engine broken");
    sealed.push(s.receipt);
    console.log("");
  }

  /* ---------------- AUDIT: tamper tests must FAIL ---------------- */
  console.log("--------------------------------------------------------------------");
  console.log(" AUDIT - TAMPER TESTS (a receipt that verifies a lie is worthless)");
  console.log("--------------------------------------------------------------------");

  const flip = (s: string, i: number) =>
    s.slice(0, i) + (s[i] === "a" ? "b" : "a") + s.slice(i + 1);

  const tamperedDigest: Receipt = {
    ...sealed[0]!,
    digest: flip(sealed[0]!.digest, 10),
  };
  const tamperedField: Receipt = {
    ...sealed[2]!,
    predicates: { ...sealed[2]!.predicates, amount: 999999 },
  };

  const v1 = await verify(tamperedDigest);
  const v2 = await verify(tamperedField);
  console.log(` Content digest changed by one hex digit  -> VERIFY: ${v1 ? "PASS (BROKEN!)" : "BLOCKED"}`);
  console.log(` predicates.amount 1500 -> 999999        -> VERIFY: ${v2 ? "PASS (BROKEN!)" : "BLOCKED"}`);
  if (v1 || v2) throw new Error("Tampered receipt verified - engine broken");

  /* ---------------- ANCHOR: batch Merkle root ---------------- */
  console.log("");
  console.log("--------------------------------------------------------------------");
  console.log(" ANCHOR - RFC 6962 s2.1 batch root (same math as the live ledger)");
  console.log("--------------------------------------------------------------------");
  const leaves = sealed.map((r, i) =>
    sha256(concat(
      new Uint8Array([0x00]),
      utf8(`${i}|${r.receipt_id}|${r.digest}|${r.timestamp}`),
    )),
  );
  const root = merkleRoot(leaves);
  console.log(` Batch size : ${leaves.length} receipts`);
  console.log(` Merkle root: ${toHex(root)}`);
  console.log(` In production this root is what gets committed to Bitcoin (batched`);
  console.log(` anchoring). No Bitcoin transaction was written here - this is the`);
  console.log(` exact object that would be anchored, computed locally.`);

  console.log("");
  console.log("====================================================================");
  console.log(" VERDICT");
  console.log("====================================================================");
  console.log(" Receipts sealed        : 5   (one per primitive)");
  console.log(" Verifications run      : 7   (5 valid + 2 tampered)");
  console.log(" Correct verdicts       : 7/7");
  console.log(` Full public key        : ${keypair.publicKey}`);
  console.log("====================================================================");
  console.log(" Uncommitted demo. Nothing is pushed or published until you say so.");
}

main().catch((e) => {
  console.error("DEMO FAILED:", e);
  throw e; // non-zero exit via unhandled rejection
});
