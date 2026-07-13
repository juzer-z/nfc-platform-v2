import type { ProfileRecord } from "./types";

export type ProfileFormValues = {
  fullName: string;
  slug: string;
  title: string;
  company: string;
  department: string;
  phone: string;
  whatsapp: string;
  emailPublic: string;
  website: string;
  linkedin: string;
  address: string;
  mapUrl: string;
  photoUrl: string;
  companyLogoUrl: string;
  isActive: boolean;
  isPublished: boolean;
};

export function createEmptyProfileForm(): ProfileFormValues {
  return {
    fullName: "",
    slug: "",
    title: "",
    company: "",
    department: "",
    phone: "",
    whatsapp: "",
    emailPublic: "",
    website: "",
    linkedin: "",
    address: "",
    mapUrl: "",
    photoUrl: "",
    companyLogoUrl: "",
    isActive: true,
    isPublished: true,
  };
}

export function mapProfileToForm(profile: ProfileRecord): ProfileFormValues {
  return {
    fullName: profile.full_name,
    slug: profile.slug,
    title: profile.title ?? "",
    company: profile.company ?? "",
    department: profile.department ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",
    emailPublic: profile.email_public ?? "",
    website: profile.website ?? "",
    linkedin: profile.linkedin ?? "",
    address: profile.address ?? "",
    mapUrl: profile.map_url ?? "",
    photoUrl: profile.photo_url ?? "",
    companyLogoUrl: profile.company_logo_url ?? "",
    isActive: profile.is_active,
    isPublished: profile.is_published,
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function buildProfilePayload(form: ProfileFormValues) {
  const fullName = form.fullName.trim();

  return {
    full_name: fullName,
    slug: (form.slug.trim() || slugify(fullName) || "user").toLowerCase(),
    title: emptyToNull(form.title),
    company: emptyToNull(form.company),
    department: emptyToNull(form.department),
    phone: emptyToNull(form.phone),
    whatsapp: emptyToNull(form.whatsapp),
    email_public: emptyToNull(form.emailPublic),
    website: emptyToNull(form.website),
    linkedin: emptyToNull(form.linkedin),
    address: emptyToNull(form.address),
    map_url: emptyToNull(form.mapUrl),
    photo_url: emptyToNull(form.photoUrl),
    company_logo_url: emptyToNull(form.companyLogoUrl),
    is_active: form.isActive,
    is_published: form.isPublished,
  };
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
