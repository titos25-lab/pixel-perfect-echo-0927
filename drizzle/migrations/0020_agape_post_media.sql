-- Dedicated public image storage for Ágape community posts.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES(
 'agape-post-media',
 'agape-post-media',
 true,
 15728640,
 ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT(id) DO UPDATE SET
 public=true,
 file_size_limit=15728640,
 allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS agape_post_media_public_read ON storage.objects;
CREATE POLICY agape_post_media_public_read
ON storage.objects FOR SELECT TO anon,authenticated
USING(bucket_id='agape-post-media');

DROP POLICY IF EXISTS agape_post_media_owner_insert ON storage.objects;
CREATE POLICY agape_post_media_owner_insert
ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='agape-post-media' AND (storage.foldername(name))[1]=auth.uid()::text);

DROP POLICY IF EXISTS agape_post_media_owner_delete ON storage.objects;
CREATE POLICY agape_post_media_owner_delete
ON storage.objects FOR DELETE TO authenticated
USING(bucket_id='agape-post-media' AND (storage.foldername(name))[1]=auth.uid()::text);
