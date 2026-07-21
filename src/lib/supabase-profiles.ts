import { buildProfilePayload, type ProfileFormValues } from "./profile-form";
import { supabase } from "./supabase";
import type { ProfileRecord } from "./types";

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
    .select("*", { count: "exact" })
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

  return request.range(from, to);
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
