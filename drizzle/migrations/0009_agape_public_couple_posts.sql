-- Allow the authenticated community to read posts from active couple journeys
-- without exposing the private couple_journeys table itself.
CREATE OR REPLACE FUNCTION public.is_active_couple_journey(_journey_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.couple_journeys WHERE id=_journey_id AND status='active')
$$;
REVOKE ALL ON FUNCTION public.is_active_couple_journey(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_couple_journey(uuid) TO authenticated;

DROP POLICY IF EXISTS couple_posts_read_active ON public.couple_posts;
CREATE POLICY couple_posts_read_active ON public.couple_posts FOR SELECT TO authenticated
USING(public.is_active_couple_journey(journey_id));
