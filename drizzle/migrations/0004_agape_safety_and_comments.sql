-- Additional AGAPE safety controls and community comments
CREATE TABLE IF NOT EXISTS public.user_blocks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(blocker_id<>blocked_id), UNIQUE(blocker_id,blocked_id)
);
GRANT SELECT,INSERT,DELETE ON public.user_blocks TO authenticated;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_blocks_read_own ON public.user_blocks FOR SELECT TO authenticated USING(blocker_id=auth.uid());
CREATE POLICY user_blocks_insert_own ON public.user_blocks FOR INSERT TO authenticated WITH CHECK(blocker_id=auth.uid());
CREATE POLICY user_blocks_delete_own ON public.user_blocks FOR DELETE TO authenticated USING(blocker_id=auth.uid());

CREATE TABLE IF NOT EXISTS public.post_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 1500), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,DELETE ON public.post_comments TO authenticated;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY post_comments_read ON public.post_comments FOR SELECT TO authenticated USING(true);
CREATE POLICY post_comments_insert_own ON public.post_comments FOR INSERT TO authenticated WITH CHECK(author_id=auth.uid());
CREATE POLICY post_comments_delete_own_or_admin ON public.post_comments FOR DELETE TO authenticated USING(author_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
