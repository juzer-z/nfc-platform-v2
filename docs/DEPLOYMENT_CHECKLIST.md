# Deployment Checklist

Use this checklist to bring the new `app/` stack online with Supabase, ImageKit, and Cloudflare Pages.

## 1. Create Supabase Project

Create a new Supabase project and keep these values ready:

- Project URL
- Anon key
- Service role key

You will use:

- `Project URL` as `VITE_SUPABASE_URL` and `SUPABASE_URL`
- `Anon key` as `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`

## 2. Run SQL In Supabase

Open Supabase SQL Editor and run this full script.

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

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.role not null default 'HR_ADMIN',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_views_profile_id_viewed_at_idx
  on public.profile_views(profile_id, viewed_at desc);

create index if not exists profile_views_viewed_at_idx
  on public.profile_views(viewed_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at();
```

## 3. Enable RLS And Policies

Run this next:

```sql
alter table public.profiles enable row level security;
alter table public.profile_views enable row level security;
alter table public.user_roles enable row level security;

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

drop policy if exists "public can read active published profiles" on public.profiles;
create policy "public can read active published profiles"
on public.profiles
for select
using (is_active = true and is_published = true);

drop policy if exists "admins can manage profiles" on public.profiles;
create policy "admins can manage profiles"
on public.profiles
for all
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "admins can read roles" on public.user_roles;
create policy "admins can read roles"
on public.user_roles
for select
using (public.is_active_admin());

drop policy if exists "admins can manage roles" on public.user_roles;
create policy "admins can manage roles"
on public.user_roles
for all
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists "admins can read profile views" on public.profile_views;
create policy "admins can read profile views"
on public.profile_views
for select
using (public.is_active_admin());

drop policy if exists "public can insert profile views" on public.profile_views;
create policy "public can insert profile views"
on public.profile_views
for insert
with check (true);
```

## 4. Create First Admin User

In Supabase Auth:

1. Go to `Authentication`
2. Create a user manually with your admin email/password

Then in SQL Editor, assign the role:

```sql
insert into public.user_roles (user_id, role, is_active)
select id, 'SUPER_ADMIN', true
from auth.users
where email = 'your-admin@email.com'
on conflict (user_id) do update
set role = excluded.role,
    is_active = excluded.is_active;
```

## 5. Create ImageKit Credentials

In ImageKit, collect:

- URL endpoint
- Public key
- Private key

Use:

- URL endpoint as `VITE_IMAGEKIT_URL_ENDPOINT`
- Public key as `VITE_IMAGEKIT_PUBLIC_KEY`
- Private key as `IMAGEKIT_PRIVATE_KEY`

## 6. Local App Env

Create `app/.env`:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/YOUR_ENDPOINT"
VITE_IMAGEKIT_PUBLIC_KEY="YOUR_IMAGEKIT_PUBLIC_KEY"
VITE_APP_URL="http://localhost:5173"
IMAGEKIT_PRIVATE_KEY="YOUR_IMAGEKIT_PRIVATE_KEY"
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

Note:

- `IMAGEKIT_PRIVATE_KEY` is only for serverless functions. Do not expose it in browser code.

## 7. Local Test

From `app/` run:

```bash
npm install
npm run dev
```

Then test:

- `/admin/login`
- `/admin/profiles`
- `/admin/profiles/new`
- `/u/demo-profile`

After creating real profiles, test:

- image upload buttons
- profile save/edit/delete
- vCard download

## 8. Cloudflare Pages Setup

Create a Pages project connected to this repo and use:

- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `app`

Add these environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_IMAGEKIT_URL_ENDPOINT
VITE_IMAGEKIT_PUBLIC_KEY
VITE_APP_URL
IMAGEKIT_PRIVATE_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
```

Set:

- `VITE_APP_URL` to your Cloudflare domain, for example `https://1card.fyi`

## 9. DNS / Domain

Point your domain to Cloudflare Pages when ready.

Make sure SPA routing is active via:

```text
public/_redirects
/* /index.html 200
```

## 10. Final Acceptance Test

Verify:

- homepage loads
- public profile loads by slug
- admin login works
- create/edit/delete works
- photo/logo upload works
- vCard download works on iPhone

## Suggested Next Improvements

- Move profile view tracking into a client/serverless write
- Add role-aware route guards in the frontend
- Add chunk splitting to reduce bundle size
- Add import/export tools for profile migration from the old system
