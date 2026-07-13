import type { ProfileRecord } from "./types";

export type PublicProfile = {
  id: string;
  slug: string;
  fullName: string;
  title: string | null;
  company: string | null;
  department: string | null;
  phone: string | null;
  whatsapp: string | null;
  emailPublic: string | null;
  website: string | null;
  linkedin: string | null;
  address: string | null;
  mapUrl: string | null;
  photoUrl: string | null;
  companyLogoUrl: string | null;
  isPublished: boolean;
  isActive: boolean;
};

export function mapProfile(record: ProfileRecord): PublicProfile {
  return {
    id: record.id,
    slug: record.slug,
    fullName: record.full_name,
    title: record.title,
    company: record.company,
    department: record.department,
    phone: record.phone,
    whatsapp: record.whatsapp,
    emailPublic: record.email_public,
    website: record.website,
    linkedin: record.linkedin,
    address: record.address,
    mapUrl: record.map_url,
    photoUrl: record.photo_url,
    companyLogoUrl: record.company_logo_url,
    isPublished: record.is_published,
    isActive: record.is_active,
  };
}
