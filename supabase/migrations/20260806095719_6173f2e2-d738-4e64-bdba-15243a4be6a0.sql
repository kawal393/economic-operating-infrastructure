ALTER TABLE public.citizens
  ADD COLUMN IF NOT EXISTS territory text,
  ADD COLUMN IF NOT EXISTS sufficiency_floor text;

ALTER TABLE public.nation_states
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS constitution_text text,
  ADD COLUMN IF NOT EXISTS territory text,
  ADD COLUMN IF NOT EXISTS receipt_id text;

ALTER TABLE public.notarizations
  ADD COLUMN IF NOT EXISTS anchor_calendar text,
  ADD COLUMN IF NOT EXISTS ots_proof text,
  ADD COLUMN IF NOT EXISTS anchor_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS anchor_confirmed_at timestamptz;

CREATE INDEX IF NOT EXISTS nation_states_slug_idx ON public.nation_states (slug);
CREATE INDEX IF NOT EXISTS notarizations_anchor_status_idx ON public.notarizations (anchor_status);