# Explore Rwanda Tourism Platform

A comprehensive full-stack tourism platform for Rwanda featuring attractions, hotels, tours, bookings with Stripe payments, and role-based access control.

## Features

### Tourist Features
- Browse attractions, hotels, and tours
- View detailed information with image galleries
- Book hotels, tours, and attraction visits
- Secure payment processing with Stripe
- Receive booking receipts
- View booking history

### Service Provider Features
- Manage hotel and tour listings
- Add new listings with detailed information
- Edit existing listings
- View booking statistics and revenue
- Track approval status

### Admin Features
- Comprehensive dashboard with platform statistics
- Review and approve/reject provider submissions
- Manage all attractions (CRUD operations)
- Monitor booking activity
- User management

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **UI Components**: shadcn/ui

## Environment Variables

The following environment variables are automatically configured:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
\`\`\`

## Database Setup

Run the SQL scripts in order to set up your database:

1. `scripts/001_create_tables.sql` - Creates all necessary tables
2. `scripts/002_create_profile_trigger.sql` - Sets up automatic profile creation
3. `scripts/003_seed_data.sql` - Adds sample data

You can run these scripts directly from the v0 interface.

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Stripe account

### Installation

1. Clone the repository or download the ZIP file from v0

2. Install dependencies:
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. Run the database scripts in your Supabase SQL editor (in order)

4. Start the development server:
\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel

1. Click the "Publish" button in v0 to deploy to Vercel
2. The environment variables will be automatically configured
3. Your site will be live in minutes

### Manual Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the environment variables
4. Deploy

## User Roles

The platform supports three user roles:

- **Tourist**: Can browse and book attractions, hotels, and tours
- **Provider**: Can manage their own hotel and tour listings
- **Admin**: Full platform access including approval workflows

## Payment Flow

1. User selects a booking (hotel, tour, or attraction)
2. Fills out booking form with details
3. Proceeds to Stripe checkout
4. Upon successful payment:
   - Booking is created in database
   - User is redirected to success page with receipt
   - Receipt includes all booking details and payment information

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control for sensitive operations
- Secure authentication with Supabase
- Protected API routes for payments
- Environment variables for sensitive keys

## Color Theme

The platform uses Rwanda's symbolic colors:
- **Emerald Green** (#059669): Represents nature and wildlife
- **Gold** (#d97706): Symbolizes prosperity
- **Blue** (#3b82f6): From Rwanda's flag

## Support

For issues or questions, please contact support or refer to the documentation.

## License

All rights reserved.
