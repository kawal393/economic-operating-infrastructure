import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  addEntityAsset,
  attachEntitySeal,
  readEntities,
  readEntityCounts,
  readEntityProfile,
  readVerificationToken,
  registerEntity,
  verifyEntityDomain,
  writeAttestation,
} from "./entities.server";
import { ASSET_KINDS, ENTITY_KINDS } from "./entity-types";

export const listEntities = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        limit: z.number().int().min(1).max(200).default(100),
        sealed: z.enum(["sealed", "unsealed", "all"]).default("all"),
        query: z.string().trim().max(80).nullable().default(null),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) =>
    readEntities({ limit: data.limit, sealed: data.sealed, query: data.query }),
  );

export const getEntityCounts = createServerFn({ method: "GET" }).handler(async () =>
  readEntityCounts(),
);

export const getEntityProfile = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data }) => readEntityProfile(data.slug));

export const addEntity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(120),
        kind: z.enum(ENTITY_KINDS),
        domain: z.string().trim().max(180).nullable().default(null),
        description: z.string().trim().max(1200).nullable().default(null),
        claimAsMine: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => registerEntity(context.supabase, context.userId, data));

export const getVerificationToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ entityId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) =>
    readVerificationToken(context.supabase, context.userId, data.entityId),
  );

export const verifyDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ entityId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) =>
    verifyEntityDomain(context.supabase, context.userId, data.entityId),
  );

export const sealEntity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        entityId: z.string().uuid(),
        receiptId: z.string().trim().min(4).max(128),
        contentHash: z.string().regex(/^[0-9a-f]{64}$/),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => attachEntitySeal(context.supabase, context.userId, data));

export const addAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        entityId: z.string().uuid(),
        label: z.string().trim().min(2).max(160),
        assetKind: z.enum(ASSET_KINDS),
        url: z.string().trim().url().max(400).nullable().default(null),
        contentHash: z
          .string()
          .regex(/^[0-9a-f]{64}$/)
          .nullable()
          .default(null),
        receiptId: z.string().trim().max(128).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => addEntityAsset(context.supabase, context.userId, data));

export const attest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        entityId: z.string().uuid(),
        claim: z.string().trim().min(4).max(1200),
        counterTo: z.string().uuid().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => writeAttestation(context.supabase, context.userId, data));
