import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isAdmin, readThreatSummary, writeFlag } from "./security.server";

/** Public defence dashboard — aggregates only, never payloads. */
export const getThreatSummary = createServerFn({ method: "GET" }).handler(async () =>
  readThreatSummary(false),
);

/** Full threat log, admins only. */
export const getThreatLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context.supabase, context.userId))) {
      throw new Error("Only the Ministry of Defence may read the raw threat log.");
    }
    return readThreatSummary(true);
  });

/** Kill switch and posture control, admins only. */
export const setDefencePosture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        posture: z.enum(["NORMAL", "ELEVATED", "LOCKDOWN"]).nullable().default(null),
        agentEnabled: z.boolean().nullable().default(null),
        agentWriteEnabled: z.boolean().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context.supabase, context.userId))) {
      throw new Error("Only the Ministry of Defence may alter the posture.");
    }
    if (data.posture) await writeFlag("defence_posture", { level: data.posture }, context.userId);
    if (data.agentEnabled !== null)
      await writeFlag("agent_enabled", { on: data.agentEnabled }, context.userId);
    if (data.agentWriteEnabled !== null)
      await writeFlag("agent_write_enabled", { on: data.agentWriteEnabled }, context.userId);
    return readThreatSummary(true);
  });
