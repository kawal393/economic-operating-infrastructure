/**
 * Seals a stored pilot request onto the public ledger.
 *
 * The platform key signs an Apex PSI receipt over the salted digest only, the
 * receipt is appended to the public chain (re-verified server-side), and an
 * OpenTimestamps Bitcoin anchor is requested. Sealing is best-effort: if any
 * step fails the request is still stored privately and the caller is told so.
 */
import { buildReceipt, type Receipt } from "./apex-psi";
import { nationKey } from "./nation-key.server";
import { publishToLedger } from "./ledger.server";
import { anchorLedgerEntry } from "./anchor.server";
import { buildPilotOpening, randomSalt, type PilotOpeningInput } from "./pilot-seal";

export type PilotSeal = {
  receiptId: string;
  digest: string;
  sequence: number;
  anchor: "anchored" | "confirmed" | "pending";
  receipt: Receipt;
  /** The private opening document — handed only to the submitter. */
  opening: string;
};

const ANCHOR_TIMEOUT_MS = 8000;

export async function sealPilotRequest(
  input: PilotOpeningInput,
): Promise<{ seal: PilotSeal; salt: string; sealedAt: string } | null> {
  try {
    const salt = randomSalt();
    const submittedAt = new Date().toISOString();
    const { canonical, digest } = buildPilotOpening(input, salt, submittedAt);

    const key = await nationKey();
    const receipt = await buildReceipt({
      digest,
      predicates: {
        source: "text",
        name: "pilot-request",
        size: new TextEncoder().encode(canonical).length,
        mime: "application/json",
      },
      keypair: { secretKey: key.secretKey, publicKey: key.publicKeyHex },
    });

    const published = await publishToLedger(JSON.stringify(receipt));
    if (!published.ok) {
      console.error("[pilot-seal] ledger publish failed", published.reason);
      return null;
    }

    let anchor: PilotSeal["anchor"] = "pending";
    try {
      const result = await Promise.race([
        anchorLedgerEntry(receipt.receipt_id),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ANCHOR_TIMEOUT_MS)),
      ]);
      if (result && result.ok) anchor = result.confirmed ? "confirmed" : "anchored";
    } catch (error) {
      console.error("[pilot-seal] anchor failed", error instanceof Error ? error.message : error);
    }

    return {
      salt,
      sealedAt: receipt.timestamp,
      seal: {
        receiptId: receipt.receipt_id,
        digest,
        sequence: published.entry.sequence,
        anchor,
        receipt,
        opening: canonical,
      },
    };
  } catch (error) {
    console.error("[pilot-seal] sealing failed", error instanceof Error ? error.message : error);
    return null;
  }
}
