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
          <div className="admin-section-kicker">Admin</div>
          <h1 className="mt-3 text-[2.35rem] font-semibold tracking-[-0.04em] text-white">
            Profiles
          </h1>
          <p className="mt-2 text-sm text-white/48">
            Search, review, and manage your live business card directory.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/profiles/new"
            className="brand-primary-btn rounded-2xl px-5 py-3 font-semibold transition"
          >
            New Profile
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
          placeholder="Search name, company, phone, email, or slug..."
          className="w-full rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-cyan-300/45"
        />
        <div className="brand-pill rounded-2xl px-4 py-3 text-sm">
          {filteredCountLabel}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="brand-panel mt-6 overflow-hidden rounded-[28px]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/6 text-left text-[11px] uppercase tracking-[0.18em] text-white/42">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Profile</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Updated</th>
                <th className="px-4 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || sessionLoading ? (
                <tr>
                  <td className="px-4 py-6 text-white/60" colSpan={6}>
                    Loading profiles...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-white/60" colSpan={6}>
                    {query.trim()
                      ? `No profiles match "${query}".`
                      : "No profiles yet. Create your first profile."}
                  </td>
                </tr>
              ) : (
                profiles.map((profile, index) => (
                  <tr
                    key={profile.id}
                    className="border-t border-white/8 text-sm text-white/80"
                  >
                    <td className="px-4 py-3.5 text-white/42">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">
                        {profile.full_name}
                      </div>
                      <div className="mt-1 text-xs text-white/42">
                        /u/{profile.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="whitespace-normal break-words font-medium text-white/82">
                        {profile.company ?? "—"}
                      </div>
                      <div className="mt-1 text-xs text-white/40">
                        {profile.title ?? "No title"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusChip
                        status={getProfileStatus(
                          profile.is_active,
                          profile.is_published
                        )}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-white/52">
                      {formatTableDate(profile.updated_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-3 text-sm">
                        <Link
                          to={`/admin/profiles/${profile.id}`}
                          className="text-cyan-200 underline underline-offset-4"
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

      <div className="mt-4 flex flex-col gap-3 text-sm text-white/58 md:flex-row md:items-center md:justify-between">
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

function getProfileStatus(isActive: boolean, isPublished: boolean) {
  if (!isActive) return "Hidden" as const;
  if (!isPublished) return "Draft" as const;
  return "Active" as const;
}

function StatusChip({ status }: { status: "Active" | "Draft" | "Hidden" }) {
  const toneClass =
    status === "Active"
      ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-200"
      : status === "Draft"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
        : "border-white/12 bg-white/8 text-white/68";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      {status}
    </span>
  );
}

function formatTableDate(value: string) {
  try {
    return new Date(value).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}
