-- Allow authenticated users who can manage profiles to read visit totals.
-- Run this once in the Supabase SQL Editor for the production project.

alter table public.profile_views enable row level security;

drop policy if exists "admins can read profile views" on public.profile_views;
drop policy if exists "profile managers can read profile views" on public.profile_views;

create policy "profile managers can read profile views"
on public.profile_views
for select
to authenticated
using (public.can_manage_profiles());

-- Confirm that the current signed-in SQL Editor user can see recorded rows.
select profile_id, count(*) as view_count
from public.profile_views
group by profile_id
order by view_count desc;
