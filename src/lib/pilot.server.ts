import { consumeRateLimit, inspect, logSecurityEvent, sanitiseText } from "./security.server";
import { sealPilotRequest } from "./pilot-seal.server";
import type { PilotSealResult } from "./pilot-seal";

export type { PilotSealResult };

export type PilotRequest = {
  email: string;
  name: string;
  organisation: string | null;
  tier: "team" | "enterprise" | "notify";
  notes: string | null;
};

export type PilotResult =
  | { ok: true; seal: PilotSealResult | null }
  | { ok: false; error: string };

/**
 * Stores a non-binding pilot request. Writes go through the server client only —
 * the table has no RLS policies, so neither anon nor authenticated users can
 * select, update or delete rows.
 */
export async function createPilotRequest(input: PilotRequest, fp: string): Promise<PilotResult> {
  const allowed = await consumeRateLimit(`pilot-request:${fp}`, 5, 3600);
  if (!allowed) {
    return { ok: false, error: "Too many requests from this connection. Please try again later." };
  }

  const untrusted = [input.name, input.organisation, input.notes].filter(Boolean).join("\n");
  const verdict = inspect(untrusted);
  if (!verdict.safe) {
    await logSecurityEvent({
      kind: "pilot_request_payload",
      severity: verdict.worst,
      source: "pricing",
      fingerprint: fp,
      detail: { patterns: verdict.matches.map((m) => m.id) },
      blocked: true,
    });
    return {
      ok: false,
      error: "Your message could not be accepted. Please remove any code or unusual characters and try again.",
    };
  }

  const clean = {
    email: input.email,
    name: sanitiseText(input.name, 120),
    organisation: input.organisation ? sanitiseText(input.organisation, 160) : null,
    tier: input.tier,
    notes: input.notes ? sanitiseText(input.notes, 2000) : null,
  };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row, error } = await supabaseAdmin
    .from("pilot_requests")
    .insert({ ...clean, ip_fingerprint: fp })
    .select("id")
    .single();
  if (error || !row) {
    console.error("[pilot] insert failed", error?.message);
    return { ok: false, error: "We could not record your request. Please try again." };
  }

  // Seal a salted digest of exactly what was stored. Best-effort: the request
  // is already saved privately even if sealing fails.
  const sealed = await sealPilotRequest(clean);
  if (!sealed) return { ok: true, seal: null };

  const { error: linkError } = await supabaseAdmin
    .from("pilot_requests")
    .update({ receipt_id: sealed.seal.receiptId, seal_salt: sealed.salt, sealed_at: sealed.sealedAt })
    .eq("id", row.id);
  if (linkError) console.error("[pilot] could not link receipt", linkError.message);

  const { receipt, ...rest } = sealed.seal;
  return { ok: true, seal: { ...rest, receipt: JSON.stringify(receipt, null, 2) } };
}
