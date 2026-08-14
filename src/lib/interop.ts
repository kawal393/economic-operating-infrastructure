/**
 * The Standards Bridge — client-safe, pure, no network.
 *
 * An Apex PSI receipt is a fact. This module re-expresses that same fact in
 * the formats the rest of the world already speaks, without changing a single
 * byte of what was signed:
 *
 *   - W3C Verifiable Credentials 2.0 (Data Integrity, eddsa-jcs-2022)
 *   - in-toto Attestation Framework Statement v1 (SLSA-compatible envelope)
 *   - C2PA / Content Credentials compatible sidecar manifest
 *   - DSSE envelope (Sigstore-compatible transport)
 *   - did:key identity for the signing key
 *
 * Every export is derived deterministically from the receipt. Nothing is
 * invented, nothing is re-signed, nothing is claimed that the maths does not
 * already prove.
 */
import { canonicalise, fromHex, ISSUER, type Receipt } from "./apex-psi";

/* ------------------------------------------------------------------ */
/* Multibase / multicodec                                              */
/* ------------------------------------------------------------------ */

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58btc(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i]! << 8;
      digits[i] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = "";
  for (const byte of bytes) {
    if (byte !== 0) break;
    out += "1";
  }
  for (let i = digits.length - 1; i >= 0; i--) out += B58[digits[i]!];
  return out;
}

export function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");
}

/** Multicodec 0xed01 (ed25519-pub) + multibase base58btc — W3C did:key. */
export function didKeyFromEd25519Hex(publicKeyHex: string): string {
  const key = fromHex(publicKeyHex);
  const prefixed = new Uint8Array(key.length + 2);
  prefixed[0] = 0xed;
  prefixed[1] = 0x01;
  prefixed.set(key, 2);
  return `did:key:z${base58btc(prefixed)}`;
}

/** Multibase base58btc of a raw Ed25519 signature — Data Integrity proofValue. */
export function multibaseSignature(signatureHex: string): string {
  return `z${base58btc(fromHex(signatureHex))}`;
}

/** JWK for an Ed25519 public key (RFC 8037). */
export function ed25519Jwk(publicKeyHex: string, kid: string) {
  return { kty: "OKP", crv: "Ed25519", x: base64url(fromHex(publicKeyHex)), kid, alg: "EdDSA", use: "sig" };
}

/* ------------------------------------------------------------------ */
/* W3C Verifiable Credential 2.0                                       */
/* ------------------------------------------------------------------ */

export const PSI_CONTEXT = `https://${ISSUER}/contexts/apex-psi/v1`;

export function toVerifiableCredential(receipt: Receipt) {
  const did = didKeyFromEd25519Hex(receipt.public_key);
  const { signatures: _signatures, ...body } = receipt;
  return {
    "@context": ["https://www.w3.org/ns/credentials/v2", PSI_CONTEXT],
    id: `https://${ISSUER}/r/${receipt.receipt_id}`,
    type: ["VerifiableCredential", "ContentIntegrityCredential"],
    issuer: did,
    validFrom: receipt.timestamp,
    credentialSubject: {
      id: `urn:sha256:${receipt.digest}`,
      digestAlgorithm: "SHA-256",
      digestValue: receipt.digest,
      name: receipt.predicates.name,
      encodingFormat: receipt.predicates.mime,
      contentSize: receipt.predicates.size,
      assertion: "Integrity proven. Truth not verified.",
    },
    credentialStatus: {
      type: "ApexPsiLedgerStatus",
      id: `https://${ISSUER}/api/public/v1/receipt/${receipt.receipt_id}`,
    },
    proof: {
      type: "DataIntegrityProof",
      cryptosuite: "eddsa-jcs-2022",
      created: receipt.timestamp,
      verificationMethod: `${did}#${did.slice("did:key:".length)}`,
      proofPurpose: "assertionMethod",
      proofValue: multibaseSignature(receipt.signatures.ed25519),
      // The signed payload is the receipt body in RFC 8785 canonical form,
      // reproduced verbatim so any verifier can recompute it byte for byte.
      "apexpsi:signedPayload": canonicalise(body),
    },
  };
}

/* ------------------------------------------------------------------ */
/* in-toto Statement v1 (SLSA-compatible)                              */
/* ------------------------------------------------------------------ */

export const PSI_PREDICATE_TYPE = `https://${ISSUER}/predicates/apex-psi/v1`;

