-- Increase the profile avatar upload limit to 20 MB.
UPDATE storage.buckets
SET file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
WHERE id = 'agape-member-photos';
