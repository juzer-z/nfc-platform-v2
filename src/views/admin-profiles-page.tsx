import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StatusCard } from "@/components/status-card";
import { useAdminSession } from "@/hooks/use-admin-session";
import { listProfiles } from "@/lib/supabase-profiles";
import { supabase } from "@/lib/supabase";
import type { ProfileRecord } from "@/lib/types";

const PAGE_SIZE = 50;

export function AdminProfilesPage() {
  const navigate = useNavigate();
  const { configured, loading: sessionLoading, session } = useAdminSession();
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading) return;
    if (configured && !session) {
      navigate("/admin/login");
    }
  }, [configured, navigate, session, sessionLoading]);

  useEffect(() => {
    if (!configured || !session) {
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    setError("");

    const timer = window.setTimeout(async () => {
      const { data, error: requestError, count } = await listProfiles({
        query,
        page,
        pageSize: PAGE_SIZE,
      });
      if (ignore) return;
      if (requestError) {
        setError(requestError.message);
      } else {
        setProfiles(data ?? []);
        setTotalCount(count ?? 0);
      }
      setLoading(false);
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [configured, page, query, session]);

  const filteredCountLabel = useMemo(() => {
    if (!query.trim()) return `${totalCount} total`;
    return `${totalCount} match${totalCount === 1 ? "" : "es"}`;
  }, [query, totalCount]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = totalCount === 0 ? 0 : Math.min(page * PAGE_SIZE, totalCount);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10">
        <StatusCard
          title="Supabase env missing"
          body="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in app/.env before using admin CRUD."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-cyan-300/75">
            Admin
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Profiles
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Search and manage published business card profiles in Supabase.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/profiles/new"
            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            New profile
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-semibold text-white transition hover:bg-white/12"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search name, phone, company, email, slug..."
          className="w-full rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/60"
        />
        <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/70">
          {filteredCountLabel}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/6 shadow-[0_30px_90px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/6 text-left text-xs uppercase tracking-[0.18em] text-white/45">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Active</th>
                <th className="px-5 py-4">Published</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || sessionLoading ? (
                <tr>
                  <td className="px-5 py-6 text-white/60" colSpan={7}>
                    Loading profiles...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-white/60" colSpan={7}>
                    {query.trim()
                      ? `No profiles match "${query}".`
                      : "No profiles yet. Create your first profile."}
                  </td>
                </tr>
              ) : (
                profiles.map((profile, index) => (
                  <tr key={profile.id} className="border-t border-white/8 text-sm text-white/80">
                    <td className="px-5 py-4 text-white/50">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">{profile.full_name}</td>
                    <td className="px-5 py-4 text-white/60">/u/{profile.slug}</td>
                    <td className="px-5 py-4 whitespace-normal break-words">
                      {profile.company ?? "—"}
                    </td>
                    <td className="px-5 py-4">{profile.is_active ? "Yes" : "No"}</td>
                    <td className="px-5 py-4">{profile.is_published ? "Yes" : "No"}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <Link
                          to={`/admin/profiles/${profile.id}`}
                          className="text-blue-300 underline underline-offset-4"
                        >
                          Edit
                        </Link>
                        <a
                          href={`/u/${profile.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-300 underline underline-offset-4"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
        <div>
          Showing {pageStart}-{pageEnd} of {totalCount}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-xl border border-white/10 bg-white/6 px-4 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-2 text-white/75">
            Page {page} of {totalPages}
          </div>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-xl border border-white/10 bg-white/6 px-4 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
