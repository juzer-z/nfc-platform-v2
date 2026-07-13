# Supabase Setup

Use this as the first-pass schema for the migrated app.

## SQL Schema

```sql
create extension if not exists pgcrypto;

create type public.role as enum ('SUPER_ADMIN', 'HR_ADMIN', 'EMPLOYEE');

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  title text,
  company text,
  department text,
  phone text,
  whatsapp text,
  email_public text,
  website text,
  linkedin text,
  address text,
  map_url text,
  photo_url text,
  company_logo_url text,
  is_published boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  ip_address text,
  user_agent text,
  referer text,
  viewed_at timestamptz not null default now()
);

create index if not exists profile_views_profile_id_viewed_at_idx
  on public.profile_views(profile_id, viewed_at desc);

create index if not exists profile_views_viewed_at_idx
  on public.profile_views(viewed_at desc);
```

## Auth Approach

- Use Supabase Auth for admin users
- Keep admin role data in either:
  - `profiles` + a separate admin table, or
  - a `user_roles` table linked to `auth.users`

Recommended starter table:

```sql
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.role not null default 'HR_ADMIN',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Basic RLS Idea

- Public users can `select` only active + published profiles
- `SUPER_ADMIN` and `HR_ADMIN` can create/edit/delete profiles
- `EMPLOYEE` can create/edit profiles but cannot delete them
- Only admins can read profile views

Example public read policy:

```sql
alter table public.profiles enable row level security;

create policy "public can read active published profiles"
on public.profiles
for select
using (is_active = true and is_published = true);
```

If you want the Cloudflare vCard function to read via Supabase REST, public `select` on active + published profiles is required.

Recommended role helper functions:

```sql
create or replace function public.is_active_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and is_active = true
      and role in ('SUPER_ADMIN', 'HR_ADMIN')
  );
$$;

create or replace function public.can_manage_profiles()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and is_active = true
      and role in ('SUPER_ADMIN', 'HR_ADMIN', 'EMPLOYEE')
  );
$$;
```

Then split the profile policies so delete remains admin-only:

```sql
drop policy if exists "public can read active published profiles" on public.profiles;
create policy "public can read active published profiles"
on public.profiles
for select
using (is_active = true and is_published = true);

drop policy if exists "users can read draft profiles they manage" on public.profiles;
create policy "users can read draft profiles they manage"
on public.profiles
for select
using (public.can_manage_profiles());

drop policy if exists "users can insert profiles" on public.profiles;
create policy "users can insert profiles"
on public.profiles
for insert
with check (public.can_manage_profiles());

drop policy if exists "users can update profiles" on public.profiles;
create policy "users can update profiles"
on public.profiles
for update
using (public.can_manage_profiles())
with check (public.can_manage_profiles());

drop policy if exists "admins can delete profiles" on public.profiles;
create policy "admins can delete profiles"
on public.profiles
for delete
using (public.is_active_admin());
```

## Notes

- Column names are snake_case for better SQL ergonomics.
- The React app maps these fields back into the existing frontend naming shape.
- Image URLs should point to ImageKit assets, not local disk.
