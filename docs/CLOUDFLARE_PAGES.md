# Cloudflare Pages Deployment

## Build Settings

- Framework preset: `Vite`
- Build command:

```bash
npm run build
```

- Build output directory:

```text
dist
```

## Environment Variables

Add these in Cloudflare Pages:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_IMAGEKIT_URL_ENDPOINT`
- `VITE_IMAGEKIT_PUBLIC_KEY`
- `VITE_APP_URL`
- `IMAGEKIT_PRIVATE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Routing

This app includes `public/_redirects`:

```text
/* /index.html 200
```

That keeps React Router paths such as `/u/juzer-zulfikar-ali` and `/admin/login` working after direct refreshes.

## Notes

- For vCard downloads, either:
  - use the included Cloudflare Pages Function at `functions/api/vcard/[slug].ts`, or
  - swap to a Supabase Edge Function later
- For secure ImageKit uploads, do not expose private signing keys in the frontend
- This app includes a Pages Function at `functions/api/imagekit-auth.ts` for upload signatures
