/**
 * Server-only registry logic for entities (companies, AIs, humans, institutions),
 * their assets, and the attestations written about them.
 * Only imported from *.functions.ts handlers.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { publicClient } from "./ledger.server";
import { readMyCitizen, slugify } from "./citizen.server";
import type {
  Entity,
  EntityAsset,
  EntityAttestation,
  EntityProfile,
} from "./entity-types";

type DB = SupabaseClient<Database>;

const ENTITY_COLUMNS =
  "id, kind, name, slug, domain, description, is_claimed, domain_verified_at, receipt_id, content_hash, seal_status, created_at";
const ASSET_COLUMNS =
  "id, entity_id, label, asset_kind, url, content_hash, receipt_id, seal_status, created_at";
const ATTESTATION_COLUMNS = "id, claim, subject, counter_attestation_id, created_at";

export function normaliseDomain(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const withoutScheme = trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return withoutScheme.replace(/^www\./, "") || null;
}

export async function readEntities(input: {
  limit: number;
  sealed?: "sealed" | "unsealed" | "all";
  query?: string | null;
}): Promise<Entity[]> {
  let q = publicClient()
    .from("entities")
    .select(ENTITY_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(input.limit);

  if (input.sealed === "sealed") q = q.eq("seal_status", "sealed");
  if (input.sealed === "unsealed") q = q.eq("seal_status", "unsealed");
  if (input.query) q = q.ilike("name", `%${input.query}%`);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Entity[];
}

export async function readEntityCounts(): Promise<{ total: number; sealed: number }> {
  const db = publicClient();
  const [total, sealed] = await Promise.all([
    db.from("entities").select("*", { count: "exact", head: true }).eq("is_active", true),
    db
      .from("entities")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("seal_status", "sealed"),
  ]);
  return { total: total.count ?? 0, sealed: sealed.count ?? 0 };
}

export async function readEntityProfile(slug: string): Promise<EntityProfile | null> {
  const db = publicClient();
  const { data, error } = await db
    .from("entities")
    .select(ENTITY_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const entity = data as Entity;

  const [assets, attestations] = await Promise.all([
    db
      .from("entity_assets")
      .select(ASSET_COLUMNS)
      .eq("entity_id", entity.id)
      .order("created_at", { ascending: false })
      .limit(200),
    db
      .from("attestations")
      .select(ATTESTATION_COLUMNS)
      .eq("entity_id", entity.id)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  return {
    entity,
    assets: (assets.data ?? []) as EntityAsset[],
    attestations: (attestations.data ?? []) as EntityAttestation[],
  };
}

export type RegisterResult = { ok: true; entity: Entity } | { ok: false; reason: string };

export async function registerEntity(
  db: DB,
  userId: string,
  input: {
    name: string;
    kind: string;
    domain: string | null;
    description: string | null;
    claimAsMine: boolean;
  },
): Promise<RegisterResult> {
  const citizen = await readMyCitizen(db, userId);
  if (!citizen) {
    return { ok: false, reason: "Register as a citizen before adding entries to the registry." };
  }

  const domain = normaliseDomain(input.domain);
  if (domain) {
    const { data: clash } = await publicClient()
      .from("entities")
      .select("slug")
      .eq("domain", domain)
      .maybeSingle();
    if (clash) {
      return {
        ok: false,
        reason: `${domain} is already listed at /entities/${(clash as { slug: string }).slug}.`,
      };
    }
  }

  const base = slugify(input.name);
  let slug = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: taken } = await publicClient()
      .from("entities")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!taken) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data, error } = await db
    .from("entities")
    .insert({
      name: input.name,
      kind: input.kind,
      slug,
      domain,
      description: input.description,
      submitted_by: citizen.id,
      owner_id: input.claimAsMine ? citizen.id : null,
      is_claimed: input.claimAsMine,
    })
    .select(ENTITY_COLUMNS)
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, entity: data as Entity };
}

async function ownedEntity(db: DB, userId: string, entityId: string) {
  const citizen = await readMyCitizen(db, userId);
  if (!citizen) return { citizen: null, entity: null };
  const { data } = await db
    .from("entities")
    .select("id, owner_id, slug, domain")
    .eq("id", entityId)
    .maybeSingle();
  return {
    citizen,
    entity: data as
      | { id: string; owner_id: string | null; slug: string; domain: string | null }
      | null,
  };
}

/**
 * The domain-claim token is never exposed through the Data API: no client role
 * can select that column. It is read here, server-side, with elevated access,
 * and only after ownership of the listing has been established as the user.
 */
async function tokenFor(entityId: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("entities")
    .select("verification_token")
    .eq("id", entityId)
    .maybeSingle();
  return (data as { verification_token: string } | null)?.verification_token ?? null;
}

