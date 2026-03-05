-- Migration: Add Transactions and Wallet storage
-- Date: 2026-02-24

-- Add wallet address to profiles
alter table public.profiles add column if not exists wallet_address text;

-- Create transactions table
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.items(id) on delete set null,
  type text not null check (type in ('deposit', 'payout', 'commission')),
  amount numeric not null,
  currency text default 'BNB',
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  tx_hash text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policies for Transactions
create policy "Users can view their own transactions."
  on public.transactions for select
  using ( auth.uid() = user_id );

-- Admin can view all transactions
create policy "Admins can view all transactions."
  on public.transactions for select
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Users can insert their own pending transactions
create policy "Users can record their own transactions."
  on public.transactions for insert
  with check ( auth.uid() = user_id );

-- Secure access to item-linked transactions
create policy "Users can see transactions related to items they reported."
  on public.transactions for select
  using ( 
    exists (
      select 1 from public.items 
      where items.id = transactions.item_id 
      and items.user_id = auth.uid()
    )
  );
