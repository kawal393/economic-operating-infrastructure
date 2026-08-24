/**
 * Live reads/writes against the public APEX PSI ledger functions.
 * Public, unauthenticated endpoints only — no secrets in the client.
 */

export const LEDGER_BASE = "https://qhtntebpcribjiwrdtdd.supabase.co/functions/v1";

export type NotarizeResult = {
  receipt_id: string;
  timestamp: string;
  decision_hash: string;
  merkle_leaf: string;
  merkle_root?: string;
  ed25519_signature: string;
  pq_signature?: { algorithm?: string; leaf_index?: number } | null;
};

export type VerifyResult = {
  verified?: boolean;
  found: boolean;
  commit_id?: string | null;
  predicate_id?: string | null;
  status?: string | null;
  phase?: string | null;
  merkle_root?: string | null;
  merkle_verified?: boolean | null;
  ed25519_signature?: string | null;
  signed_payload?: string | null;
  post_quantum?: boolean | null;
  pq_verified?: boolean | null;
  pq_algorithm?: string | null;
  pq_standard?: string | null;
  created_at?: string | null;
  action_summary?: string | null;
  algorithm?: string | null;
  eu_ai_act_compliance?: boolean | null;
  queried_hash?: string | null;
  message?: string | null;
};

export type AnchorRecord = {
  id: string;
  anchor_hash: string;
  bitcoin_txid: string | null;
  block_height: number | null;
  explorer_url: string | null;
  entries_count: number | null;
  chain: string | null;
  status: string | null;
  confirmed_at: string | null;
  created_at: string | null;
};

export type AnchorHistory = {
  anchors: AnchorRecord[];
  confirmed: number;
  pending: number;
  simulation?: boolean;
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`ledger unreachable (${res.status})`);
  return (await res.json()) as T;
}

export async function notarize(input: {
  decision: string;
  predicate: string;
  model_id: string;
}): Promise<NotarizeResult> {
  const res = await fetch(`${LEDGER_BASE}/notarize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return json<NotarizeResult>(res);
}

export async function verifyHash(hash: string): Promise<VerifyResult> {
  const res = await fetch(
    `${LEDGER_BASE}/verify-hash?hash=${encodeURIComponent(hash.trim().replace(/^sha256:/i, ""))}`,
  );
  return json<VerifyResult>(res);
}

export async function anchorHistory(): Promise<AnchorHistory> {
  const res = await fetch(`${LEDGER_BASE}/blockchain-anchor?action=history`);
  return json<AnchorHistory>(res);
}

export function mempoolTx(txid: string) {
  return `https://mempool.space/tx/${txid}`;
}

export function mempoolBlock(height: number) {
  return `https://mempool.space/block-height/${height}`;
}