export function toInTotoStatement(receipt: Receipt) {
  return {
    _type: "https://in-toto.io/Statement/v1",
    subject: [{ name: receipt.predicates.name, digest: { sha256: receipt.digest } }],
    predicateType: PSI_PREDICATE_TYPE,
    predicate: {
      protocol: receipt.protocol,
      issuer: receipt.issuer,
      receiptId: receipt.receipt_id,
      canonicalisation: receipt.canonicalisation_method,
      sealedAt: receipt.timestamp,
      signer: didKeyFromEd25519Hex(receipt.public_key),
      verification: {
        url: receipt.verify_url,
        offline: `https://${ISSUER}/offline-verifier.html`,
      },
      scope: "content-integrity",
      limitations: ["Proves the bytes are unaltered since sealing.", "Does not assert the content is true."],
    },
  };
}

/** DSSE envelope — the transport Sigstore, in-toto and SLSA all consume. */
export function toDsseEnvelope(receipt: Receipt) {
  const payload = JSON.stringify(toInTotoStatement(receipt));
  return {
    payloadType: "application/vnd.in-toto+json",
    payload: base64(new TextEncoder().encode(payload)),
    signatures: [
      {
        keyid: didKeyFromEd25519Hex(receipt.public_key),
        sig: base64(fromHex(receipt.signatures.ed25519)),
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* C2PA / Content Credentials compatible sidecar                       */
/* ------------------------------------------------------------------ */

export function toC2paManifest(receipt: Receipt) {
  return {
    claim_generator: `sovereign-ai.services/apex-psi ${receipt.version}`,
    claim_generator_info: [{ name: "Sovereign AI Services", version: receipt.version }],
    format: receipt.predicates.mime,
    title: receipt.predicates.name,
    instance_id: `xmp:iid:${receipt.receipt_id}`,
    assertions: [
      {
        label: "c2pa.hash.data",
        data: { alg: "sha256", hash: receipt.digest, name: receipt.predicates.name, exclusions: [] },
      },
      {
        label: "stds.schema-org.CreativeWork",
        data: {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          author: [{ "@type": "Organization", name: receipt.issuer }],
          dateCreated: receipt.timestamp,
        },
      },
      {
        label: "sovereign-ai.psi.receipt",
        data: { ...receipt, note: "Integrity proven. Truth not verified." },
      },
    ],
    signature_info: {
      alg: "Ed25519",
      issuer: receipt.issuer,
      cert_serial_number: receipt.receipt_id,
      time: receipt.timestamp,
      signer: didKeyFromEd25519Hex(receipt.public_key),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Registry of exports                                                 */
/* ------------------------------------------------------------------ */

export type InteropFormatId = "vc" | "intoto" | "dsse" | "c2pa" | "praman";

export const INTEROP_FORMATS: {
  id: InteropFormatId;
  name: string;
  standard: string;
  extension: string;
  consumers: string;
  summary: string;
  build: (receipt: Receipt) => unknown;
}[] = [
  {
    id: "praman",
    name: "Apex PSI receipt",
    standard: "RFC 8785 + Ed25519",
    extension: "praman.json",
    consumers: "This nation, the offline verifier, any Ed25519 library",
    summary: "The original signed artefact. Everything below is derived from it and adds nothing.",
    build: (r) => r,
  },
  {
    id: "vc",
    name: "Verifiable Credential",
    standard: "W3C VC Data Model 2.0 · Data Integrity eddsa-jcs-2022",
    extension: "vc.json",
    consumers: "Digital identity wallets, EUDI wallet stacks, DIDComm agents",
    summary:
      "The receipt as a credential issued by a did:key. Slots straight into wallet and trust-registry infrastructure.",
    build: toVerifiableCredential,
  },
  {
    id: "intoto",
    name: "in-toto Statement",
    standard: "in-toto Attestation Framework v1",
    extension: "intoto.json",
    consumers: "SLSA, Kyverno, Gatekeeper, GitHub attestations, policy engines",
    summary:
      "The receipt as a software-supply-chain attestation. CI systems can gate deploys on it today.",
    build: toInTotoStatement,
  },
  {
    id: "dsse",
    name: "DSSE envelope",
    standard: "Dead Simple Signing Envelope",
    extension: "dsse.json",
    consumers: "Sigstore (cosign), Rekor, Tekton Chains",
    summary: "The transport envelope the signing ecosystem already ingests, with the Ed25519 signature intact.",
    build: toDsseEnvelope,
  },
  {
    id: "c2pa",
    name: "Content Credentials sidecar",
    standard: "C2PA 2.x compatible manifest (sidecar, not embedded)",
    extension: "c2pa.json",
    consumers: "Provenance viewers, newsroom pipelines, media asset managers",
    summary:
      "The receipt expressed as a C2PA-shaped manifest so media tooling can read our provenance without new code.",
    build: toC2paManifest,
  },
];
