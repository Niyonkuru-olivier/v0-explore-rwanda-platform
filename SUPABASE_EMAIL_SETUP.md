# How to Enable Supabase Email Sending

Supabase has a built-in email service that can send verification emails automatically - **no custom domain needed!**

## Step 1: Enable Email Provider in Supabase

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Email** in the list
5. Make sure it's **Enabled** (toggle should be ON)
6. Click **Save**

## Step 2: Configure Email Settings

1. Still in **Authentication** section, go to **Email Templates**
2. You can customize the email templates if you want, or use the defaults
3. The default templates will work fine for verification emails

## Step 3: Configure Site URL

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/login?verified=1`
   - `http://localhost:3000/**` (for all auth redirects)

## Step 4: Test It!

1. Try registering a new user
2. Check the user's email inbox
3. The verification email should arrive from Supabase automatically

## How It Works

- When you register a user, Supabase automatically generates a verification link
- Supabase sends the verification email using their email service
- **No custom domain needed** - Supabase handles everything
- Emails come from Supabase's email service (usually `noreply@mail.app.supabase.io` or similar)

## Email Limits

Supabase's free tier includes:
- Email sending is included
- No domain verification required
- Works immediately after enabling

## Troubleshooting

If emails aren't being sent:

1. **Check Email Provider is Enabled**
   - Go to Authentication > Providers > Email
   - Make sure it's toggled ON

2. **Check Email Templates**
   - Go to Authentication > Email Templates
   - Make sure templates are configured

3. **Check Spam Folder**
   - Verification emails might go to spam initially
   - Check the user's spam/junk folder

4. **Check Supabase Logs**
   - Go to Logs > Auth Logs
   - Look for email sending errors

5. **Verify Site URL**
   - Make sure Site URL is set correctly
   - Should match your application URL

## That's It!

Once email is enabled in Supabase, verification emails will be sent automatically when users register. No Resend API key or custom domain needed!

