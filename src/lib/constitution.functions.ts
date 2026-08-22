import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  castAmendmentVote,
  proposeAmendment,
  ratify,
  readAmendments,
  readConstitutionState,
  runConformance,
} from "./constitution.server";

export const getConstitutionState = createServerFn({ method: "GET" }).handler(async () =>
  readConstitutionState(),
);

export const getConformance = createServerFn({ method: "GET" }).handler(async () =>
  runConformance(),
);

export const getAmendments = createServerFn({ method: "GET" }).handler(async () => readAmendments());

export const ratifyConstitution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        versionDigest: z.string().trim().length(64),
        signerLabel: z.string().trim().min(2).max(80),
        signerDid: z.string().trim().min(8).max(200),
        signature: z.string().trim().min(16).max(400),
        signerKind: z.enum(["human", "ai", "organisation"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => ratify(context.supabase, context.userId, data));

export const submitAmendment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(6).max(140),
        articleNumeral: z.enum(["I", "II", "III", "IV", "V"]),
        rationale: z.string().trim().min(20).max(4000),
        proposedText: z.string().trim().min(20).max(12000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => proposeAmendment(context.supabase, context.userId, data));

export const voteOnAmendment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        amendmentId: z.string().uuid(),
        choice: z.enum(["ratify", "reject", "abstain"]),
        voterLabel: z.string().trim().min(2).max(80).default("Citizen"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => castAmendmentVote(context.supabase, context.userId, data));
