-- AGAPE member profile gallery: unlimited photos and short videos
CREATE TABLE IF NOT EXISTS public.member_media (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 storage_path text NOT NULL UNIQUE,
 media_type text NOT NULL CHECK (media_type IN ('image','video')),
 mime_type text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS member_media_user_created_idx ON public.member_media(user_id, created_at DESC);
ALTER TABLE public.member_media ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.member_media TO authenticated;
CREATE POLICY member_media_read ON public.member_media FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.member_profiles p WHERE p.user_id=member_media.user_id AND p.is_active));
CREATE POLICY member_media_insert_own ON public.member_media FOR INSERT TO authenticated
 WITH CHECK (user_id=auth.uid());
CREATE POLICY member_media_delete_own ON public.member_media FOR DELETE TO authenticated
 USING (user_id=auth.uid());

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('agape-member-media','agape-member-media',true,104857600,
 ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
ON CONFLICT(id) DO UPDATE SET file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types,public=true;

CREATE POLICY agape_member_media_public_read ON storage.objects FOR SELECT TO anon,authenticated
 USING (bucket_id='agape-member-media');
CREATE POLICY agape_member_media_owner_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id='agape-member-media' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY agape_member_media_owner_delete ON storage.objects FOR DELETE TO authenticated
 USING (bucket_id='agape-member-media' AND (storage.foldername(name))[1]=auth.uid()::text);
