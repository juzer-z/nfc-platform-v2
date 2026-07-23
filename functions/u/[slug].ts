type Env = {
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

type ProfilePreview = {
  slug: string;
  full_name: string;
  title: string | null;
  company: string | null;
  photo_url: string | null;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  let response = await context.next();

  const slug = String(context.params.slug ?? "").trim().toLowerCase();
  if (!slug) return response;

  const profile = await getPublishedProfile(context.env, slug);
  if (!profile) return response;

  const url = new URL(context.request.url);
  const contentType = response.headers.get("content-type") ?? "";
  if ((!response.ok || !contentType.includes("text/html")) && context.env.ASSETS) {
    response = await context.env.ASSETS.fetch(
      new Request(new URL("/", url), context.request)
    );
  }
  if (!response.ok || !(response.headers.get("content-type") ?? "").includes("text/html")) {
    return response;
  }

  const canonicalUrl = `${url.origin}/u/${encodeURIComponent(profile.slug)}`;
  const title = buildTitle(profile);
  const description = buildDescription(profile);
  const metadata = buildMetadata({
    title,
    description,
    canonicalUrl,
    imageUrl: profile.photo_url,
  });

  const html = (await response.text())
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(
      /<meta\s+name=["']description["'][^>]*>\s*/i,
      ""
    );
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=0, s-maxage=300");
  headers.delete("Content-Length");

  return new Response(html.replace("</head>", `${metadata}\n  </head>`), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

async function getPublishedProfile(env: Env, slug: string) {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const query = new URLSearchParams({
    select: "slug,full_name,title,company,photo_url",
    slug: `eq.${slug}`,
    is_active: "eq.true",
    is_published: "eq.true",
    limit: "1",
  });

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/profiles?${query.toString()}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );
    if (!response.ok) return null;

    const profiles = (await response.json()) as ProfilePreview[];
    return profiles[0] ?? null;
  } catch {
    return null;
  }
}

function buildTitle(profile: ProfilePreview) {
  const role = [profile.title, profile.company].filter(Boolean).join(" at ");
  return `${profile.full_name}${role ? ` — ${role}` : ""} | 1card.fyi`;
}

function buildDescription(profile: ProfilePreview) {
  const role = [profile.title, profile.company].filter(Boolean).join(" at ");
  return `View ${profile.full_name}'s digital business card${role ? ` — ${role}` : ""}.`;
}

function buildMetadata({
  title,
  description,
  canonicalUrl,
  imageUrl,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string | null;
}) {
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="1card.fyi" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ];

  if (imageUrl) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
      `<meta property="og:image:alt" content="${escapeHtml(title)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`
    );
  }

  return tags.map((tag) => `    ${tag}`).join("\n");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
