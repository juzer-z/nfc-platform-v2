type Env = {
  IMAGEKIT_PRIVATE_KEY: string;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const privateKey = context.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    return json(
      { error: "Missing IMAGEKIT_PRIVATE_KEY Pages env." },
      { status: 500 }
    );
  }

  const token = crypto.randomUUID().replace(/-/g, "");
  const expire = Math.floor(Date.now() / 1000) + 60 * 5;
  const signature = await hmacSha1(`${token}${expire}`, privateKey);

  return json(
    {
      token,
      expire,
      signature,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
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

async function hmacSha1(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-1",
    },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
