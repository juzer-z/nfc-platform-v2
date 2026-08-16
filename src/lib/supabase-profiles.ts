import { buildProfilePayload, type ProfileFormValues } from "./profile-form";
import { supabase } from "./supabase";
import type { ProfileRecord, ProfileRecordWithViewCount } from "./types";

type ProfileWithViewAggregate = ProfileRecord & {
  profile_views: Array<{ count: number }>;
};

export type ProfileDuplicateCandidate = Pick<
  ProfileRecord,
  "id" | "slug" | "full_name" | "company" | "title"
>;

export async function listProfiles({
  query,
  page,
  pageSize,
}: {
  query: string;
  page: number;
  pageSize: number;
}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabase
    .from("profiles")
    .select("*, profile_views(count)", { count: "exact" })
    .order("created_at", { ascending: false });

  const trimmed = query.trim();
  if (trimmed) {
    request = request.or(
      [
        `full_name.ilike.%${trimmed}%`,
        `slug.ilike.%${trimmed}%`,
        `title.ilike.%${trimmed}%`,
        `company.ilike.%${trimmed}%`,
        `department.ilike.%${trimmed}%`,
        `phone.ilike.%${trimmed}%`,
        `whatsapp.ilike.%${trimmed}%`,
        `email_public.ilike.%${trimmed}%`,
        `website.ilike.%${trimmed}%`,
        `linkedin.ilike.%${trimmed}%`,
        `address.ilike.%${trimmed}%`,
      ].join(",")
    );
  }

  const result = await request.range(from, to);
  const data = (result.data as ProfileWithViewAggregate[] | null)?.map(
    ({ profile_views, ...profile }) => ({
      ...profile,
      view_count: profile_views?.[0]?.count ?? 0,
    })
  ) satisfies ProfileRecordWithViewCount[] | undefined;

  return { ...result, data: data ?? null };
}

export async function getProfileById(id: string) {
  return supabase.from("profiles").select("*").eq("id", id).single<ProfileRecord>();
}

export async function createProfile(form: ProfileFormValues) {
  return supabase
    .from("profiles")
    .insert(buildProfilePayload(form))
    .select("*")
    .single<ProfileRecord>();
}

export async function updateProfile(id: string, form: ProfileFormValues) {
  return supabase
    .from("profiles")
    .update({
      ...buildProfilePayload(form),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single<ProfileRecord>();
}

export async function deleteProfile(id: string) {
  return supabase.from("profiles").delete().eq("id", id);
}

export async function checkSlugAvailability(
  slug: string,
  excludeId?: string
) {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return { available: true, data: null, error: null };
  }

  let request = supabase
    .from("profiles")
    .select("id, slug, full_name, company, title")
    .eq("slug", normalizedSlug)
    .limit(1);

  if (excludeId) {
    request = request.neq("id", excludeId);
  }

  const { data, error } = await request.maybeSingle<ProfileDuplicateCandidate>();

  return {
    available: !data,
    data,
    error,
  };
}

export async function findPotentialDuplicates({
  slug,
  fullName,
  excludeId,
}: {
  slug: string;
  fullName: string;
  excludeId?: string;
}) {
  const normalizedSlug = slug.trim().toLowerCase();
  const normalizedName = fullName.trim();

  if (!normalizedSlug && !normalizedName) {
    return { data: [] as ProfileDuplicateCandidate[], error: null };
  }

  const filters = [
    normalizedSlug ? `slug.ilike.%${normalizedSlug}%` : "",
    normalizedName ? `full_name.ilike.%${normalizedName}%` : "",
  ].filter(Boolean);

  let request = supabase
    .from("profiles")
    .select("id, slug, full_name, company, title")
    .order("created_at", { ascending: false })
    .limit(5);

  if (excludeId) {
    request = request.neq("id", excludeId);
  }

  if (filters.length > 0) {
    request = request.or(filters.join(","));
  }

  return request;
}
