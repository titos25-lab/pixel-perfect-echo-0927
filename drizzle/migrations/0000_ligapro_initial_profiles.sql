CREATE TYPE public.app_role AS ENUM ('client','professional','admin');
CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', location text NOT NULL DEFAULT 'Maputo', avatar_path text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,role public.app_role NOT NULL DEFAULT 'client',UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_read_own ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE TABLE public.professional_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,display_name text NOT NULL,specialty text NOT NULL DEFAULT '',category text NOT NULL DEFAULT '',bio text NOT NULL DEFAULT '',location text NOT NULL DEFAULT 'Maputo',public_phone text NOT NULL DEFAULT '',photo_key text NOT NULL DEFAULT '',is_published boolean NOT NULL DEFAULT false,is_verified boolean NOT NULL DEFAULT false,is_demo boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.professional_profiles TO anon;
GRANT SELECT,INSERT,UPDATE ON public.professional_profiles TO authenticated;
GRANT ALL ON public.professional_profiles TO service_role;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY professional_public ON public.professional_profiles FOR SELECT TO anon,authenticated USING (is_published);
CREATE POLICY professional_owner_read ON public.professional_profiles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY professional_owner_insert ON public.professional_profiles FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND public.has_role(auth.uid(),'professional') AND NOT is_verified AND NOT is_demo);
CREATE POLICY professional_owner_update ON public.professional_profiles FOR UPDATE TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE FUNCTION public.protect_professional_flags() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN IF current_user IN ('anon','authenticated') AND (NEW.is_verified IS DISTINCT FROM OLD.is_verified OR NEW.is_demo IS DISTINCT FROM OLD.is_demo OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN RAISE EXCEPTION 'Campo protegido'; END IF; RETURN NEW; END $$;
CREATE TRIGGER protect_professional_flags BEFORE UPDATE ON public.professional_profiles FOR EACH ROW EXECUTE FUNCTION public.protect_professional_flags();
CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id,full_name) VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name','')); INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'client'); RETURN NEW; END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE FUNCTION public.choose_account_type(account_type text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicie sessão'; END IF; IF account_type NOT IN ('client','professional') THEN RAISE EXCEPTION 'Tipo inválido'; END IF; IF public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Conta administrativa'; END IF; IF account_type='professional' THEN INSERT INTO public.user_roles(user_id,role) VALUES(auth.uid(),'professional') ON CONFLICT DO NOTHING; INSERT INTO public.professional_profiles(user_id,display_name) SELECT id,full_name FROM public.profiles WHERE id=auth.uid() ON CONFLICT(user_id) DO NOTHING; END IF; END $$;
REVOKE ALL ON FUNCTION public.choose_account_type(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.choose_account_type(text) TO authenticated;
CREATE POLICY photos_read_own ON storage.objects FOR SELECT TO authenticated USING(bucket_id='profile-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY photos_insert_own ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='profile-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY photos_delete_own ON storage.objects FOR DELETE TO authenticated USING(bucket_id='profile-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
INSERT INTO public.professional_profiles(display_name,specialty,category,bio,location,photo_key,is_published,is_demo) VALUES
('Carlos Machava','Fisioterapeuta','Saúde e bem-estar','Acompanhamento profissional para o seu bem-estar. Perfil fictício para demonstração.','Maputo','0',true,true),
('Jéssica Macamo','Fotógrafa','Fotografia e videografia','Retratos, eventos e momentos especiais. Perfil fictício para demonstração.','Matola','1',true,true),
('Helena Mucavele','Advogada','Advocacia e serviços jurídicos','Consultoria jurídica para particulares e empresas. Perfil fictício para demonstração.','Maputo','2',true,true),
('Edson Cossa','Especialista de informática','Tecnologia e informática','Soluções tecnológicas para o seu dia-a-dia. Perfil fictício para demonstração.','Beira','3',true,true);