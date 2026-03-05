-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Public profile info linked to auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  avatar_url text,
  role text default 'user', -- 'user' | 'admin'
  trust_score integer default 100,
  items_reported_count integer default 0,
  items_found_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. ITEMS TABLE (Lost and Found Items)
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null, -- 'lost' | 'found'
  category text not null,
  title text not null,
  description text,
  location_name text,
  location_lat float,
  location_lng float,
  date date,
  approx_value numeric,
  reward_amount numeric,
  status text default 'Reported', -- 'Reported' | 'Found' | 'Resolved'
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for Items
alter table public.items enable row level security;

create policy "Items are viewable by everyone."
  on items for select
  using ( true );

create policy "Authenticated users can insert items."
  on items for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own items."
  on items for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own items."
  on items for delete
  using ( auth.uid() = user_id );


-- 3. STORAGE BUCKETS
-- Note: You must create these buckets in the Supabase Dashboard first if not using SQL.

-- Item Photos
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "Item photos are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'item-photos' );

create policy "Authenticated users can upload item photos."
  on storage.objects for insert
  with check ( bucket_id = 'item-photos' and auth.role() = 'authenticated' );

create policy "Users can update their own item photos."
  on storage.objects for update
  using ( bucket_id = 'item-photos' and auth.uid() = owner );

-- Avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update their own avatars."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );


-- 4. SOCIAL FEATURES (Likes & Comments)
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(item_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone."
  on likes for select
  using ( true );

create policy "Authenticated users can toggle likes."
  on likes for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can unlike."
  on likes for delete
  using ( auth.uid() = user_id );

-- Comments
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Authenticated users can comment."
  on comments for insert
  with check ( auth.role() = 'authenticated' );

-- 5. MESSAGING SYSTEM (Private Chat)
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can see messages sent to or by them."
  on messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

create policy "Users can send messages."
  on messages for insert
  with check ( auth.uid() = sender_id );

create policy "Users can update (read status) messages sent to them."
  on messages for update
  using ( auth.uid() = receiver_id );
