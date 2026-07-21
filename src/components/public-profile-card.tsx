import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { PublicProfile } from "@/lib/profile-mappers";

type Row = {
  label: string;
  value: string;
  href?: string;
  icon: ReactNode;
};

export function PublicProfileCard({ profile }: { profile: PublicProfile }) {
  const [shareLabel, setShareLabel] = useState("Share");
  const rows: Row[] = [
    {
      label: "Email",
      value: profile.emailPublic || "",
      href: profile.emailPublic ? `mailto:${profile.emailPublic}` : undefined,
      icon: <Mail size={18} />,
    },
    {
      label: "Website",
      value: profile.website || "",
      href: profile.website ? normalizeUrl(profile.website) : undefined,
      icon: <Globe size={18} />,
    },
    {
      label: "Phone",
      value: profile.phone || "",
      href: profile.phone ? `tel:${profile.phone}` : undefined,
      icon: <Phone size={18} />,
    },
    {
      label: "WhatsApp",
      value: profile.whatsapp ? "Message me" : "",
      href: profile.whatsapp
        ? `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`
        : undefined,
      icon: <MessageCircle size={18} />,
    },
    {
      label: "Address",
      value: profile.address || "",
      href: profile.mapUrl ? normalizeUrl(profile.mapUrl) : undefined,
      icon: <MapPin size={18} />,
    },
    {
      label: "LinkedIn",
      value: profile.linkedin || "",
      href: profile.linkedin ? normalizeUrl(profile.linkedin) : undefined,
      icon: <Linkedin size={18} />,
    },
  ].filter((row) => row.value.trim());

  return (
    <div className="w-full max-w-[470px] rounded-[30px] border border-white/10 bg-white/6 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-[82px] w-[82px] shrink-0 overflow-hidden rounded-[22px] border border-white/12 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.28)] sm:h-[92px] sm:w-[92px]">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white/90">
              {profile.fullName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-1 sm:pt-2">
          <div className="text-[24px] font-semibold leading-[1.08] tracking-[-0.02em] text-white [overflow-wrap:anywhere] sm:text-[28px]">
            {profile.fullName}
          </div>
          <div className="mt-2 text-[13px] leading-snug text-white/70 sm:text-[14px]">
            {profile.title ? <div className="whitespace-normal break-words">{profile.title}</div> : null}
            {profile.company ? <div className="whitespace-normal break-words">{profile.company}</div> : null}
          </div>
        </div>

        {profile.companyLogoUrl ? (
          <div className="shrink-0 pt-1 sm:pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/20 bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:h-16 sm:w-16">
              <img
                src={profile.companyLogoUrl}
                alt="Company logo"
                className="max-h-full max-w-full rounded object-contain"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <a
          href={buildVCardLink(profile.slug)}
          download
          className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Save Contact
        </a>
        <button
          type="button"
          onClick={() => void handleShare(profile, setShareLabel)}
          className="rounded-xl border border-white/12 bg-white/10 px-4 py-3 text-center font-semibold text-white transition hover:bg-white/14"
        >
          {shareLabel}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <a
            key={row.label}
            href={row.href}
            target={row.href?.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/5 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/9"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/6 text-white/85">
                {row.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] tracking-wide text-white/60">
                  {row.label.toUpperCase()}
                </div>
                <div className="whitespace-normal break-words text-[14px] font-semibold leading-snug text-white/92">
                  {row.value}
                </div>
              </div>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/6 text-white/70">
              <ArrowUpRight size={18} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function normalizeUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function buildVCardLink(slug: string) {
  return `/api/vcard/${slug}`;
}

async function handleShare(
  profile: PublicProfile,
  setShareLabel: (label: string) => void
) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : `/u/${profile.slug}`;
  const shareData = {
    title: profile.fullName,
    text: `${profile.fullName}${profile.company ? ` · ${profile.company}` : ""}`,
    url: shareUrl,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setShareLabel("Copied");
    window.setTimeout(() => setShareLabel("Share"), 1800);
  } catch {
    setShareLabel("Copy failed");
    window.setTimeout(() => setShareLabel("Share"), 1800);
  }
}
