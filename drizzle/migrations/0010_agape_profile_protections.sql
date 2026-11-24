-- Protect adult-age declaration and administrator-only member moderation flags
CREATE OR REPLACE FUNCTION public.protect_member_profile_flags()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF current_user IN ('anon','authenticated') AND NOT public.has_role(auth.uid(),'admin')
   AND (NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.age IS DISTINCT FROM OLD.age
     OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
   RAISE EXCEPTION 'Campo protegido: idade e estado de moderação não podem ser alterados pelo membro';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_member_profile_flags ON public.member_profiles;
CREATE TRIGGER protect_member_profile_flags BEFORE UPDATE ON public.member_profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_member_profile_flags();

CREATE OR REPLACE FUNCTION public.protect_profile_age()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF current_user IN ('anon','authenticated') AND NOT public.has_role(auth.uid(),'admin')
   AND NEW.age IS DISTINCT FROM OLD.age THEN
   RAISE EXCEPTION 'A idade declarada não pode ser alterada depois do registo';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_profile_age ON public.profiles;
CREATE TRIGGER protect_profile_age BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_age();
