-- AGAPE: Christian dating and social community
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age smallint;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT 'Maputo';

CREATE TABLE IF NOT EXISTS public.member_profiles (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '', gender text NOT NULL DEFAULT '', occupation text NOT NULL DEFAULT '',
 denomination text NOT NULL DEFAULT '', church_name text NOT NULL DEFAULT '', ministry_area text NOT NULL DEFAULT '',
 location text NOT NULL DEFAULT 'Maputo', bio text NOT NULL DEFAULT '',
 relationship_goal text NOT NULL DEFAULT 'Relacionamento sério', photo_path text,
 is_active boolean NOT NULL DEFAULT true, is_verified boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON public.member_profiles TO authenticated;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY member_profiles_read_active ON public.member_profiles FOR SELECT TO authenticated USING (is_active OR user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY member_profiles_insert_own ON public.member_profiles FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND NOT is_verified);
CREATE POLICY member_profiles_update_own ON public.member_profiles FOR UPDATE TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.connection_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, initial_message text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(sender_id<>receiver_id), UNIQUE(sender_id,receiver_id)
);
GRANT SELECT,INSERT,UPDATE ON public.connection_requests TO authenticated;
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY connection_requests_read ON public.connection_requests FOR SELECT TO authenticated USING(sender_id=auth.uid() OR receiver_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY connection_requests_insert ON public.connection_requests FOR INSERT TO authenticated WITH CHECK(sender_id=auth.uid() AND status='pending');
CREATE POLICY connection_requests_update ON public.connection_requests FOR UPDATE TO authenticated USING(receiver_id=auth.uid() OR (sender_id=auth.uid() AND status='pending')) WITH CHECK(receiver_id=auth.uid() OR (sender_id=auth.uid() AND status='cancelled'));

CREATE TABLE IF NOT EXISTS public.messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL REFERENCES public.connection_requests(id) ON DELETE CASCADE,
 sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 4000),
 created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz
);
GRANT SELECT,INSERT,UPDATE ON public.messages TO authenticated;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_read ON public.messages FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.connection_requests c WHERE c.id=request_id AND c.status='accepted' AND (c.sender_id=auth.uid() OR c.receiver_id=auth.uid())));
CREATE POLICY messages_insert ON public.messages FOR INSERT TO authenticated WITH CHECK(sender_id=auth.uid() AND EXISTS(SELECT 1 FROM public.connection_requests c WHERE c.id=request_id AND c.status='accepted' AND (c.sender_id=auth.uid() OR c.receiver_id=auth.uid())));

CREATE TABLE IF NOT EXISTS public.posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 3000), image_url text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.posts TO authenticated;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_read ON public.posts FOR SELECT TO authenticated USING(true);
CREATE POLICY posts_insert ON public.posts FOR INSERT TO authenticated WITH CHECK(author_id=auth.uid());
CREATE POLICY posts_update ON public.posts FOR UPDATE TO authenticated USING(author_id=auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK(author_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY posts_delete ON public.posts FOR DELETE TO authenticated USING(author_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.post_likes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(post_id,user_id)
);
GRANT SELECT,INSERT,DELETE ON public.post_likes TO authenticated;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY post_likes_read ON public.post_likes FOR SELECT TO authenticated USING(true);
CREATE POLICY post_likes_insert ON public.post_likes FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid());
CREATE POLICY post_likes_delete ON public.post_likes FOR DELETE TO authenticated USING(user_id=auth.uid());

CREATE TABLE IF NOT EXISTS public.reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 reported_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, category text NOT NULL, details text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewing','resolved','dismissed')),
 reviewed_by uuid REFERENCES auth.users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(reporter_id<>reported_user_id)
);
GRANT SELECT,INSERT,UPDATE ON public.reports TO authenticated;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_read ON public.reports FOR SELECT TO authenticated USING(reporter_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY reports_insert ON public.reports FOR INSERT TO authenticated WITH CHECK(reporter_id=auth.uid());
CREATE POLICY reports_admin_update ON public.reports FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.couple_journeys (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), initiated_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','ended')),
 started_at date, created_at timestamptz NOT NULL DEFAULT now(), CHECK(initiated_by<>partner_id), UNIQUE(initiated_by,partner_id)
);
GRANT SELECT,INSERT,UPDATE ON public.couple_journeys TO authenticated;
ALTER TABLE public.couple_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY couple_journeys_read ON public.couple_journeys FOR SELECT TO authenticated USING(initiated_by=auth.uid() OR partner_id=auth.uid());
CREATE POLICY couple_journeys_insert ON public.couple_journeys FOR INSERT TO authenticated WITH CHECK(initiated_by=auth.uid() AND status='pending');
CREATE POLICY couple_journeys_update ON public.couple_journeys FOR UPDATE TO authenticated USING(partner_id=auth.uid() OR initiated_by=auth.uid()) WITH CHECK((partner_id=auth.uid() AND status IN ('active','ended')) OR (initiated_by=auth.uid() AND status='ended'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE assigned_role public.app_role;
BEGIN
 INSERT INTO public.profiles(id,full_name,age,location)
 VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''),NULLIF(NEW.raw_user_meta_data->>'age','')::smallint,COALESCE(NEW.raw_user_meta_data->>'location','Maputo'))
 ON CONFLICT(id) DO NOTHING;
 IF lower(COALESCE(NEW.email,''))='pcatitos@gmail.com' THEN assigned_role:='admin'; ELSE assigned_role:='client'; END IF;
 INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,assigned_role) ON CONFLICT DO NOTHING;
 INSERT INTO public.member_profiles(user_id,display_name,location,denomination)
 VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''),COALESCE(NEW.raw_user_meta_data->>'location','Maputo'),COALESCE(NEW.raw_user_meta_data->>'denomination',''))
 ON CONFLICT(user_id) DO NOTHING;
 RETURN NEW;
END $$;
INSERT INTO public.member_profiles(user_id,display_name,location)
 SELECT id,full_name,location FROM public.profiles ON CONFLICT(user_id) DO NOTHING;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 VALUES('agape-member-photos','agape-member-photos',true,5242880,ARRAY['image/jpeg','image/png','image/webp']) ON CONFLICT(id) DO NOTHING;
CREATE POLICY agape_photos_public_read ON storage.objects FOR SELECT TO anon,authenticated USING(bucket_id='agape-member-photos');
CREATE POLICY agape_photos_owner_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='agape-member-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY agape_photos_owner_update ON storage.objects FOR UPDATE TO authenticated USING(bucket_id='agape-member-photos' AND (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK(bucket_id='agape-member-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY agape_photos_owner_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='agape-member-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
