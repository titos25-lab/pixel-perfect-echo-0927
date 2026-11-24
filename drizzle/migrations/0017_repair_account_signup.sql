CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.profiles(id,full_name,age,location)
 VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''),NULLIF(NEW.raw_user_meta_data->>'age','')::smallint,COALESCE(NEW.raw_user_meta_data->>'location','Maputo')) ON CONFLICT(id) DO NOTHING;
 INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'client') ON CONFLICT DO NOTHING;
 INSERT INTO public.member_profiles(user_id,display_name,age,location,denomination)
 VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''),NULLIF(NEW.raw_user_meta_data->>'age','')::smallint,COALESCE(NEW.raw_user_meta_data->>'location','Maputo'),COALESCE(NEW.raw_user_meta_data->>'denomination','')) ON CONFLICT(user_id) DO NOTHING;
 RETURN NEW;
END $$;
GRANT ALL ON public.member_profiles,public.connection_requests,public.messages,public.posts,public.post_likes,public.reports,public.couple_journeys,public.user_blocks,public.post_comments,public.couple_posts,public.member_media TO service_role;
DO $$
DECLARE c record;
BEGIN
 FOR c IN SELECT con.conname,con.conrelid::regclass AS tab,att.attname AS col FROM pg_constraint con JOIN pg_attribute att ON att.attrelid=con.conrelid AND att.attnum=con.conkey[1] WHERE con.contype='f' AND con.confrelid='auth.users'::regclass AND con.conrelid IN ('public.member_profiles'::regclass,'public.connection_requests'::regclass,'public.messages'::regclass,'public.posts'::regclass,'public.post_likes'::regclass,'public.reports'::regclass,'public.couple_journeys'::regclass,'public.user_blocks'::regclass,'public.post_comments'::regclass,'public.couple_posts'::regclass,'public.member_media'::regclass)
 LOOP
 EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I',c.tab,c.conname);
 EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.profiles(id) ON DELETE CASCADE',c.tab,c.conname,c.col);
 END LOOP;
END $$;