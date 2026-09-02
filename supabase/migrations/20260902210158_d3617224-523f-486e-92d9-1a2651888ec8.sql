-- Defence posture and kill-switch state are operational security, not public data.
drop policy if exists "system_flags_public_read" on public.system_flags;

revoke select on public.system_flags from anon;

drop policy if exists "system_flags admin read" on public.system_flags;
create policy "system_flags admin read"
  on public.system_flags
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

grant all on public.system_flags to service_role;