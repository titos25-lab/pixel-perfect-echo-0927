-- Shared couple journey updates, visible in the AGAPE community
CREATE TABLE IF NOT EXISTS public.couple_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 journey_id uuid NOT NULL REFERENCES public.couple_journeys(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 couple_label text NOT NULL DEFAULT 'Nossa Jornada',
 body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 2000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,DELETE ON public.couple_posts TO authenticated;
ALTER TABLE public.couple_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY couple_posts_read_active ON public.couple_posts FOR SELECT TO authenticated
USING(EXISTS(SELECT 1 FROM public.couple_journeys j WHERE j.id=journey_id AND j.status='active'));
CREATE POLICY couple_posts_insert_participant ON public.couple_posts FOR INSERT TO authenticated
WITH CHECK(author_id=auth.uid() AND EXISTS(SELECT 1 FROM public.couple_journeys j WHERE j.id=journey_id AND j.status='active' AND (j.initiated_by=auth.uid() OR j.partner_id=auth.uid())));
CREATE POLICY couple_posts_delete_author ON public.couple_posts FOR DELETE TO authenticated USING(author_id=auth.uid());
DROP POLICY IF EXISTS couple_journeys_insert ON public.couple_journeys;
CREATE POLICY couple_journeys_insert ON public.couple_journeys FOR INSERT TO authenticated
WITH CHECK(initiated_by=auth.uid() AND status='pending' AND EXISTS(
 SELECT 1 FROM public.connection_requests c WHERE c.status='accepted'
 AND ((c.sender_id=initiated_by AND c.receiver_id=partner_id) OR (c.sender_id=partner_id AND c.receiver_id=initiated_by))
));
