# Fix for "valid_provider_role" Constraint Error

## Problem
The error `new row for relation "profiles" violates check constraint "valid_provider_role"` occurs because the `provider_type` constraint doesn't allow NULL values, but tourists and admins should have NULL for `provider_type`.

## Solution
Run the SQL script `005_fix_provider_type_constraint.sql` in your Supabase SQL Editor to fix the constraint.

## Steps to Fix

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Fix Script**
   - Copy the contents of `scripts/005_fix_provider_type_constraint.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Update the Trigger (Optional but Recommended)**
   - Also run `scripts/002_create_profile_trigger.sql` to update the trigger function
   - This ensures new user profiles are created correctly with proper `provider_type` handling

## What the Fix Does

- Drops the old constraint that doesn't allow NULL values
- Creates a new constraint that allows:
  - `NULL` (for tourists and admins)
  - Valid provider types: `'hotel'`, `'tour_guide'`, `'car_rental'`, `'restaurant'`, `'transport'` (for providers)

## After the Fix

- You can now change user roles in Supabase without constraint errors
- Tourists and admins will have `provider_type = NULL`
- Providers can have a valid `provider_type` or `NULL` (for flexibility)
- New user signups will work correctly

## Verification

After running the script, try:
1. Creating a new user account (should work without errors)
2. Changing a user's role in Supabase (should work without constraint errors)
3. Logging in with different user types (should redirect correctly)

