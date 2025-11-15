# How to Fix Resend Email Sending Issue

## Current Issue

Resend's free tier only allows sending test emails to your own verified email address. To send verification emails to **any user** who registers, you need to verify your domain.

## Solution: Verify Your Domain in Resend

Follow these steps to verify your domain and enable email sending to all recipients:

### Step 1: Access Resend Domains

1. Go to **https://resend.com/domains**
2. Make sure you're logged in with your Resend account

### Step 2: Add Your Domain

1. Click the **"Add Domain"** button
2. Enter your domain name (e.g., `explorerwanda.com`)
   - Use your actual domain, not a subdomain
   - If you don't have a domain yet, you can purchase one from services like:
     - Namecheap
     - GoDaddy
     - Google Domains
     - Cloudflare

### Step 3: Add DNS Records

Resend will show you DNS records to add. You'll typically need:

1. **TXT Record for Domain Verification**
   - Name: `@` or your domain name
   - Value: Provided by Resend

2. **DKIM Records** (usually 3 CNAME records)
   - Name: Something like `resend._domainkey`
   - Value: Provided by Resend

3. **SPF Record** (TXT record)
   - Name: `@`
   - Value: `v=spf1 include:resend.com ~all`

### Step 4: Add Records to Your Domain

1. Go to your domain registrar or DNS provider
2. Access DNS settings for your domain
3. Add all the records Resend provided
4. Save the changes

### Step 5: Wait for Verification

1. Go back to Resend dashboard
2. Wait for verification (usually takes a few minutes to 24 hours)
3. The domain status will show as "Verified" when ready

### Step 6: Update Your Environment Variables

Once verified, update your `.env.local` file:

```env
RESEND_FROM_EMAIL=Explore Rwanda <noreply@yourdomain.com>
```

Replace `yourdomain.com` with your actual verified domain.

### Step 7: Restart Your Server

After updating the environment variable:
```bash
# Stop your server (Ctrl+C)
# Start it again
npm run dev
# or
pnpm dev
```

## Alternative: Testing with Your Own Email (Temporary)

If you want to test immediately without verifying a domain, you can only send test emails to your verified email (`oniyonkuru233@gmail.com`). 

**Note:** This won't work for production - you'll need domain verification to send to any user.

## Quick Domain Providers (If You Don't Have One)

If you need a domain quickly:

1. **Cloudflare** - ~$10/year, good DNS management
2. **Namecheap** - ~$10-15/year
3. **GoDaddy** - ~$12-15/year

## After Verification

Once your domain is verified:
- ✅ You can send emails to **any recipient**
- ✅ Emails will come from your domain (more professional)
- ✅ Better deliverability rates
- ✅ No more "test email" restrictions

## Need Help?

If you encounter issues:
- Check Resend documentation: https://resend.com/docs
- Verify DNS records are correctly added (can take up to 48 hours)
- Make sure no typos in DNS records
- Contact Resend support if domain doesn't verify after 24 hours

