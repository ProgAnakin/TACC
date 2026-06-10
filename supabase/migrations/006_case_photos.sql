-- Migration 006 — case photos (max 5 per case, stored in Supabase Storage)
-- Safe to re-run (idempotent)

-- =====================
-- CASE_PHOTOS TABLE
-- =====================
create table if not exists case_photos (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid references cases(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  storage_path  text not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_case_photos_case_id on case_photos(case_id);

alter table case_photos enable row level security;

drop policy if exists "case_photos_select_own" on case_photos;
create policy "case_photos_select_own" on case_photos
  for select using (auth.uid() = user_id);

drop policy if exists "case_photos_insert_own" on case_photos;
create policy "case_photos_insert_own" on case_photos
  for insert with check (auth.uid() = user_id);

drop policy if exists "case_photos_delete_own" on case_photos;
create policy "case_photos_delete_own" on case_photos
  for delete using (auth.uid() = user_id);

-- =====================
-- STORAGE BUCKET
-- =====================
insert into storage.buckets (id, name, public)
values ('case-photos', 'case-photos', false)
on conflict (id) do nothing;

-- Storage policies — files live under {user_id}/{case_id}/{filename}
-- so the first path segment must equal the authenticated user's id.
drop policy if exists "case_photos_storage_select" on storage.objects;
create policy "case_photos_storage_select" on storage.objects
  for select using (
    bucket_id = 'case-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "case_photos_storage_insert" on storage.objects;
create policy "case_photos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'case-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "case_photos_storage_delete" on storage.objects;
create policy "case_photos_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'case-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
