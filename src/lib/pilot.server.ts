import { consumeRateLimit, inspect, logSecurityEvent, sanitiseText } from "./security.server";

export type PilotRequest = {
  email: string;
  name: string;
  organisation: string | null;
  tier: "team" | "enterprise" | "notify";
  notes: string | null;
};

/**
 * Stores a non-binding pilot request. Writes go through the server client only —
 * the table has no RLS policies, so neither anon nor authenticated users can
 * select, update or delete rows.
 */
export async function createPilotRequest(
  input: PilotRequest,
  fp: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
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

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("pilot_requests").insert({
    email: input.email,
    name: sanitiseText(input.name, 120),
    organisation: input.organisation ? sanitiseText(input.organisation, 160) : null,
    tier: input.tier,
    notes: input.notes ? sanitiseText(input.notes, 2000) : null,
    ip_fingerprint: fp,
  });
  if (error) {
    console.error("[pilot] insert failed", error.message);
    return { ok: false, error: "We could not record your request. Please try again." };
  }
  return { ok: true };
}
