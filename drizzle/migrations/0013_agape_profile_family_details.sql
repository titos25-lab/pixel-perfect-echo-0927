-- AGAPE profile preferences and family information
ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS has_children boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS children_count smallint;

UPDATE public.member_profiles
SET relationship_goal = CASE
  WHEN relationship_goal IN ('Amizade cristã','Conhecer pessoas') THEN 'Amizade cristã'
  ELSE 'Namoro cristão'
END;

ALTER TABLE public.member_profiles
  DROP CONSTRAINT IF EXISTS member_profiles_gender_check,
  DROP CONSTRAINT IF EXISTS member_profiles_relationship_goal_check,
  DROP CONSTRAINT IF EXISTS member_profiles_children_count_check;

ALTER TABLE public.member_profiles
  ADD CONSTRAINT member_profiles_gender_check CHECK (gender IN ('', 'Masculino', 'Feminino')),
  ADD CONSTRAINT member_profiles_relationship_goal_check CHECK (relationship_goal IN ('Amizade cristã', 'Namoro cristão')),
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
      END
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS z_agape_sync_signup_details ON auth.users;
CREATE TRIGGER z_agape_sync_signup_details
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_agape_signup_details();