export async function readVerificationToken(
  db: DB,
  userId: string,
  entityId: string,
): Promise<{ ok: true; token: string; domain: string | null } | { ok: false; reason: string }> {
  const { citizen, entity } = await ownedEntity(db, userId, entityId);
  if (!citizen || !entity) return { ok: false, reason: "Entity not found." };
  if (entity.owner_id && entity.owner_id !== citizen.id) {
    return { ok: false, reason: "This listing is already claimed by another citizen." };
  }
  const token = await tokenFor(entity.id);
  if (!token) return { ok: false, reason: "No claim token exists for this listing." };
  return { ok: true, token, domain: entity.domain };
}


/**
 * Domain claim: control of the website is proved by publishing the token at
 * /.well-known/sovereign-ai.json. Nothing else grants ownership of a listing.
 */
export async function verifyEntityDomain(
  db: DB,
  userId: string,
  entityId: string,
): Promise<{ ok: true; entity: Entity } | { ok: false; reason: string }> {
  const { citizen, entity } = await ownedEntity(db, userId, entityId);
  if (!citizen || !entity) return { ok: false, reason: "Entity not found." };
  if (entity.owner_id && entity.owner_id !== citizen.id) {
    return { ok: false, reason: "This listing is already claimed by another citizen." };
  }
  if (!entity.domain) return { ok: false, reason: "This listing has no domain to verify." };

  let payload: unknown;
  try {
    const res = await fetch(`https://${entity.domain}/.well-known/sovereign-ai.json`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return { ok: false, reason: `Domain returned HTTP ${res.status} for the claim file.` };
    }
    payload = await res.json();
  } catch {
    return { ok: false, reason: "Could not fetch the claim file from that domain." };
  }

  const expected = await tokenFor(entity.id);
  const token = (payload as { token?: unknown } | null)?.token;
  if (!expected || typeof token !== "string" || token.trim() !== expected) {
    return { ok: false, reason: "The claim file does not contain this listing's token." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("entities")
    .update({
      owner_id: citizen.id,
      is_claimed: true,
      domain_verified_at: new Date().toISOString(),
    })
    .eq("id", entity.id)
    .select(ENTITY_COLUMNS)
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, entity: data as Entity };
}

export async function attachEntitySeal(
  db: DB,
  userId: string,
  input: { entityId: string; receiptId: string; contentHash: string },
): Promise<{ ok: true; entity: Entity } | { ok: false; reason: string }> {
  const { citizen, entity } = await ownedEntity(db, userId, input.entityId);
  if (!citizen || !entity) return { ok: false, reason: "Entity not found." };
  if (entity.owner_id !== citizen.id) {
    return { ok: false, reason: "Only the owner of a listing can seal it." };
  }
  const { data, error } = await db
    .from("entities")
    .update({
      receipt_id: input.receiptId,
      content_hash: input.contentHash,
      seal_status: "sealed",
    })
    .eq("id", entity.id)
    .select(ENTITY_COLUMNS)
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, entity: data as Entity };
}

export async function addEntityAsset(
  db: DB,
  userId: string,
  input: {
    entityId: string;
    label: string;
    assetKind: string;
    url: string | null;
    contentHash: string | null;
    receiptId: string | null;
  },
): Promise<{ ok: true; asset: EntityAsset } | { ok: false; reason: string }> {
  const { citizen, entity } = await ownedEntity(db, userId, input.entityId);
  if (!citizen || !entity) return { ok: false, reason: "Entity not found." };
  if (entity.owner_id !== citizen.id) {
    return { ok: false, reason: "Only the owner of a listing can attach assets to it." };
  }
  const { data, error } = await db
    .from("entity_assets")
    .insert({
      entity_id: entity.id,
      citizen_id: citizen.id,
      label: input.label,
      asset_kind: input.assetKind,
      url: input.url,
      content_hash: input.contentHash,
      receipt_id: input.receiptId,
      seal_status: input.receiptId ? "sealed" : "unsealed",
    })
    .select(ASSET_COLUMNS)
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, asset: data as EntityAsset };
}

/**
 * Attestations are permanent. A disputed claim is answered by a
 * counter-attestation that points back at it; nothing is ever removed.
 */
export async function writeAttestation(
  db: DB,
  userId: string,
  input: { entityId: string; claim: string; counterTo: string | null },
): Promise<{ ok: true; attestation: EntityAttestation } | { ok: false; reason: string }> {
  const citizen = await readMyCitizen(db, userId);
  if (!citizen) return { ok: false, reason: "Register as a citizen before attesting." };

  const { data, error } = await db
    .from("attestations")
    .insert({
      entity_id: input.entityId,
      citizen_id: citizen.id,
      claim: input.claim,
      counter_attestation_id: input.counterTo,
    })
    .select(ATTESTATION_COLUMNS)
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, attestation: data as EntityAttestation };
}
