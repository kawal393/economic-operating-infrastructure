import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { currentCheckpoint, proofFor } from "./transparency.server";

export const getCheckpoint = createServerFn({ method: "GET" }).handler(async () =>
  currentCheckpoint(),
);

export const getInclusionProof = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ receiptId: z.string().min(4).max(128) }).parse(input),
  )
  .handler(async ({ data }) => proofFor(data.receiptId));
