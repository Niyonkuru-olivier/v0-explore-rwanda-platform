-- Fix the provider_type constraint to allow NULL values
-- This is necessary because tourists and admins don't have a provider_type
-- This also allows flexibility to change user roles in Supabase

-- First, find and drop the existing constraint
-- We'll use a DO block to handle any constraint name
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name on provider_type column
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND conkey::text LIKE '%provider_type%';
    
    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    
    -- Also try dropping by common names
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_provider_type_check;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_provider_role;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_provider_type;
EXCEPTION
    WHEN OTHERS THEN
        -- Continue even if constraint doesn't exist
        NULL;
END $$;

-- Now add a new constraint that allows NULL or valid provider types
-- This allows tourists and admins to have NULL provider_type
-- And allows providers to have a valid provider_type or NULL (for flexibility)
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_provider_type 
CHECK (
    provider_type IS NULL 
    OR provider_type IN ('hotel', 'tour_guide', 'car_rental', 'restaurant', 'transport')
);

