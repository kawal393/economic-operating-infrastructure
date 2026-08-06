import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  findByDigest,
  publishToLedger,
  readEntry,
  readLedger,
  readStats,
} from "./ledger.server";

export const getLedger = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(200).default(50) }).parse(input ?? {}),
  )
  .handler(async ({ data }) => readLedger(data.limit));

export const getLedgerStats = createServerFn({ method: "GET" }).handler(async () => readStats());

export const getLedgerEntry = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ receiptId: z.string().min(4).max(128) }).parse(input))
  .handler(async ({ data }) => readEntry(data.receiptId));

export const lookupDigest = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ digest: z.string().regex(/^[0-9a-f]{64}$/) }).parse(input),
  )
  .handler(async ({ data }) => findByDigest(data.digest));

export const publishReceipt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ receipt: z.string().min(2).max(200_000) }).parse(input),
  )
  .handler(async ({ data }) => publishToLedger(data.receipt));
