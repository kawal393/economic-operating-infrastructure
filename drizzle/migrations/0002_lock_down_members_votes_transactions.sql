CREATE OR REPLACE FUNCTION public.public_member_count()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT count(*) FROM public.citizens $$;
GRANT EXECUTE ON FUNCTION public.public_member_count() TO anon, authenticated;

DROP POLICY IF EXISTS citizens_public_read ON public.citizens;
CREATE POLICY citizens_read_own ON public.citizens FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS transactions_public_read ON public.transactions;
CREATE POLICY transactions_read_own ON public.transactions FOR SELECT TO authenticated
USING (citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS votes_public_read ON public.votes;
CREATE POLICY votes_read_own ON public.votes FOR SELECT TO authenticated
USING (voter_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid()));