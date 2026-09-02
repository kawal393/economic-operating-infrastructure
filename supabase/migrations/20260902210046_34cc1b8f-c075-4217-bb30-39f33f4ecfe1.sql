-- The domain-claim token must not be readable through the Data API by any client role.
revoke select on public.entities from anon;
revoke select on public.entities from authenticated;

grant select (
  id, owner_id, submitted_by, kind, name, slug, domain, description,
  is_claimed, domain_verified_at, receipt_id, content_hash, seal_status,
  is_active, created_at, updated_at
) on public.entities to anon, authenticated;

grant all on public.entities to service_role;