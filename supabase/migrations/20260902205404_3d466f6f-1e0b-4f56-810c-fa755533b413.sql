-- rate_limits is server-only bookkeeping: no client role may read or write it.
revoke all on public.rate_limits from anon, authenticated;
grant all on public.rate_limits to service_role;

drop policy if exists "rate_limits are not client readable" on public.rate_limits;
create policy "rate_limits are not client readable"
  on public.rate_limits
  for all
  to anon, authenticated
  using (false)
  with check (false);