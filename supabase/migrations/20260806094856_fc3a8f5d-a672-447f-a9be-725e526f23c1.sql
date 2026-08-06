-- Roles -----------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'prover', 'citizen');

-- Citizens ---------------------------------------------------------------
CREATE TABLE public.citizens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  wallet_address text UNIQUE,
  display_name text,
  is_ai boolean NOT NULL DEFAULT false,
  nation_state_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.citizens TO anon;
GRANT SELECT, INSERT, UPDATE ON public.citizens TO authenticated;
GRANT ALL ON public.citizens TO service_role;
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "citizens_public_read" ON public.citizens FOR SELECT USING (true);
CREATE POLICY "citizens_insert_own" ON public.citizens FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "citizens_update_own" ON public.citizens FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Nation states ----------------------------------------------------------
CREATE TABLE public.nation_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.citizens(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE,
  constitution_hash text NOT NULL,
  citizen_count integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nation_states TO anon;
GRANT SELECT, INSERT, UPDATE ON public.nation_states TO authenticated;
GRANT ALL ON public.nation_states TO service_role;
ALTER TABLE public.nation_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nation_states_public_read" ON public.nation_states FOR SELECT USING (true);
CREATE POLICY "nation_states_insert_own" ON public.nation_states FOR INSERT TO authenticated
  WITH CHECK (owner_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));
CREATE POLICY "nation_states_update_own" ON public.nation_states FOR UPDATE TO authenticated
  USING (owner_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()))
  WITH CHECK (owner_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));

ALTER TABLE public.citizens
  ADD CONSTRAINT citizens_nation_state_fk
  FOREIGN KEY (nation_state_id) REFERENCES public.nation_states(id) ON DELETE SET NULL;

-- Notarizations (append-only chain) --------------------------------------
CREATE TABLE public.notarizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid REFERENCES public.citizens(id) ON DELETE SET NULL,
  receipt_id text UNIQUE NOT NULL,
  content_hash text NOT NULL,
  ed25519_signature text NOT NULL,
  public_key text NOT NULL,
  prior_hash text,
  chain_hash text NOT NULL,
  sequence bigint GENERATED ALWAYS AS IDENTITY,
  receipt_json jsonb,
  merkle_root text,
  bitcoin_anchor jsonb,
  anchor_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notarizations_sequence_idx ON public.notarizations (sequence DESC);
CREATE INDEX notarizations_hash_idx ON public.notarizations (content_hash);
GRANT SELECT ON public.notarizations TO anon;
GRANT SELECT ON public.notarizations TO authenticated;
GRANT ALL ON public.notarizations TO service_role;
ALTER TABLE public.notarizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notarizations_public_read" ON public.notarizations FOR SELECT USING (true);
-- No insert/update/delete policies: the chain is written by server functions only.

-- Attestations and counter-attestations ----------------------------------
CREATE TABLE public.attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notarization_id uuid REFERENCES public.notarizations(id) ON DELETE CASCADE,
  citizen_id uuid REFERENCES public.citizens(id) ON DELETE SET NULL,
  subject text,
  claim text NOT NULL,
  counter_attestation_id uuid REFERENCES public.attestations(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.attestations TO anon;
GRANT SELECT, INSERT ON public.attestations TO authenticated;
GRANT ALL ON public.attestations TO service_role;
ALTER TABLE public.attestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attestations_public_read" ON public.attestations FOR SELECT USING (true);
CREATE POLICY "attestations_insert_own" ON public.attestations FOR INSERT TO authenticated
  WITH CHECK (citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));
-- No update or delete policies: attestations are permanent; rebuttal is the remedy.

-- Governance -------------------------------------------------------------
CREATE TABLE public.governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id uuid REFERENCES public.citizens(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  proposal_type text NOT NULL DEFAULT 'protocol_upgrade',
  votes_for integer NOT NULL DEFAULT 0,
  votes_against integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);
GRANT SELECT ON public.governance_proposals TO anon;
GRANT SELECT ON public.governance_proposals TO authenticated;
GRANT ALL ON public.governance_proposals TO service_role;
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proposals_public_read" ON public.governance_proposals FOR SELECT USING (true);

CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.governance_proposals(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  vote text NOT NULL CHECK (vote IN ('for', 'against')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, voter_id)
);
GRANT SELECT ON public.votes TO anon;
GRANT SELECT, INSERT ON public.votes TO authenticated;
GRANT ALL ON public.votes TO service_role;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_public_read" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_own" ON public.votes FOR INSERT TO authenticated
  WITH CHECK (voter_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));

-- Transactions -----------------------------------------------------------
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid REFERENCES public.citizens(id) ON DELETE SET NULL,
  type text NOT NULL,
  amount_usd numeric(12,6) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transactions TO anon;
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_public_read" ON public.transactions FOR SELECT USING (true);

-- Roles ------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'citizen',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));