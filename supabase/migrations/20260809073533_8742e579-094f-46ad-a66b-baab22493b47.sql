UPDATE public.system_flags SET value = '{"level":"NORMAL"}'::jsonb, updated_at = now() WHERE key = 'defence_posture';
INSERT INTO public.system_flags (key, value, description)
VALUES
  ('defence_posture', '{"level":"NORMAL"}'::jsonb, 'Sentinel defence posture: NORMAL, ELEVATED or LOCKDOWN'),
  ('agent_enabled', '{"on":true}'::jsonb, 'Minister of State kill switch'),
  ('agent_write_enabled', '{"on":true}'::jsonb, 'Minister of State write-power switch')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();