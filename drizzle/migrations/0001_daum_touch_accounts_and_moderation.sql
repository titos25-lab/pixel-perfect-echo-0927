ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age smallint;
ALTER TABLE public.professional_profiles ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.professional_profiles ADD COLUMN IF NOT EXISTS featured_until timestamptz;
GRANT DELETE ON public.professional_profiles TO authenticated;
DELETE FROM public.professional_profiles WHERE is_demo = true;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  requested_type text := COALESCE(NEW.raw_user_meta_data->>'account_type','client');
  assigned_role public.app_role;
BEGIN
  INSERT INTO public.profiles(id,full_name,age)
  VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''),NULLIF(NEW.raw_user_meta_data->>'age','')::smallint);
  IF lower(COALESCE(NEW.email,'')) = 'pcatitos@gmail.com' THEN
    assigned_role := 'admin';
  ELSIF requested_type = 'professional' THEN
    assigned_role := 'professional';
  ELSE
    assigned_role := 'client';
  END IF;
  INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,assigned_role) ON CONFLICT DO NOTHING;
  IF assigned_role = 'professional' THEN
    INSERT INTO public.professional_profiles(user_id,display_name)
    VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''))
    ON CONFLICT(user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

INSERT INTO public.user_roles(user_id,role)
SELECT id,'admin'::public.app_role FROM auth.users WHERE lower(email)='pcatitos@gmail.com'
ON CONFLICT(user_id,role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid,_role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
    AND (_role <> 'admin' OR EXISTS(SELECT 1 FROM auth.users WHERE id=_user_id AND lower(email)='pcatitos@gmail.com'))
$$;

DROP POLICY IF EXISTS professional_admin_update ON public.professional_profiles;
CREATE POLICY professional_admin_update ON public.professional_profiles FOR UPDATE TO authenticated
USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS professional_admin_delete ON public.professional_profiles;
CREATE POLICY professional_admin_delete ON public.professional_profiles FOR DELETE TO authenticated
USING(public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS professional_admin_read ON public.professional_profiles;
CREATE POLICY professional_admin_read ON public.professional_profiles FOR SELECT TO authenticated
USING(public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS profiles_admin_read ON public.profiles;
CREATE POLICY profiles_admin_read ON public.profiles FOR SELECT TO authenticated
USING(public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS roles_admin_read ON public.user_roles;
CREATE POLICY roles_admin_read ON public.user_roles FOR SELECT TO authenticated
USING(public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.protect_professional_flags()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND NOT public.has_role(auth.uid(),'admin')
    AND (NEW.is_verified IS DISTINCT FROM OLD.is_verified
      OR NEW.is_demo IS DISTINCT FROM OLD.is_demo
      OR NEW.user_id IS DISTINCT FROM OLD.user_id
      OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
      OR NEW.featured_until IS DISTINCT FROM OLD.featured_until) THEN
    RAISE EXCEPTION 'Campo protegido';
  END IF;
  RETURN NEW;
END $$;
