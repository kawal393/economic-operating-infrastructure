import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  deployNationState,
  readMyCitizen,
  readNationState,
  readNationStates,
  upsertCitizen,
} from "./citizen.server";
import { anchorLedgerEntry } from "./anchor.server";

export const getMyCitizen = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => readMyCitizen(context.supabase, context.userId));

export const registerCitizen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        displayName: z.string().trim().min(2).max(80),
        isAi: z.boolean(),
        walletAddress: z.string().trim().max(120).nullable().default(null),
        territory: z.string().trim().max(120).nullable().default(null),
        sufficiencyFloor: z.string().trim().max(400).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => upsertCitizen(context.supabase, context.userId, data));

export const createNationState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(80),
        tagline: z.string().trim().max(160).nullable().default(null),
        territory: z.string().trim().max(120).nullable().default(null),
        constitutionText: z.string().trim().min(20).max(80_000),
        constitutionHash: z.string().regex(/^[0-9a-f]{64}$/),
        receiptId: z.string().trim().max(128).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => deployNationState(context.supabase, context.userId, data));

export const listNationStates = createServerFn({ method: "GET" }).handler(async () =>
  readNationStates(100),
);

export const getNationState = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data }) => readNationState(data.slug));

export const anchorReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ receiptId: z.string().trim().min(4).max(128) }).parse(input),
  )
  .handler(async ({ data }) => anchorLedgerEntry(data.receiptId));
