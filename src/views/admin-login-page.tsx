import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { hasSupabaseConfig } from "@/lib/env";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { supabase } from "@/lib/supabase";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { canAccess, configured, loading: accessLoading } = useAdminAccess();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (configured && !accessLoading && canAccess) {
      navigate("/admin/profiles", { replace: true });
    }
  }, [accessLoading, canAccess, configured, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!hasSupabaseConfig()) {
      setError("Configure Supabase auth keys before using admin login.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    navigate("/admin/profiles");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/8 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
      >
        <div className="text-center">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300/75">Admin</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
            Sign in
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            This version uses Supabase Auth instead of custom JWT cookies.
          </p>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-white/65">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-blue-400/60"
              placeholder="admin@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-white/65">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-blue-400/60"
              placeholder="Enter password"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
