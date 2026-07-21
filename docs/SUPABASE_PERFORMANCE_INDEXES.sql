-- Performance indexes for the live Supabase dataset.
-- These statements do not change existing profile data.
-- Run them in Supabase SQL Editor.
--
-- If your table is heavily used in production, run the CREATE INDEX CONCURRENTLY
-- variants one by one in a SQL client that allows non-transactional execution.

create extension if not exists pg_trgm;

-- Public-profile fetches by slug and visibility.
create index if not exists profiles_public_slug_lookup_idx
  on public.profiles (slug, is_active, is_published);

-- Admin listing and newest-first pagination.
create index if not exists profiles_created_at_desc_idx
  on public.profiles (created_at desc);

create index if not exists profiles_admin_visibility_created_idx
  on public.profiles (is_active, is_published, created_at desc);

-- Trigram indexes for ilike search fields used in the admin table search.
create index if not exists profiles_full_name_trgm_idx
  on public.profiles using gin (full_name gin_trgm_ops);

create index if not exists profiles_slug_trgm_idx
  on public.profiles using gin (slug gin_trgm_ops);

create index if not exists profiles_title_trgm_idx
  on public.profiles using gin (title gin_trgm_ops);

create index if not exists profiles_company_trgm_idx
  on public.profiles using gin (company gin_trgm_ops);

create index if not exists profiles_department_trgm_idx
  on public.profiles using gin (department gin_trgm_ops);

create index if not exists profiles_phone_trgm_idx
  on public.profiles using gin (phone gin_trgm_ops);

create index if not exists profiles_whatsapp_trgm_idx
  on public.profiles using gin (whatsapp gin_trgm_ops);

create index if not exists profiles_email_public_trgm_idx
  on public.profiles using gin (email_public gin_trgm_ops);

create index if not exists profiles_website_trgm_idx
  on public.profiles using gin (website gin_trgm_ops);

create index if not exists profiles_linkedin_trgm_idx
  on public.profiles using gin (linkedin gin_trgm_ops);

create index if not exists profiles_address_trgm_idx
  on public.profiles using gin (address gin_trgm_ops);
