-- SAFE MIGRATION - Handles already-existing objects
-- Run this entire file in Supabase SQL Editor

-- ============================================
-- PART 1: CORE TABLES (Skipped if already exist)
-- ============================================
-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  avatar_url text,
  role text default 'user',
  trust_score integer default 100,
  items_reported_count integer default 0,
  items_found_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Items table
CREATE TABLE IF NOT EXISTS public.items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null,
  category text not null,
  title text not null,
  description text,
  location_name text,
  location_lat float,
  location_lng float,
  date date,
  approx_value numeric,
  reward_amount numeric,
  status text default 'Reported',
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(item_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- PART 2: NEW TABLES (Escrow/Rewards)
-- ============================================
-- Escrow transactions table
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id uuid default uuid_generate_v4() primary key,
  incident_id uuid references public.items(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  finder_id uuid references public.profiles(id) on delete set null,
  amount numeric not null,
  platform_fee numeric not null,
  net_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'held', 'released', 'refunded', 'disputed')),
  payment_provider text default 'stripe',
  payment_intent_id text,
  verification_answers text[],
  held_at timestamp with time zone,
  released_at timestamp with time zone,
  refunded_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tier text default 'free' check (tier in ('free', 'basic', 'business')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  status text default 'active' check (status in ('active', 'canceled', 'past_due', 'paused')),
  cancel_at_period_end boolean default false,
  items_used_this_period integer default 0,
  boosts_used_this_period integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscription tiers config table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id uuid default uuid_generate_v4() primary key,
  tier_name text not null unique,
  monthly_price integer,
  yearly_price integer,
  max_active_items integer,
  max_storage_days integer,
  max_boosts_per_month integer,
  max_message_history_days integer,
  max_photos_per_item integer,
  has_analytics boolean default false,
  has_custom_branding boolean default false,
  has_api_access boolean default false,
  has_priority_support boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Matching priorities table
CREATE TABLE IF NOT EXISTS public.matching_priorities (
  incident_id uuid references public.items(id) on delete cascade primary key,
  priority_score integer default 0,
  tier_boost boolean default false,
  urgency_boost boolean default false,
  verification_boost boolean default false,
  recency_boost boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions table (financial)
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.items(id) on delete set null,
  type text not null check (type in ('deposit', 'payout', 'commission')),
  amount numeric not null,
  currency text default 'USD',
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  tx_hash text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- PART 3: UPDATE EXISTING TABLES
-- ============================================
-- Add columns to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES public.items(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_messages_item_id ON public.messages(item_id);

-- Add Stripe fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_connected_account_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_charges_enabled boolean default false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_payouts_enabled boolean default false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_status text default 'unverified';

-- ============================================
-- PART 4: FUNCTIONS
-- ============================================
-- Increment usage function
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_subscription_id text,
  p_field text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_field = 'items' THEN
    UPDATE public.subscriptions SET items_used_this_period = COALESCE(items_used_this_period, 0) + 1, updated_at = NOW() WHERE id = p_subscription_id;
  ELSIF p_field = 'boosts' THEN
    UPDATE public.subscriptions SET boosts_used_this_period = COALESCE(boosts_used_this_period, 0) + 1, updated_at = NOW() WHERE id = p_subscription_id;
  END IF;
END;
$$;

-- Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- PART 5: ENABLE RLS (Safe)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: DROP EXISTING POLICIES (Safe)
-- ============================================
-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- Items
DROP POLICY IF EXISTS "Items are viewable by everyone." ON public.items;
DROP POLICY IF EXISTS "Authenticated users can insert items." ON public.items;
DROP POLICY IF EXISTS "Users can update their own items." ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items." ON public.items;

-- Likes
DROP POLICY IF EXISTS "Likes are viewable by everyone." ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can toggle likes." ON public.likes;
DROP POLICY IF EXISTS "Users can unlike." ON public.likes;

-- Comments
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can comment." ON public.comments;

-- Messages
DROP POLICY IF EXISTS "Users can see messages sent to or by them." ON public.messages;
DROP POLICY IF EXISTS "Users can send messages." ON public.messages;
DROP POLICY IF EXISTS "Users can update (read status) messages sent to them." ON public.messages;

-- Escrow
DROP POLICY IF EXISTS "Users can view their own escrow transactions." ON public.escrow_transactions;
DROP POLICY IF EXISTS "Users can create escrow transactions." ON public.escrow_transactions;

-- Subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions." ON public.subscriptions;

-- Transactions
DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions." ON public.transactions;
DROP POLICY IF EXISTS "Users can record their own transactions." ON public.transactions;

-- Storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Chat photos are accessible by conversation participants." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat photos." ON storage.objects;
DROP POLICY IF EXISTS "Item photos are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload item photos." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own item photos." ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars." ON storage.objects;

-- ============================================
-- PART 7: CREATE POLICIES
-- ============================================
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Items
CREATE POLICY "Items are viewable by everyone." ON public.items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert items." ON public.items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own items." ON public.items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items." ON public.items FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Likes are viewable by everyone." ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can toggle likes." ON public.likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can unlike." ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages
CREATE POLICY "Users can see messages sent to or by them." ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages." ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update (read status) messages sent to them." ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Escrow
CREATE POLICY "Users can view their own escrow transactions." ON public.escrow_transactions FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = finder_id);
CREATE POLICY "Users can create escrow transactions." ON public.escrow_transactions FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Subscriptions
CREATE POLICY "Users can view their own subscriptions." ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions." ON public.transactions FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can record their own transactions." ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 8: STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-photos', 'chat-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('item-photos', 'item-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 9: STORAGE POLICIES
-- ============================================
-- Images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

-- Chat photos
CREATE POLICY "Chat photos are accessible by conversation participants." ON storage.objects FOR SELECT USING (bucket_id = 'chat-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload chat photos." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-photos' AND auth.role() = 'authenticated');

-- Item photos
CREATE POLICY "Item photos are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'item-photos');
CREATE POLICY "Authenticated users can upload item photos." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own item photos." ON storage.objects FOR UPDATE USING (bucket_id = 'item-photos' AND auth.uid() = owner);

-- Avatars
CREATE POLICY "Avatars are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own avatars." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- ============================================
-- PART 10: SEED SUBSCRIPTION TIERS
-- ============================================
INSERT INTO public.subscription_tiers (
  tier_name, monthly_price, yearly_price, max_active_items, max_storage_days,
  max_boosts_per_month, max_message_history_days, max_photos_per_item,
  has_analytics, has_custom_branding, has_api_access, has_priority_support
) VALUES
  ('free', 0, 0, 5, 60, 0, 7, 3, false, false, false, false),
  ('basic', 999, 9999, 20, 365, 3, 30, 5, true, false, false, false),
  ('business', 2999, 29999, null, null, 10, 90, 10, true, true, true, true)
ON CONFLICT (tier_name) DO UPDATE SET
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  max_active_items = EXCLUDED.max_active_items;

-- Done! All migrations completed safely.
