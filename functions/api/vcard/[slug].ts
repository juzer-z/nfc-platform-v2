type Env = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

type ProfileResponse = {
  slug: string;
  full_name: string;
  title: string | null;
  company: string | null;
  phone: string | null;
  whatsapp: string | null;
  email_public: string | null;
  website: string | null;
  linkedin: string | null;
  address: string | null;
  photo_url: string | null;
  is_active: boolean;
  is_published: boolean;
};

export const onRequestGet: PagesFunction<Env> = async ({ env, params, request }) => {
  const slug = typeof params.slug === "string" ? params.slug : "";
  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response("Supabase env is missing", { status: 500 });
  }

  const url = new URL(`${supabaseUrl}/rest/v1/profiles`);
  url.searchParams.set("select", [
    "slug",
    "full_name",
    "title",
    "company",
    "phone",
    "whatsapp",
    "email_public",
    "website",
    "linkedin",
    "address",
    "photo_url",
    "is_active",
    "is_published",
  ].join(","));
  url.searchParams.set("slug", `eq.${slug}`);
  url.searchParams.set("is_active", "eq.true");
  url.searchParams.set("is_published", "eq.true");
  url.searchParams.set("limit", "1");

  const supabaseResponse = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
    },
  });

  if (!supabaseResponse.ok) {
    return new Response("Could not load profile", { status: 502 });
  }

  const [profile] = (await supabaseResponse.json()) as ProfileResponse[];
  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  const baseUrl = new URL(request.url).origin;
  const vcf = buildVCard(profile, baseUrl);

  return new Response(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${profile.slug}.vcf"`,
      "Cache-Control": "no-store",
    },
  });
};

function buildVCard(profile: ProfileResponse, baseUrl: string) {
  const fullName = profile.full_name || "";
  const org = profile.company || "";
  const title = profile.title || "";
  const phone = profile.phone || "";
  const whatsapp = profile.whatsapp || "";
  const email = profile.email_public || "";
  const website = profile.website || "";
  const linkedin = profile.linkedin || "";
  const address = profile.address || "";
  const photoUrl = profile.photo_url || "";
  const { firstName, lastName } = splitName(fullName);

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(lastName)};${esc(firstName)};;;`,
    `FN:${esc(fullName)}`,
    org ? `ORG:${esc(org)}` : "",
    title ? `TITLE:${esc(title)}` : "",
    phone ? `TEL;TYPE=CELL:${esc(phone)}` : "",
    whatsapp ? `TEL;TYPE=CELL,VOICE:${esc(whatsapp)}` : "",
    email ? `EMAIL;TYPE=INTERNET:${esc(email)}` : "",
    website ? `URL:${esc(normalizeUrl(website, baseUrl))}` : "",
    linkedin ? `X-SOCIALPROFILE;type=linkedin:${esc(normalizeUrl(linkedin, baseUrl))}` : "",
    address ? `ADR;TYPE=WORK:;;${esc(address)};;;;` : "",
    photoUrl ? `PHOTO;VALUE=URI:${esc(normalizeUrl(photoUrl, baseUrl))}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  };
}

function normalizeUrl(value: string, baseUrl: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${baseUrl}${value}`;
  return `https://${value}`;
}

function esc(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
