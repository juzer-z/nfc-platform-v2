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

export function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function normalizePhoneLike(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  return `${hasLeadingPlus ? "+" : ""}${digits}`;
}

export function isValidEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isValidSlug(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed.toLowerCase());
}

export function getNormalizedProfileForm(
  form: ProfileFormValues
): ProfileFormValues {
  return {
    ...form,
    slug: form.slug.trim().toLowerCase(),
    emailPublic: form.emailPublic.trim(),
    website: normalizeWebsite(form.website),
    phone: normalizePhoneLike(form.phone),
    whatsapp: normalizePhoneLike(form.whatsapp),
  };
}

export function buildProfilePayload(form: ProfileFormValues) {
  const normalizedForm = getNormalizedProfileForm(form);
  const fullName = normalizedForm.fullName.trim();

  return {
    full_name: fullName,
    slug: (normalizedForm.slug.trim() || slugify(fullName) || "user").toLowerCase(),
    title: emptyToNull(normalizedForm.title),
    company: emptyToNull(normalizedForm.company),
    department: emptyToNull(normalizedForm.department),
    phone: emptyToNull(normalizedForm.phone),
    whatsapp: emptyToNull(normalizedForm.whatsapp),
    email_public: emptyToNull(normalizedForm.emailPublic),
    website: emptyToNull(normalizedForm.website),
    linkedin: emptyToNull(normalizedForm.linkedin),
    address: emptyToNull(normalizedForm.address),
    map_url: emptyToNull(normalizedForm.mapUrl),
    photo_url: emptyToNull(normalizedForm.photoUrl),
    company_logo_url: emptyToNull(normalizedForm.companyLogoUrl),
    is_active: normalizedForm.isActive,
    is_published: normalizedForm.isPublished,
  };
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
