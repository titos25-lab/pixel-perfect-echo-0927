-- AGAPE: public age and bilateral 14-day connection check-in
ALTER TABLE public.member_profiles ADD COLUMN IF NOT EXISTS age smallint;
ALTER TABLE public.member_profiles ADD CONSTRAINT member_profiles_age_adult CHECK(age IS NULL OR age BETWEEN 18 AND 100);
UPDATE public.member_profiles mp SET age=p.age FROM public.profiles p WHERE p.id=mp.user_id AND mp.age IS NULL;

ALTER TABLE public.connection_requests ADD COLUMN IF NOT EXISTS sender_checkin text CHECK(sender_checkin IS NULL OR sender_checkin IN ('continue','relationship','close'));
ALTER TABLE public.connection_requests ADD COLUMN IF NOT EXISTS receiver_checkin text CHECK(receiver_checkin IS NULL OR receiver_checkin IN ('continue','relationship','close'));
ALTER TABLE public.connection_requests ADD COLUMN IF NOT EXISTS checkin_prompted_at timestamptz;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE assigned_role public.app_role;
BEGIN
 INSERT INTO public.profiles(id,full_name,age,location)
 VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''),NULLIF(NEW.raw_user_meta_data->>'age','')::smallint,COALESCE(NEW.raw_user_meta_data->>'location','Maputo'))
 ON CONFLICT(id) DO NOTHING;
 IF lower(COALESCE(NEW.email,''))='pcatitos@gmail.com' THEN assigned_role:='admin'; ELSE assigned_role:='client'; END IF;
 INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,assigned_role) ON CONFLICT DO NOTHING;
 INSERT INTO public.member_profiles(user_id,display_name,age,location,denomination)
 VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''),NULLIF(NEW.raw_user_meta_data->>'age','')::smallint,COALESCE(NEW.raw_user_meta_data->>'location','Maputo'),COALESCE(NEW.raw_user_meta_data->>'denomination',''))
 ON CONFLICT(user_id) DO NOTHING;
 RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.submit_connection_checkin(_request_id uuid,_response text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE connection_row public.connection_requests%ROWTYPE;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicie sessão'; END IF;
 IF _response NOT IN ('continue','relationship','close') THEN RAISE EXCEPTION 'Resposta inválida'; END IF;
 SELECT * INTO connection_row FROM public.connection_requests WHERE id=_request_id AND status='accepted' FOR UPDATE;
 IF NOT FOUND OR (connection_row.sender_id<>auth.uid() AND connection_row.receiver_id<>auth.uid()) THEN RAISE EXCEPTION 'Conexão não encontrada'; END IF;
 IF connection_row.created_at > now()-interval '14 days' THEN RAISE EXCEPTION 'O check-in fica disponível após 14 dias'; END IF;
 IF connection_row.sender_id=auth.uid() THEN
   UPDATE public.connection_requests SET sender_checkin=_response,checkin_prompted_at=COALESCE(checkin_prompted_at,now()),updated_at=now() WHERE id=_request_id;
 ELSE
   UPDATE public.connection_requests SET receiver_checkin=_response,checkin_prompted_at=COALESCE(checkin_prompted_at,now()),updated_at=now() WHERE id=_request_id;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.submit_connection_checkin(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_connection_checkin(uuid,text) TO authenticated;
