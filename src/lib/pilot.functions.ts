import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { createPilotRequest } from "./pilot.server";
import { fingerprint } from "./security.server";

const pilotInput = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(2).max(120),
  organisation: z.string().trim().max(160).nullable().default(null),
  tier: z.enum(["team", "enterprise", "notify"]),
  notes: z.string().trim().max(2000).nullable().default(null),
  /** Honeypot: humans never fill this in. A filled field means a bot. */
  website: z.string().max(200).nullable().default(null),
});

async function callerFingerprint(): Promise<string> {
  try {
    const request = getRequest();
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const ua = request.headers.get("user-agent") ?? "";
    return await fingerprint(`${ip}|${ua.slice(0, 120)}`);
  } catch {
    return "anonymous";
  }
}

/** Public, non-binding pilot interest. No account, no payment, nothing chargeable. */
export const submitPilotRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => pilotInput.parse(input))
  .handler(async ({ data }) => {
    // Honeypot hit: silently accept so bots cannot probe the endpoint.
    if (data.website) return { ok: true as const };

    const parsed = pilotInput.parse(data);
    return createPilotRequest(
      {
        email: parsed.email,
        name: parsed.name,
        organisation: parsed.organisation,
        tier: parsed.tier,
        notes: parsed.notes,
      },
      await callerFingerprint(),
    );
  });
