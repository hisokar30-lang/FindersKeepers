-- Create the 'images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Allow public access to view images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- Allow anyone to upload images (Public/Altruistic model)
create policy "Anyone can upload"
on storage.objects for insert
with check ( bucket_id = 'images' );

-- (Optional) If you want to limit deletes to the owner/admin
-- create policy "Owners can delete"
-- on storage.objects for delete
-- using ( bucket_id = 'images' );
