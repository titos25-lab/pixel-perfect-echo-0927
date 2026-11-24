-- Respect blocks in discovery and conversations
CREATE OR REPLACE FUNCTION public.is_blocked_pair(_first uuid,_second uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.user_blocks WHERE (blocker_id=_first AND blocked_id=_second) OR (blocker_id=_second AND blocked_id=_first))
$$;
REVOKE ALL ON FUNCTION public.is_blocked_pair(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_blocked_pair(uuid,uuid) TO authenticated;

DROP POLICY IF EXISTS member_profiles_read_active ON public.member_profiles;
CREATE POLICY member_profiles_read_active ON public.member_profiles FOR SELECT TO authenticated
USING (
 user_id=auth.uid()
 OR public.has_role(auth.uid(),'admin')
 OR (is_active AND NOT public.is_blocked_pair(auth.uid(),user_id))
);

DROP POLICY IF EXISTS connection_requests_insert ON public.connection_requests;
CREATE POLICY connection_requests_insert ON public.connection_requests FOR INSERT TO authenticated
WITH CHECK(sender_id=auth.uid() AND status='pending' AND NOT public.is_blocked_pair(sender_id,receiver_id));

DROP POLICY IF EXISTS messages_read ON public.messages;
CREATE POLICY messages_read ON public.messages FOR SELECT TO authenticated USING(
 EXISTS(SELECT 1 FROM public.connection_requests c WHERE c.id=request_id AND c.status='accepted'
 AND (c.sender_id=auth.uid() OR c.receiver_id=auth.uid())
 AND NOT public.is_blocked_pair(c.sender_id,c.receiver_id))
);
DROP POLICY IF EXISTS messages_insert ON public.messages;
CREATE POLICY messages_insert ON public.messages FOR INSERT TO authenticated WITH CHECK(
 sender_id=auth.uid() AND EXISTS(SELECT 1 FROM public.connection_requests c WHERE c.id=request_id AND c.status='accepted'
 AND (c.sender_id=auth.uid() OR c.receiver_id=auth.uid())
 AND NOT public.is_blocked_pair(c.sender_id,c.receiver_id))
);
