/**
 * Server-only Bitcoin anchoring via OpenTimestamps calendar servers.
 * The calendar aggregates our digest into a Merkle tree and commits the root
 * to the Bitcoin blockchain. Until that block is mined the proof is "pending";
 * once the calendar can return the completed attestation it is "confirmed".
 */
import { fromHex } from "./apex-psi";

export const CALENDARS = [
  "https://a.pool.opentimestamps.org",
  "https://b.pool.opentimestamps.org",
  "https://finney.calendar.eternitywall.com",
] as const;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export type AnchorSubmission = {
  calendar: string;
  proofBase64: string;
  submittedAt: string;
};

/** Submits a 32-byte SHA-256 digest to an OpenTimestamps calendar. */
export async function submitToCalendar(digestHex: string): Promise<AnchorSubmission> {
  const digest = fromHex(digestHex);
  if (digest.length !== 32) throw new Error("A Bitcoin anchor requires a 32-byte SHA-256 digest.");

  let lastError = "no calendar reachable";
  for (const calendar of CALENDARS) {
    try {
      const response = await fetch(`${calendar}/digest`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/octet-stream" },
        body: digest as unknown as BodyInit,
      });
      if (!response.ok) {
        lastError = `${calendar} responded ${response.status}`;
        continue;
      }
      const proof = new Uint8Array(await response.arrayBuffer());
      if (proof.length === 0) {
        lastError = `${calendar} returned an empty proof`;
        continue;
      }
      return {
        calendar,
        proofBase64: toBase64(proof),
        submittedAt: new Date().toISOString(),
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(`Bitcoin anchoring failed: ${lastError}`);
}

/** Asks the calendar whether the commitment has made it into a Bitcoin block yet. */
export async function checkConfirmation(calendar: string, digestHex: string): Promise<boolean> {
  try {
    const response = await fetch(`${calendar}/timestamp/${digestHex}`, {
      headers: { accept: "application/octet-stream" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export type AnchorResult =
  | { ok: true; status: string; calendar: string; submittedAt: string; confirmed: boolean }
  | { ok: false; reason: string };

/** Anchors a ledger entry and records the proof against it. */
export async function anchorLedgerEntry(receiptId: string): Promise<AnchorResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: entry, error: readError } = await supabaseAdmin
    .from("notarizations")
    .select("receipt_id, content_hash, chain_hash, anchor_status, anchor_calendar, anchor_submitted_at")
    .eq("receipt_id", receiptId)
    .maybeSingle();
  if (readError) return { ok: false, reason: readError.message };
  if (!entry) return { ok: false, reason: "That receipt is not on the public ledger yet." };

  if (entry.anchor_status === "anchored" || entry.anchor_status === "confirmed") {
    return {
      ok: true,
      status: entry.anchor_status,
      calendar: entry.anchor_calendar ?? CALENDARS[0],
      submittedAt: entry.anchor_submitted_at ?? new Date().toISOString(),
      confirmed: entry.anchor_status === "confirmed",
    };
  }

  let submission: AnchorSubmission;
  try {
    submission = await submitToCalendar(entry.chain_hash);
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "Anchoring failed." };
  }

  const confirmed = await checkConfirmation(submission.calendar, entry.chain_hash);
  const status = confirmed ? "confirmed" : "anchored";

  const { error: writeError } = await supabaseAdmin
    .from("notarizations")
    .update({
      anchor_status: status,
      anchor_calendar: submission.calendar,
      ots_proof: submission.proofBase64,
      anchor_submitted_at: submission.submittedAt,
      anchor_confirmed_at: confirmed ? new Date().toISOString() : null,
      bitcoin_anchor: {
        protocol: "OpenTimestamps",
        calendar: submission.calendar,
        commitment: entry.chain_hash,
        submitted_at: submission.submittedAt,
      },
    })
    .eq("receipt_id", receiptId);
  if (writeError) return { ok: false, reason: writeError.message };

  return { ok: true, status, calendar: submission.calendar, submittedAt: submission.submittedAt, confirmed };
}
