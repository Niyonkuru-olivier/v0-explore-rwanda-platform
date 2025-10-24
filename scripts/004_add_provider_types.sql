-- Add provider_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS provider_type text 
CHECK (provider_type IN ('hotel', 'tour_guide', 'car_rental', 'restaurant', 'transport'));

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.provider_type IS 'Type of service provider: hotel, tour_guide, car_rental, restaurant, transport';
