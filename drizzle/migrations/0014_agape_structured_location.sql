-- AGAPE: structured location details
ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Moçambique',
  ADD COLUMN IF NOT EXISTS province text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS neighborhood text NOT NULL DEFAULT '';

UPDATE public.member_profiles
SET country = COALESCE(NULLIF(country,''),'Moçambique'),
    province = COALESCE(NULLIF(province,''),location),
    neighborhood = COALESCE(neighborhood,'');

CREATE OR REPLACE FUNCTION public.sync_agape_signup_details()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      country = COALESCE(NULLIF(NEW.raw_user_meta_data->>'country',''),'Moçambique'),
      province = COALESCE(NEW.raw_user_meta_data->>'province',''),
      neighborhood = COALESCE(NEW.raw_user_meta_data->>'neighborhood',''),
      location = COALESCE(NEW.raw_user_meta_data->>'location','')
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;
