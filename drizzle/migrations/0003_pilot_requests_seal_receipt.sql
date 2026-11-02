ALTER TABLE public.pilot_requests ADD COLUMN IF NOT EXISTS receipt_id text;
ALTER TABLE public.pilot_requests ADD COLUMN IF NOT EXISTS seal_salt text;
ALTER TABLE public.pilot_requests ADD COLUMN IF NOT EXISTS sealed_at timestamptz;
COMMENT ON COLUMN public.pilot_requests.receipt_id IS 'Public ledger receipt sealing a salted digest of this request. Only the digest is public.';
COMMENT ON COLUMN public.pilot_requests.seal_salt IS 'Private random salt mixed into the sealed digest so the public hash cannot be guessed from an email address.';