/**
 * Server-only helpers for the public notarisation ledger.
 * Never imported by client code — only by ledger.functions.ts handlers.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { parseReceipt, verifyReceiptSignature, type Receipt } from "./apex-psi";

export type LedgerEntry = {
  receipt_id: string;
  content_hash: string;
  chain_hash: string;
  prior_hash: string | null;
  sequence: number;
  anchor_status: string;
  created_at: string;
  public_key: string;
};

export type LedgerStats = {
  entries: number;
  citizens: number;
  nationStates: number;
  feesUsd: number;
  head: string | null;
};

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const LEDGER_COLUMNS =
  "receipt_id, content_hash, chain_hash, prior_hash, sequence, anchor_status, created_at, public_key";

export async function readLedger(limit: number): Promise<LedgerEntry[]> {
  const { data, error } = await publicClient()
    .from("notarizations")
    .select(LEDGER_COLUMNS)
    .order("sequence", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as LedgerEntry[];
}

export async function readEntry(receiptId: string): Promise<LedgerEntry | null> {
  const { data, error } = await publicClient()
    .from("notarizations")
    .select(LEDGER_COLUMNS)
    .eq("receipt_id", receiptId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as LedgerEntry | null) ?? null;
}

export async function findByDigest(digest: string): Promise<LedgerEntry[]> {
  const { data, error } = await publicClient()
    .from("notarizations")
    .select(LEDGER_COLUMNS)
    .eq("content_hash", digest)
    .order("sequence", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as LedgerEntry[];
}

export async function readStats(): Promise<LedgerStats> {
  const db = publicClient();
  const [entries, citizens, nations, head, fees] = await Promise.all([
    db.from("notarizations").select("*", { count: "exact", head: true }),
    db.from("citizens").select("*", { count: "exact", head: true }),
    db.from("nation_states").select("*", { count: "exact", head: true }),
    db.from("notarizations").select("chain_hash").order("sequence", { ascending: false }).limit(1),
    db.from("transactions").select("amount_usd").limit(1000),
  ]);
  const feesUsd = (fees.data ?? []).reduce(
    (sum, row) => sum + Number((row as { amount_usd: number }).amount_usd ?? 0),
    0,
  );
  return {
    entries: entries.count ?? 0,
    citizens: citizens.count ?? 0,
    nationStates: nations.count ?? 0,
    feesUsd,
    head: (head.data?.[0] as { chain_hash: string } | undefined)?.chain_hash ?? null,
  };
}

export type PublishResult =
  | { ok: true; entry: LedgerEntry; alreadyPresent: boolean }
  | { ok: false; reason: string };

/**
 * Publishes a receipt to the append-only chain.
 * The signature is re-verified server-side: the ledger never records a receipt
 * it cannot itself prove is internally consistent.
 */
export async function publishToLedger(rawReceipt: string): Promise<PublishResult> {
  let receipt: Receipt;
  try {
    receipt = parseReceipt(rawReceipt);
  } catch {
    return { ok: false, reason: "That is not a valid Apex PSI receipt." };
  }

  if (!(await verifyReceiptSignature(receipt))) {
    return { ok: false, reason: "Signature does not verify. Nothing was published." };
  }

  const existing = await readEntry(receipt.receipt_id);
  const alreadyPresent = existing !== null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("append_notarization", {
    _receipt_id: receipt.receipt_id,
    _content_hash: receipt.digest,
    _signature: receipt.signatures.ed25519,
    _public_key: receipt.public_key,
    _receipt: receipt as unknown as Record<string, unknown>,
    _citizen_id: undefined,
  });
  if (error) return { ok: false, reason: error.message };

  const row = data as unknown as LedgerEntry;
  return { ok: true, entry: row, alreadyPresent };
}
