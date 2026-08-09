-- =========================================================
-- SENTINEL: system flags (kill switch + defence posture)
-- =========================================================
CREATE TABLE public.system_flags (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.system_flags TO anon;
GRANT SELECT ON public.system_flags TO authenticated;
GRANT ALL ON public.system_flags TO service_role;
ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flags are publicly readable"
  ON public.system_flags FOR SELECT USING (true);
CREATE POLICY "Only admins change flags"
  ON public.system_flags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.system_flags (key, value, description) VALUES
  ('agent_enabled', '{"on": true}'::jsonb, 'Master kill switch for the Minister agent'),
  ('agent_write_enabled', '{"on": true}'::jsonb, 'Allows the agent to perform state-changing actions'),
  ('defence_posture', '{"level": "ELEVATED"}'::jsonb, 'NORMAL | ELEVATED | LOCKDOWN'),
  ('minister_agent_id', '{"id": null}'::jsonb, 'Provisioned realtime voice agent identifier');

-- =========================================================
-- SENTINEL: security event log
-- =========================================================
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  source text NOT NULL DEFAULT 'edge',
  actor uuid,
  fingerprint text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  blocked boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX security_events_created_idx ON public.security_events (created_at DESC);
CREATE INDEX security_events_kind_idx ON public.security_events (kind);

GRANT SELECT ON public.security_events TO authenticated;
GRANT ALL ON public.security_events TO service_role;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins read the threat log"
  ON public.security_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- MINISTER: agent sessions and audited actions
-- =========================================================
CREATE TABLE public.agent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  channel text NOT NULL DEFAULT 'voice',
  provider_conversation_id text,
  turns integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
CREATE INDEX agent_sessions_user_idx ON public.agent_sessions (user_id, started_at DESC);

GRANT SELECT ON public.agent_sessions TO authenticated;
GRANT ALL ON public.agent_sessions TO service_role;
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Citizens read their own sessions"
  ON public.agent_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.agent_sessions(id) ON DELETE SET NULL,
  user_id uuid,
  tool text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  requires_approval boolean NOT NULL DEFAULT false,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX agent_actions_user_idx ON public.agent_actions (user_id, created_at DESC);

GRANT SELECT ON public.agent_actions TO authenticated;
GRANT ALL ON public.agent_actions TO service_role;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Citizens read their own agent actions"
  ON public.agent_actions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- SENTINEL: atomic rate limiting
-- =========================================================
CREATE TABLE public.rate_limits (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);

GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: reachable only through the security-definer function below.

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  _bucket text,
  _limit integer,
  _window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _win timestamptz := to_timestamp(floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds);
  _hits integer;
BEGIN
  INSERT INTO public.rate_limits (bucket, window_start, hits)
  VALUES (_bucket, _win, 1)
  ON CONFLICT (bucket, window_start)
  DO UPDATE SET hits = public.rate_limits.hits + 1
  RETURNING hits INTO _hits;

  DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';

  RETURN _hits <= _limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;