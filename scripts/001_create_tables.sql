-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'tourist' check (role in ('tourist', 'provider', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create attractions table
create table if not exists public.attractions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  category text not null check (category in ('wildlife', 'nature', 'culture', 'adventure')),
  location text not null,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  entry_fee_rwf integer not null,
  images text[] default '{}',
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create hotels table
create table if not exists public.hotels (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text not null,
  location text not null,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  star_rating integer check (star_rating >= 1 and star_rating <= 5),
  amenities text[] default '{}',
  images text[] default '{}',
  price_per_night_rwf integer not null,
  available_rooms integer not null default 0,
  featured boolean default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tours table
create table if not exists public.tours (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text not null,
  duration_days integer not null,
  max_participants integer not null,
  price_per_person_rwf integer not null,
  included_services text[] default '{}',
  itinerary jsonb,
  images text[] default '{}',
  featured boolean default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bookings table
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  booking_type text not null check (booking_type in ('hotel', 'tour', 'attraction')),
  reference_id uuid not null,
  check_in_date date,
  check_out_date date,
  number_of_guests integer not null default 1,
  total_amount_rwf integer not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  booking_id uuid references public.bookings(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.attractions enable row level security;
alter table public.hotels enable row level security;
alter table public.tours enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Attractions policies (public read, admin write)
create policy "Attractions are viewable by everyone"
  on public.attractions for select
  using (true);

create policy "Only admins can insert attractions"
  on public.attractions for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can update attractions"
  on public.attractions for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Hotels policies
create policy "Hotels are viewable by everyone"
  on public.hotels for select
  using (true);

create policy "Providers can insert their own hotels"
  on public.hotels for insert
  with check (
    auth.uid() = provider_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('provider', 'admin')
    )
  );

create policy "Providers can update their own hotels"
  on public.hotels for update
  using (
    auth.uid() = provider_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Tours policies
create policy "Tours are viewable by everyone"
  on public.tours for select
  using (true);

create policy "Providers can insert their own tours"
  on public.tours for insert
  with check (
    auth.uid() = provider_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('provider', 'admin')
    )
  );

create policy "Providers can update their own tours"
  on public.tours for update
  using (
    auth.uid() = provider_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Bookings policies
create policy "Users can view their own bookings"
  on public.bookings for select
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can insert their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bookings"
  on public.bookings for update
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Reviews policies
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Users can insert their own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);
