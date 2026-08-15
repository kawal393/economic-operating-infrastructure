/**
 * Agent Passports — UCAN-style capability delegation, client-safe and offline.
 *
 * A citizen holds a key. An autonomous agent holds a different key. A passport
 * is a signed statement by the citizen that a named agent may exercise a
 * bounded set of powers, for a bounded time, and nothing else. The nation is
 * not a party to it: the passport verifies against the citizen's public key
 * alone, so it keeps working if we disappear.
 */
import * as ed from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha2.js";
import { canonicalise, toHex, fromHex, ISSUER } from "./apex-psi";
import { base64url, didKeyFromEd25519Hex } from "./interop";

export const PASSPORT_VERSION = "sovereign-passport/1.0";

export type Capability = {
  id: string;
  action: string;
  resource: string;
  label: string;
  detail: string;
  mutating: boolean;
};

/** The complete set of powers a citizen may hand to an agent. */
export const CAPABILITIES: Capability[] = [
  {
    id: "verify",
    action: "psi/verify",
    resource: "ledger:*",
    label: "Verify receipts",
    detail: "Check any digest or receipt against the public ledger. Read-only, always free.",
    mutating: false,
  },
  {
    id: "read-ledger",
    action: "psi/read",
    resource: "ledger:*",
    label: "Read the ledger",
    detail: "Enumerate entries, checkpoints and inclusion proofs.",
    mutating: false,
  },
  {
    id: "seal",
    action: "psi/seal",
    resource: "receipt:*",
    label: "Seal content",
    detail: "Produce receipts over content the agent handles. Creates a permanent record.",
    mutating: true,
  },
  {
    id: "publish",
    action: "psi/publish",
    resource: "ledger:append",
    label: "Publish to the ledger",
    detail: "Append a sealed receipt to the append-only chain. Irreversible.",
    mutating: true,
  },
  {
    id: "anchor",
    action: "psi/anchor",
    resource: "bitcoin:opentimestamps",
    label: "Anchor to Bitcoin",
    detail: "Submit a ledger entry's chain hash to an OpenTimestamps calendar.",
    mutating: true,
  },
  {
    id: "attest",
    action: "psi/attest",
    resource: "entity:*",
    label: "Counter-attest",
    detail: "File attestations about registry entities on the citizen's behalf.",
    mutating: true,
  },
];

export type PassportBody = {
  version: typeof PASSPORT_VERSION;
  issuer: string;
  audience: string;
  authority: string;
  capabilities: { action: string; resource: string }[];
  not_before: string;
  expires_at: string;
  nonce: string;
  constraints: {
    max_invocations: number | null;
    delegable: boolean;
    revocation_hint: string;
  };
};

export type Passport = PassportBody & {
  passport_id: string;
  proof: { type: "Ed25519Signature2020"; created: string; signature: string };
};

export type Keypair = { secretKey: Uint8Array; publicKey: string };

export async function generateAgentKeypair(): Promise<Keypair> {
  const secretKey = ed.utils.randomSecretKey();
  return { secretKey, publicKey: toHex(await ed.getPublicKeyAsync(secretKey)) };
}

function randomNonce(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(12)));
}

export function passportId(body: PassportBody): string {
  return `psp_${toHex(sha256(new TextEncoder().encode(canonicalise(body)))).slice(0, 24)}`;
}

export async function issuePassport(input: {
  issuerSecretKey: Uint8Array;
  issuerPublicKey: string;
  agentPublicKey: string;
  capabilityIds: string[];
  ttlHours: number;
  maxInvocations: number | null;
  delegable: boolean;
}): Promise<Passport> {
  const selected = CAPABILITIES.filter((c) => input.capabilityIds.includes(c.id));
  if (selected.length === 0) throw new Error("A passport must carry at least one capability.");

  const now = new Date();
  const body: PassportBody = {
    version: PASSPORT_VERSION,
    issuer: didKeyFromEd25519Hex(input.issuerPublicKey),
    audience: didKeyFromEd25519Hex(input.agentPublicKey),
    authority: `did:web:${ISSUER}`,
    capabilities: selected.map((c) => ({ action: c.action, resource: c.resource })),
    not_before: now.toISOString(),
    expires_at: new Date(now.getTime() + input.ttlHours * 3_600_000).toISOString(),
    nonce: randomNonce(),
    constraints: {
      max_invocations: input.maxInvocations,
      delegable: input.delegable,
      revocation_hint: `Seal a revocation notice naming this passport id and publish it to ${ISSUER}/ledger.`,
    },
  };

  const signature = toHex(
    await ed.signAsync(new TextEncoder().encode(canonicalise(body)), input.issuerSecretKey),
  );

  return {
    ...body,
    passport_id: passportId(body),
    proof: { type: "Ed25519Signature2020", created: now.toISOString(), signature },
  };
}

export type PassportCheck = {
  valid: boolean;
  signatureValid: boolean;
  withinWindow: boolean;
  idMatches: boolean;
  reason: string;
};

export async function verifyPassport(
  passport: Passport,
  issuerPublicKeyHex: string,
): Promise<PassportCheck> {
  const { passport_id, proof, ...body } = passport;
  let signatureValid = false;
  try {
    signatureValid = await ed.verifyAsync(
      fromHex(proof.signature),
      new TextEncoder().encode(canonicalise(body)),
      fromHex(issuerPublicKeyHex),
    );
  } catch {
    signatureValid = false;
  }
  const now = Date.now();
  const withinWindow =
    now >= Date.parse(body.not_before) - 60_000 && now <= Date.parse(body.expires_at);
  const idMatches = passport_id === passportId(body as PassportBody);
  const valid = signatureValid && withinWindow && idMatches;
  return {
    valid,
    signatureValid,
    withinWindow,
    idMatches,
    reason: !signatureValid
      ? "Signature does not verify against the stated issuer key."
      : !idMatches
        ? "Passport id does not match its own body — the document was edited."
        : !withinWindow
          ? "Outside the validity window."
          : "Passport is valid and its powers are exercisable.",
  };
}

/** Compact bearer form: base64url(body).base64url(signature). Fits an HTTP header. */
export function toBearerToken(passport: Passport): string {
  const enc = new TextEncoder();
  const { passport_id, proof, ...body } = passport;
  void passport_id;
  return `${base64url(enc.encode(canonicalise(body)))}.${base64url(fromHex(proof.signature))}`;
}
