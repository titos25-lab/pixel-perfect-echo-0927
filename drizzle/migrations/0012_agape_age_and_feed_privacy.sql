-- Enforce adult age at database level and hide posts from blocked members
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_age_adult;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_age_adult CHECK(age IS NULL OR age BETWEEN 18 AND 100);

DROP POLICY IF EXISTS posts_read ON public.posts;
CREATE POLICY posts_read ON public.posts FOR SELECT TO authenticated
USING(NOT public.is_blocked_pair(auth.uid(),author_id));

DROP POLICY IF EXISTS post_comments_read ON public.post_comments;
CREATE POLICY post_comments_read ON public.post_comments FOR SELECT TO authenticated
USING(EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id));
