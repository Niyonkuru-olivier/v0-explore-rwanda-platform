# How to Enable Supabase Email Sending - STEP BY STEP

## The Problem
When using `admin.createUser`, Supabase doesn't automatically send verification emails. You need to enable email sending in your Supabase dashboard.

## Solution: Enable Email in Supabase Dashboard

### Step 1: Open Supabase Dashboard
1. Go to **https://supabase.com/dashboard**
2. Select your project

### Step 2: Enable Email Provider
1. Click on **Authentication** in the left sidebar
2. Click on **Providers**
3. Find **Email** in the list
4. Make sure the toggle is **ON** (enabled)
5. Click **Save**

### Step 3: Configure Email Templates (Optional but Recommended)
1. Still in **Authentication**, click on **Email Templates**
2. Check that **Confirm signup** template exists
3. The default template should work, but you can customize it if needed

### Step 4: Configure Site URL
1. In **Authentication**, click on **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/login?verified=1`
   - `http://localhost:3000/**`

### Step 5: Test Email Sending
1. Try registering a new user
2. Check the user's email inbox
3. **Also check spam/junk folder** - Supabase emails sometimes go there initially

## Important Notes

- **Email sending is FREE** - No domain verification needed
- **Works immediately** after enabling
- **No API keys required** - Supabase handles everything
- Emails come from Supabase's email service (usually `noreply@mail.app.supabase.io`)

## If Emails Still Don't Arrive

1. **Check Supabase Logs**:
   - Go to **Logs** > **Auth Logs** in Supabase dashboard
   - Look for email sending errors

2. **Check Spam Folder**:
   - Verification emails often go to spam initially

3. **Verify Email Provider is Enabled**:
   - Go back to **Authentication** > **Providers** > **Email**
   - Make absolutely sure it's toggled ON

4. **Check Email Templates**:
   - Go to **Authentication** > **Email Templates**
   - Make sure templates are configured

5. **Use the Verification Link from Console**:
   - The verification link is always logged in the console
   - You can copy it and send it manually if needed

## Current Status

The code generates verification links correctly. Once you enable email in Supabase Dashboard, emails will be sent automatically when users register.

**The verification link is always available in the console output for manual use if needed.**

