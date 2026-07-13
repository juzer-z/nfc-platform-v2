import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl rounded-[32px] border border-white/10 bg-white/6 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_0.9fr] md:items-end">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
              Migration Preview
            </div>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-6xl">
              1card.fyi on Vite, Supabase, ImageKit, and Cloudflare Pages.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              This new app is the migration target for the existing NFC business card platform.
              Public profiles come first, then admin flows, media uploads, and vCard export.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/u/demo-profile"
                className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Preview Public Card
              </Link>
              <Link
                to="/admin/login"
                className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-semibold text-white transition hover:bg-white/12"
              >
                Open Admin Shell
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6">
            <div className="text-sm text-white/55">Current migration scope</div>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>Public profile route migrated into React Router</li>
              <li>Supabase client and DB shape scaffolded</li>
              <li>ImageKit client scaffolded for upload migration</li>
              <li>Admin routes stubbed for the next pass</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
