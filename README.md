# 1card.fyi App Migration

This `app/` folder is the new migration target for the NFC business card platform.

## Target Stack

- Vite
- React
- TypeScript
- Tailwind CSS 4
- Supabase
- ImageKit
- Cloudflare Pages

## Current Status

- Public profile route scaffolded at `/u/:slug`
- Admin auth shell scaffolded at `/admin/login`
- Admin profiles shell scaffolded at `/admin/profiles`
- Supabase client and DB types added
- ImageKit signed upload wired
- Cloudflare vCard function wired

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
VITE_IMAGEKIT_URL_ENDPOINT=""
VITE_IMAGEKIT_PUBLIC_KEY=""
VITE_APP_URL="http://localhost:5173"
IMAGEKIT_PRIVATE_KEY=""
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
```

## Recommended Next Steps

1. Create Supabase tables and policies from `docs/SUPABASE_SETUP.md`
2. Wire profile loading against the real `profiles` table
3. Add Supabase Auth login protection to admin routes
4. Add ImageKit auth/upload flow
5. Deploy to Cloudflare Pages

## Upload Flow

- The admin form now supports signed ImageKit uploads
- Upload signing is provided by `functions/api/imagekit-auth.ts`
- Set `IMAGEKIT_PRIVATE_KEY` in Cloudflare Pages environment variables
- Keep `VITE_IMAGEKIT_PUBLIC_KEY` and `VITE_IMAGEKIT_URL_ENDPOINT` in frontend env

## vCard Flow

- The public profile card downloads contacts from `functions/api/vcard/[slug].ts`
- The function reads public profile data from Supabase REST
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Cloudflare Pages env

## Exact Setup Order

Follow [docs/DEPLOYMENT_CHECKLIST.md](C:/Users/user/nfc-platform/app/docs/DEPLOYMENT_CHECKLIST.md) for the exact Supabase SQL, admin-role setup, ImageKit keys, and Cloudflare Pages env configuration.
