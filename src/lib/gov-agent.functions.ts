import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { executeGovTool, mintVoiceGrant, openTextSession } from "./gov-agent.server";
import { fingerprint, inspect, logSecurityEvent, readFlags, sanitiseText } from "./security.server";

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

/** Public: the Minister's availability, so the console can render honestly. */
export const getMinisterStatus = createServerFn({ method: "GET" }).handler(async () => {
  const flags = await readFlags();
  return {
    online: flags.agentEnabled,
    writesEnabled: flags.agentWriteEnabled,
    posture: flags.posture,
    voiceConfigured: Boolean(process.env["ELEVENLABS_API_KEY"]),
  };
});

/** Authenticated citizens get a realtime voice grant. */
export const grantVoiceSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    mintVoiceGrant({ userId: context.userId, fingerprint: await callerFingerprint() }),
  );

/** Anonymous visitors may hold a read-only voice audience with the Minister. */
export const grantPublicVoiceSession = createServerFn({ method: "POST" }).handler(async () =>
  mintVoiceGrant({ userId: null, fingerprint: await callerFingerprint() }),
);

export const startTextSession = createServerFn({ method: "POST" }).handler(async () => ({
  sessionId: await openTextSession(null),
}));

const toolInput = z.object({
  tool: z.string().trim().min(2).max(64),
  args: z.record(z.string(), z.string().max(2000)).default({}),
  approved: z.boolean().default(false),
  sessionId: z.string().max(64).nullable().default(null),
});

/** Read-only powers, available without an account. */
export const runPublicTool = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => toolInput.parse(input))
  .handler(async ({ data }) =>
    executeGovTool({
      tool: data.tool,
      args: data.args,
      approved: false,
      sessionId: data.sessionId,
      userId: null,
      supabase: null,
      fingerprint: await callerFingerprint(),
    }),
  );

/** Full powers, bound to a signed-in citizen and audited. */
export const runCitizenTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => toolInput.parse(input))
  .handler(async ({ data, context }) =>
    executeGovTool({
      tool: data.tool,
      args: data.args,
      approved: data.approved,
      sessionId: data.sessionId,
      userId: context.userId,
      supabase: context.supabase,
      fingerprint: await callerFingerprint(),
    }),
  );

/** Front door for untrusted transcript text — logs injection attempts as they happen. */
export const reportTranscript = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        text: z.string().max(4000),
        sessionId: z.string().max(64).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const clean = sanitiseText(data.text);
    const verdict = inspect(clean);
    if (!verdict.safe) {
      await logSecurityEvent({
        kind: "prompt_injection",
        severity: verdict.worst,
        source: "transcript",
        fingerprint: await callerFingerprint(),
        detail: { patterns: verdict.matches.map((m) => m.id), session: data.sessionId },
        blocked: true,
      });
    }
    return { safe: verdict.safe, patterns: verdict.matches.map((m) => m.id) };
  });
