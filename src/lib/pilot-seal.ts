/**
 * Pure helpers for sealing a pilot request — no server or browser dependencies.
 *
 * The public ledger receives only the SHA-256 of a salted, RFC 8785-canonical
 * "opening" document. The opening itself (name, email, notes, salt) never
 * leaves private storage except as a file handed to the person who submitted
 * it. Without the salt, nobody can confirm a guessed email against the public
 * hash; deleting the private row and salt makes the public hash unlinkable.
 */
import { sha256 } from "@noble/hashes/sha2.js";
import { canonicalise, toHex } from "./apex-psi";

export const PILOT_OPENING_TYPE = "sovereign-ai.services/pilot-request/v1";

export type PilotOpeningInput = {
  email: string;
  name: string;
  organisation: string | null;
  tier: "team" | "enterprise" | "notify";
  notes: string | null;
};

export type PilotOpening = {
  type: typeof PILOT_OPENING_TYPE;
  issuer: "sovereign-ai.services";
  submitted_at: string;
  salt: string;
  binding: false;
  request: PilotOpeningInput;
};

export function buildPilotOpening(
  input: PilotOpeningInput,
  salt: string,
  submittedAt: string,
): { opening: PilotOpening; canonical: string; digest: string } {
  const opening: PilotOpening = {
    type: PILOT_OPENING_TYPE,
    issuer: "sovereign-ai.services",
    submitted_at: submittedAt,
    salt,
    binding: false,
    request: {
      email: input.email,
      name: input.name,
      organisation: input.organisation,
      tier: input.tier,
      notes: input.notes,
    },
  };
  const canonical = canonicalise(opening);
  return { opening, canonical, digest: digestCanonical(canonical) };
}

export function digestCanonical(canonical: string): string {
  return toHex(sha256(new TextEncoder().encode(canonical)));
}

/** 32 random bytes, hex encoded. */
export function randomSalt(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}
