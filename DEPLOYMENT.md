# Deployment Guide - Explore Rwanda Platform

This guide will help you deploy the Explore Rwanda tourism platform to production.

## Prerequisites

- Vercel account
- Supabase account (already connected)
- Stripe account (already connected)
- Domain name (optional)

## Step 1: Database Setup

The database schema is already created in the `scripts` folder. To set up your database:

1. The SQL scripts will be automatically executed when you run them from the v0 interface
2. Scripts are numbered in execution order:
   - `001_create_tables.sql` - Creates all database tables
   - `002_create_profile_trigger.sql` - Sets up automatic profile creation
   - `003_seed_data.sql` - Adds sample data (optional for production)

## Step 2: Environment Variables

All required environment variables are already configured in your v0 project:

### Supabase Variables (Already Set)
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

### Stripe Variables (Already Set)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Additional Variables to Set
- `NEXT_PUBLIC_SITE_URL` - Your production domain (e.g., https://explorerwanda.com)

## Step 3: Supabase Configuration

### Enable Email Authentication

1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Enable Email provider
4. Configure email templates (optional)

### Set Up Row Level Security (RLS)

RLS policies are already defined in the SQL scripts. Verify they're active:

1. Go to Supabase dashboard > Database > Tables
2. Check that RLS is enabled on all tables
3. Review policies to ensure they match your security requirements

### Configure Auth Redirects

1. In Supabase dashboard, go to Authentication > URL Configuration
2. Add your production URL to Site URL
3. Add redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/booking-success`

## Step 4: Stripe Configuration

### Set Up Products

The platform uses Stripe Checkout for payments. Products are created dynamically, but you should:

1. Go to Stripe Dashboard > Products
2. Verify test mode products are working
3. When ready for production, switch to live mode
4. Update environment variables with live keys

### Configure Webhooks (Optional)

For production, set up Stripe webhooks:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Add webhook secret to environment variables

## Step 5: Deploy to Vercel

### Option 1: Deploy from v0 (Recommended)

1. Click the "Publish" button in the v0 interface
2. Follow the prompts to connect your Vercel account
3. Select your project settings
4. Deploy!

### Option 2: Deploy from GitHub

1. Push your code to GitHub using the GitHub integration in v0
2. Go to Vercel dashboard
3. Import your GitHub repository
4. Vercel will auto-detect Next.js and configure build settings
5. Add environment variables in Vercel project settings
6. Deploy

## Step 6: Post-Deployment Configuration

### Create Admin User

1. Sign up for an account on your deployed site
2. Go to Supabase dashboard > Table Editor > profiles
3. Find your user and change `role` to `admin`

### Add Initial Content

As an admin, you can now:

1. Add attractions via the admin dashboard
2. Approve service provider registrations
3. Monitor bookings and payments

### Test the Platform

1. Create a test booking using Stripe test cards
2. Verify email notifications are working
3. Test the receipt generation and printing
4. Check all user roles (tourist, provider, admin)

## Step 7: Domain Configuration (Optional)

1. In Vercel dashboard, go to your project settings
2. Navigate to Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_SITE_URL` environment variable

## Monitoring and Maintenance

### Vercel Analytics

Enable Vercel Analytics for insights:
1. Go to your project in Vercel
2. Navigate to Analytics tab
3. Enable Web Analytics

### Database Backups

Supabase automatically backs up your database. To configure:
1. Go to Supabase dashboard > Database > Backups
2. Review backup schedule
3. Test restore process

### Error Monitoring

The platform includes error boundaries. For production monitoring:
1. Consider integrating Sentry or similar service
2. Monitor Vercel logs for server-side errors
3. Set up alerts for critical issues

## Security Checklist

- [ ] RLS policies are enabled on all tables
- [ ] Stripe is in live mode with live keys
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] Environment variables are secure
- [ ] Admin accounts are properly secured
- [ ] Email verification is enabled
- [ ] Rate limiting is configured (consider Vercel Edge Config)

## Support

For issues or questions:
- Check the README.md for development guidelines
- Review Supabase documentation: https://supabase.com/docs
- Review Stripe documentation: https://stripe.com/docs
- Contact Vercel support: https://vercel.com/help

## Production Checklist

Before going live:
- [ ] Database is set up and seeded
- [ ] All environment variables are configured
- [ ] Supabase auth is configured
- [ ] Stripe is in live mode
- [ ] Admin user is created
- [ ] Test bookings completed successfully
- [ ] Email notifications are working
- [ ] Custom domain is configured (if applicable)
- [ ] Analytics are enabled
- [ ] Backups are configured
- [ ] Security checklist is complete

Congratulations! Your Explore Rwanda platform is now live! 🇷🇼
