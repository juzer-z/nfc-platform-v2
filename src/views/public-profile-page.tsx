import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PublicProfileCard } from "@/components/public-profile-card";
import { PublicProfileCardSkeleton } from "@/components/public-profile-card-skeleton";
import { StatusCard } from "@/components/status-card";
import { hasSupabaseConfig } from "@/lib/env";
import { mapProfile, type PublicProfile } from "@/lib/profile-mappers";
import { supabase } from "@/lib/supabase";

const PROFILE_CACHE_TTL_MS = 1000 * 60 * 5;

function getProfileCacheKey(slug: string) {
  return `public-profile-cache:${slug}`;
}

const demoProfile: PublicProfile = {
  id: "demo",
  slug: "demo-profile",
  fullName: "Juzer Zulfikar Ali",
  title: "Technical Director",
  company: "Ezzy Group",
  department: "Engineering",
  phone: "+8801755503943",
  whatsapp: "+8801755503943",
  emailPublic: "juzerzulfikar@ezzy.group",
  website: "ezzygroup.net",
  linkedin: "https://www.linkedin.com/in/juzerzulfiqarali/",
  address: "Gulshan, Dhaka",
  mapUrl: "https://maps.google.com/",
  photoUrl: null,
  companyLogoUrl: null,
  isPublished: true,
  isActive: true,
};

export function PublicProfilePage() {
  const { slug = "" } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(() => {
    if (typeof window === "undefined" || !slug) return null;

    try {
      const raw = window.sessionStorage.getItem(getProfileCacheKey(slug));
      if (!raw) return null;
      const cached = JSON.parse(raw) as { profile: PublicProfile; savedAt: number };
      if (Date.now() - cached.savedAt > PROFILE_CACHE_TTL_MS) {
        window.sessionStorage.removeItem(getProfileCacheKey(slug));
        return null;
      }
      return cached.profile;
    } catch {
      return null;
    }
  });
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">(
    profile ? "ready" : "loading"
  );

  const fallbackProfile = useMemo(
    () => (slug === demoProfile.slug || !slug ? demoProfile : null),
    [slug]
  );

  useEffect(() => {
    let ignore = false;

    if (profile) {
      setState("ready");
    }

    async function loadProfile() {
      if (!slug) {
        setProfile(demoProfile);
        setState("ready");
        return;
      }

      if (!hasSupabaseConfig()) {
        setProfile(fallbackProfile);
        setState(fallbackProfile ? "ready" : "error");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .eq("is_published", true)
        .maybeSingle();

      if (ignore) return;

      if (error) {
        setState("error");
        return;
      }

      if (!data) {
        setState("missing");
        return;
      }

      const mappedProfile = mapProfile(data);
      setProfile(mappedProfile);
      setState("ready");

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            getProfileCacheKey(slug),
            JSON.stringify({
              profile: mappedProfile,
              savedAt: Date.now(),
            })
          );
        } catch {
          // Ignore sessionStorage errors.
        }
      }
    }

    void loadProfile();
    return () => {
      ignore = true;
    };
  }, [fallbackProfile, slug]);

  useEffect(() => {
    if (state !== "ready" || !profile || !hasSupabaseConfig()) return;

    const controller = new AbortController();

    fetch("/api/profile-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id }),
      signal: controller.signal,
    }).catch(() => {
      // View tracking is best-effort only.
    });

    return () => controller.abort();
  }, [profile, state]);

  useEffect(() => {
    if (state !== "ready" || !profile) return;

    const role = [profile.title, profile.company].filter(Boolean).join(" at ");
    const title = `${profile.fullName}${role ? ` — ${role}` : ""} | 1card.fyi`;
    const description = `View ${profile.fullName}'s digital business card${
      role ? ` — ${role}` : ""
    }.`;

    document.title = title;
    setMetaContent("description", description);
    setMetaContent("og:title", title, "property");
    setMetaContent("og:description", description, "property");

    return () => {
      document.title = "1card.fyi";
    };
  }, [profile, state]);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[#050A14]" />
      <div className="absolute -left-44 -top-44 h-[560px] w-[560px] rounded-full bg-blue-500/18 blur-3xl" />
      <div className="absolute -bottom-52 -right-52 h-[620px] w-[620px] rounded-full bg-cyan-400/14 blur-3xl" />
      <div className="relative flex min-h-screen items-center justify-center">
        {state === "ready" && profile ? (
          <PublicProfileCard profile={profile} />
        ) : state === "missing" ? (
          <StatusCard
            title="Profile not found"
            body="We couldn't find an active published profile for that slug yet."
          />
        ) : state === "error" ? (
          <StatusCard
            title="Supabase not configured yet"
            body="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to start loading real profiles."
          />
        ) : (
          <PublicProfileCardSkeleton />
        )}
      </div>
    </div>
  );
}

function setMetaContent(
  key: string,
  content: string,
  attribute: "name" | "property" = "name"
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}
