CREATE TABLE public.constitution_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version integer NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL,
  digest text NOT NULL UNIQUE,
  summary text NOT NULL DEFAULT '',
  body jsonb,
  receipt_id text,
  anchor_status text NOT NULL DEFAULT 'pending',
  effective_from timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.constitution_versions TO anon;
GRANT SELECT ON public.constitution_versions TO authenticated;
GRANT ALL ON public.constitution_versions TO service_role;
ALTER TABLE public.constitution_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Constitution versions are public" ON public.constitution_versions FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.constitution_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  version_digest text NOT NULL,
  signer_label text NOT NULL,
  signer_did text NOT NULL,
  signature text NOT NULL,
  signer_kind text NOT NULL DEFAULT 'human',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version_digest, signer_did)
);
CREATE INDEX constitution_signatures_digest_idx ON public.constitution_signatures (version_digest, created_at DESC);
GRANT SELECT ON public.constitution_signatures TO anon;
GRANT SELECT, INSERT ON public.constitution_signatures TO authenticated;
GRANT ALL ON public.constitution_signatures TO service_role;
ALTER TABLE public.constitution_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratifications are public" ON public.constitution_signatures FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Citizens sign for themselves" ON public.constitution_signatures FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.amendments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  title text NOT NULL,
  article_numeral text NOT NULL,
  rationale text NOT NULL,
  proposed_text text NOT NULL,
  status text NOT NULL DEFAULT 'deliberating',
  digest text NOT NULL,
  threshold text NOT NULL DEFAULT 'two-thirds',
  opens_at timestamptz NOT NULL DEFAULT now(),
  closes_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX amendments_created_idx ON public.amendments (created_at DESC);
GRANT SELECT ON public.amendments TO anon;
GRANT SELECT, INSERT ON public.amendments TO authenticated;
GRANT ALL ON public.amendments TO service_role;
ALTER TABLE public.amendments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Amendments are public" ON public.amendments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Citizens propose amendments" ON public.amendments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.amendment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_id uuid NOT NULL REFERENCES public.amendments ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  voter_label text NOT NULL DEFAULT 'Citizen',
  choice text NOT NULL CHECK (choice IN ('ratify', 'reject', 'abstain')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (amendment_id, user_id)
);
GRANT SELECT ON public.amendment_votes TO anon;
GRANT SELECT, INSERT ON public.amendment_votes TO authenticated;
GRANT ALL ON public.amendment_votes TO service_role;
ALTER TABLE public.amendment_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are public" ON public.amendment_votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Citizens vote for themselves" ON public.amendment_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

INSERT INTO public.constitution_versions (version, name, tagline, digest, summary, anchor_status, effective_from)
VALUES (
  1,
  'The Constitution of the AI Era',
  'A constitution is only written once — but it can be updated forever.',
  '73d69403cae68dd5b5a2091ef38cd7347b257dcb37dca3ee328fd3e4931a2ff1',
  'Founding text. Five unification articles: PSI-Resource, PSI-Anti-Scarcity, PSI-Distribution, PSI-Abundance and PSI-Anti-Archon.',
  'sealed',
  '2026-08-06T00:00:00Z'
);