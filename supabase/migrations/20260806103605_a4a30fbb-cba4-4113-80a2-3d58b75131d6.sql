CREATE TABLE public.entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.citizens(id) ON DELETE SET NULL,
  submitted_by uuid REFERENCES public.citizens(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'company',
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  domain text UNIQUE,
  description text,
  is_claimed boolean NOT NULL DEFAULT false,
  verification_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  domain_verified_at timestamptz,
  receipt_id text,
  content_hash text,
  seal_status text NOT NULL DEFAULT 'unsealed',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.entities TO anon;
GRANT SELECT, INSERT, UPDATE ON public.entities TO authenticated;
GRANT ALL ON public.entities TO service_role;

ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY entities_public_read ON public.entities FOR SELECT USING (true);

CREATE POLICY entities_insert_citizen ON public.entities FOR INSERT TO authenticated
WITH CHECK (submitted_by IN (SELECT c.id FROM public.citizens c WHERE c.user_id = auth.uid()));

CREATE POLICY entities_update_owner ON public.entities FOR UPDATE TO authenticated
USING (owner_id IN (SELECT c.id FROM public.citizens c WHERE c.user_id = auth.uid()))
WITH CHECK (owner_id IN (SELECT c.id FROM public.citizens c WHERE c.user_id = auth.uid()));

CREATE TABLE public.entity_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  citizen_id uuid REFERENCES public.citizens(id) ON DELETE SET NULL,
  label text NOT NULL,
  asset_kind text NOT NULL DEFAULT 'document',
  url text,
  content_hash text,
  receipt_id text,
  seal_status text NOT NULL DEFAULT 'unsealed',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.entity_assets TO anon;
GRANT SELECT, INSERT ON public.entity_assets TO authenticated;
GRANT ALL ON public.entity_assets TO service_role;

ALTER TABLE public.entity_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY entity_assets_public_read ON public.entity_assets FOR SELECT USING (true);

CREATE POLICY entity_assets_insert_own ON public.entity_assets FOR INSERT TO authenticated
WITH CHECK (citizen_id IN (SELECT c.id FROM public.citizens c WHERE c.user_id = auth.uid()));

CREATE INDEX entity_assets_entity_idx ON public.entity_assets(entity_id);
CREATE INDEX entities_seal_status_idx ON public.entities(seal_status);

ALTER TABLE public.attestations ADD COLUMN IF NOT EXISTS entity_id uuid REFERENCES public.entities(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER entities_touch_updated_at BEFORE UPDATE ON public.entities
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();