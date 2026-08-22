/**
 * Server-only registry membership + workspace registry logic.
 * Never imported from client modules — only from *.functions.ts handlers.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { publicClient } from "./ledger.server";

type DB = SupabaseClient<Database>;

import type { Citizen, NationState } from "./nation-types";

export type { Citizen, NationState };

const CITIZEN_COLUMNS =
  "id, display_name, wallet_address, is_ai, territory, sufficiency_floor, nation_state_id, created_at";
const NATION_COLUMNS =
  "id, name, slug, tagline, territory, constitution_hash, constitution_text, receipt_id, citizen_count, created_at";

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "nation"
  );
}

export async function readMyCitizen(db: DB, userId: string): Promise<Citizen | null> {
  const { data, error } = await db
    .from("citizens")
    .select(CITIZEN_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Citizen | null) ?? null;
}

export async function upsertCitizen(
  db: DB,
  userId: string,
  input: {
    displayName: string;
    isAi: boolean;
    walletAddress: string | null;
    territory: string | null;
    sufficiencyFloor: string | null;
  },
): Promise<Citizen> {
  const existing = await readMyCitizen(db, userId);
  const payload = {
    user_id: userId,
    display_name: input.displayName,
    is_ai: input.isAi,
    wallet_address: input.walletAddress,
    territory: input.territory,
    sufficiency_floor: input.sufficiencyFloor,
  };

  const query = existing
    ? db.from("citizens").update(payload).eq("id", existing.id)
    : db.from("citizens").insert(payload);

  const { data, error } = await query.select(CITIZEN_COLUMNS).single();
  if (error) throw new Error(error.message);
  return data as Citizen;
}

export async function readNationStates(limit = 100): Promise<NationState[]> {
  const { data, error } = await publicClient()
    .from("nation_states")
    .select(NATION_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as NationState[];
}

export async function readNationState(slug: string): Promise<NationState | null> {
  const { data, error } = await publicClient()
    .from("nation_states")
    .select(NATION_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as NationState | null) ?? null;
}

export type DeployResult =
  | { ok: true; nationState: NationState }
  | { ok: false; reason: string };

export async function deployNationState(
  db: DB,
  userId: string,
  input: {
    name: string;
    tagline: string | null;
    territory: string | null;
    constitutionText: string;
    constitutionHash: string;
    receiptId: string | null;
  },
): Promise<DeployResult> {
  const citizen = await readMyCitizen(db, userId);
  if (!citizen) {
    return { ok: false, reason: "Join the registry before deploying a workspace." };
  }

  const base = slugify(input.name);
  let slug = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await readNationState(slug);
    if (!clash) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data, error } = await db
    .from("nation_states")
    .insert({
      owner_id: citizen.id,
      name: input.name,
      slug,
      tagline: input.tagline,
      territory: input.territory,
      constitution_text: input.constitutionText,
      constitution_hash: input.constitutionHash,
      receipt_id: input.receiptId,
    })
    .select(NATION_COLUMNS)
    .single();
  if (error) return { ok: false, reason: error.message };

  await db.from("citizens").update({ nation_state_id: (data as NationState).id }).eq("id", citizen.id);

  return { ok: true, nationState: data as NationState };
}
