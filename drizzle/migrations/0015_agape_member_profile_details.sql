-- AGAPE: complete member profile data (age, height and children)
ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS age smallint,
  ADD COLUMN IF NOT EXISTS height_cm smallint;

UPDATE public.member_profiles mp
SET age = p.age
FROM public.profiles p
WHERE p.id = mp.user_id AND mp.age IS NULL;

ALTER TABLE public.member_profiles
  DROP CONSTRAINT IF EXISTS member_profiles_age_check,
  DROP CONSTRAINT IF EXISTS member_profiles_height_cm_check,
  DROP CONSTRAINT IF EXISTS member_profiles_children_count_check;

ALTER TABLE public.member_profiles
  ADD CONSTRAINT member_profiles_age_check CHECK (age IS NULL OR age BETWEEN 18 AND 100),
  ADD CONSTRAINT member_profiles_height_cm_check CHECK (height_cm IS NULL OR height_cm BETWEEN 100 AND 250),
  ADD CONSTRAINT member_profiles_children_count_check CHECK (
    (has_children = false AND children_count IS NULL) OR
    (has_children = true AND children_count BETWEEN 1 AND 20)
  );

CREATE OR REPLACE FUNCTION public.sync_agape_signup_details()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  child_flag boolean := COALESCE((NEW.raw_user_meta_data->>'has_children')::boolean, false);
  child_total smallint := NULLIF(NEW.raw_user_meta_data->>'children_count','')::smallint;
  height_value smallint := NULLIF(NEW.raw_user_meta_data->>'height_cm','')::smallint;
BEGIN
  UPDATE public.member_profiles
  SET gender = CASE
        WHEN NEW.raw_user_meta_data->>'gender' IN ('Masculino','Feminino')
        THEN NEW.raw_user_meta_data->>'gender'
        ELSE ''
      END,
      relationship_goal = CASE
        WHEN NEW.raw_user_meta_data->>'relationship_goal' IN ('Amizade cristã','Namoro cristão')
        THEN NEW.raw_user_meta_data->>'relationship_goal'
        ELSE 'Amizade cristã'
      END,
      age = NULLIF(NEW.raw_user_meta_data->>'age','')::smallint,
      country = COALESCE(NULLIF(NEW.raw_user_meta_data->>'country',''),'Moçambique'),
      province = COALESCE(NEW.raw_user_meta_data->>'province',''),
      neighborhood = COALESCE(NEW.raw_user_meta_data->>'neighborhood',''),
      location = COALESCE(NEW.raw_user_meta_data->>'location',''),
      has_children = child_flag,
      children_count = CASE WHEN child_flag THEN child_total ELSE NULL END,
      height_cm = height_value
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;
