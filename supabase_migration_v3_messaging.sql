-- Migration: Enhance messaging with Item ID and Image URL
-- Date: 2026-02-24

-- Add columns to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES public.items(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_messages_item_id ON public.messages(item_id);

-- Ensure chat-photos storage bucket exists
-- This part usually requires Dashboard or CLI, but adding SQL for completeness if storage extension allows
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-photos', 'chat-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for chat-photos bucket
CREATE POLICY "Chat photos are accessible by conversation participants."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'chat-photos' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can upload chat photos."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'chat-photos' AND auth.role() = 'authenticated' );
