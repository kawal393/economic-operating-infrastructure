REVOKE SELECT (verification_token) ON public.entities FROM anon, authenticated;
REVOKE SELECT ON public.entities FROM anon, authenticated;
GRANT SELECT (id, owner_id, slug, domain) ON public.entities TO anon, authenticated;
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ') INTO cols
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='entities' AND column_name <> 'verification_token';
  EXECUTE format('GRANT SELECT (%s) ON public.entities TO anon, authenticated', cols);
END $$;