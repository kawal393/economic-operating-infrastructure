export const ENTITY_KINDS = ["company", "ai", "human", "institution"] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number];

export const ASSET_KINDS = ["model", "dataset", "document", "endpoint", "media", "website"] as const;
export type AssetKind = (typeof ASSET_KINDS)[number];

export type Entity = {
  id: string;
  kind: string;
  name: string;
  slug: string;
  domain: string | null;
  description: string | null;
  is_claimed: boolean;
  domain_verified_at: string | null;
  receipt_id: string | null;
  content_hash: string | null;
  seal_status: string;
  created_at: string;
};

export type EntityAsset = {
  id: string;
  entity_id: string;
  label: string;
  asset_kind: string;
  url: string | null;
  content_hash: string | null;
  receipt_id: string | null;
  seal_status: string;
  created_at: string;
};

export type EntityAttestation = {
  id: string;
  claim: string;
  subject: string | null;
  counter_attestation_id: string | null;
  created_at: string;
};

export type EntityProfile = {
  entity: Entity;
  assets: EntityAsset[];
  attestations: EntityAttestation[];
};
