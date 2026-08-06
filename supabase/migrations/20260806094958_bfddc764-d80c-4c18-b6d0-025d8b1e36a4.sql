CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.append_notarization(
  _receipt_id text,
  _content_hash text,
  _signature text,
  _public_key text,
  _receipt jsonb,
  _citizen_id uuid DEFAULT NULL
)
RETURNS public.notarizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _prior text;
  _chain text;
  _row public.notarizations;
BEGIN
  SELECT * INTO _row FROM public.notarizations WHERE receipt_id = _receipt_id;
  IF FOUND THEN
    RETURN _row;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('sovereign_notarization_chain'));

  SELECT chain_hash INTO _prior
  FROM public.notarizations
  ORDER BY sequence DESC
  LIMIT 1;

  _chain := encode(
    digest(coalesce(_prior, 'genesis') || ':' || _content_hash || ':' || _receipt_id, 'sha256'),
    'hex'
  );

  INSERT INTO public.notarizations (
    citizen_id, receipt_id, content_hash, ed25519_signature,
    public_key, prior_hash, chain_hash, receipt_json
  ) VALUES (
    _citizen_id, _receipt_id, _content_hash, _signature,
    _public_key, _prior, _chain, _receipt
  )
  RETURNING * INTO _row;

  INSERT INTO public.transactions (citizen_id, type, amount_usd, status)
  VALUES (_citizen_id, 'notarization', 0.001, 'completed');

  RETURN _row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.append_notarization(text, text, text, text, jsonb, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.append_notarization(text, text, text, text, jsonb, uuid) TO service_role;