CREATE TABLE public.pilot_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  organisation TEXT,
  tier TEXT NOT NULL,
  notes TEXT,
  ip_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.pilot_requests TO service_role;

ALTER TABLE public.pilot_requests ENABLE ROW LEVEL SECURITY;
-- No policies: only the server (service role) may read or write this table.
-- Anonymous visitors and signed-in users can never select, update or delete rows.
CREATE INDEX idx_pilot_requests_created_at ON public.pilot_requests (created_at DESC);