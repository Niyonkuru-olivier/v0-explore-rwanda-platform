-- Fix the provider_type constraint to allow NULL values
-- Copy and paste this entire script into Supabase SQL Editor

-- Step 1: Drop the existing constraint (try different possible names)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_provider_type_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_provider_role;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_provider_type;

-- Step 2: Add new constraint that allows NULL values
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_provider_type 
CHECK (
    provider_type IS NULL 
    OR provider_type IN ('hotel', 'tour_guide', 'car_rental', 'restaurant', 'transport')
);

