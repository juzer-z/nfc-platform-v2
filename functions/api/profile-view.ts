type Env = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

type ProfileViewPayload = {
  profileId?: string;
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = (await request.json().catch(() => ({}))) as ProfileViewPayload;
  if (!body.profileId) {
    return json({ error: "Missing profileId" }, { status: 400 });
  }

  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Supabase env is missing" }, { status: 500 });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/profile_views`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      profile_id: body.profileId,
      ip_address: request.headers.get("cf-connecting-ip"),
      user_agent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
    }),
  });

  if (!response.ok) {
    return json({ error: "Could not record profile view" }, { status: 502 });
  }

  return json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
};

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}
