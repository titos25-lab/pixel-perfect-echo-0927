-- Harden member registration and keep check-in responses participant-authentic
DROP POLICY IF EXISTS member_profiles_insert_own ON public.member_profiles;
CREATE POLICY member_profiles_insert_own ON public.member_profiles FOR INSERT TO authenticated
WITH CHECK (
 user_id=auth.uid()
 AND NOT is_verified
 AND is_active
 AND age IS NOT DISTINCT FROM (SELECT p.age FROM public.profiles p WHERE p.id=auth.uid())
);

CREATE OR REPLACE FUNCTION public.protect_connection_request_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF current_user IN ('anon','authenticated') AND (
   NEW.sender_id IS DISTINCT FROM OLD.sender_id
   OR NEW.receiver_id IS DISTINCT FROM OLD.receiver_id
   OR NEW.sender_checkin IS DISTINCT FROM OLD.sender_checkin
   OR NEW.receiver_checkin IS DISTINCT FROM OLD.receiver_checkin
   OR NEW.accepted_at IS DISTINCT FROM OLD.accepted_at
 ) THEN
   RAISE EXCEPTION 'Campos de conexão protegidos';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_connection_request_fields ON public.connection_requests;
CREATE TRIGGER protect_connection_request_fields BEFORE UPDATE ON public.connection_requests
FOR EACH ROW EXECUTE FUNCTION public.protect_connection_request_fields();
