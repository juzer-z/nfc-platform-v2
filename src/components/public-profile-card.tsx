import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Copy,
  Download,
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
  helper?: string;
  href?: string;
  icon: ReactNode;
};

export function PublicProfileCard({ profile }: { profile: PublicProfile }) {
  const [shareLabel, setShareLabel] = useState("Share");
  const [copyLabel, setCopyLabel] = useState("Copy Link");
  const rows: Row[] = [
    {
      label: "Email",
      value: profile.emailPublic || "",
      href: profile.emailPublic ? `mailto:${profile.emailPublic}` : undefined,
      icon: <Mail size={18} />,
    },
    {
      label: "Website",
      value: profile.website ? getCleanDomain(profile.website) : "",
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
      value: profile.mapUrl ? "Open map" : profile.address || "",
      helper: profile.mapUrl ? profile.address || undefined : undefined,
      href: profile.mapUrl ? normalizeUrl(profile.mapUrl) : undefined,
      icon: <MapPin size={18} />,
    },
    {
      label: "LinkedIn",
      value: profile.linkedin ? getLinkedInLabel(profile.linkedin) : "",
      href: profile.linkedin ? normalizeUrl(profile.linkedin) : undefined,
      icon: <Linkedin size={18} />,
    },
  ].filter((row) => row.value.trim());

  return (
    <div className="motion-scale-in w-full max-w-[470px] rounded-[30px] border border-white/10 bg-white/6 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-[82px] w-[82px] shrink-0 overflow-hidden rounded-[22px] border border-white/12 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.28)] sm:h-[92px] sm:w-[92px]">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#4fd7f8_0%,#27406b_38%,#0d1422_100%)] text-[24px] font-semibold tracking-[-0.04em] text-white/95 sm:text-[28px]">
              <div className="absolute inset-[10px] rounded-[18px] border border-white/10" />
              <div className="absolute -top-5 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-xl" />
              <span className="relative">{getInitials(profile.fullName)}</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-1 sm:pt-2">
          <div className="text-[24px] font-semibold leading-[1.08] tracking-[-0.02em] text-white [overflow-wrap:anywhere] sm:text-[28px]">
            {profile.fullName}
          </div>
          <div className="mt-2 text-[13px] leading-snug text-white/70 sm:text-[14px]">
            {profile.title ? (
              <div className="whitespace-normal break-words">{profile.title}</div>
            ) : null}
            {profile.company ? (
              <div className="whitespace-normal break-words">{profile.company}</div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 pt-1 sm:pt-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/20 bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:h-16 sm:w-16">
            {profile.companyLogoUrl ? (
              <img
                src={profile.companyLogoUrl}
                alt="Company logo"
                className="max-h-full max-w-full rounded object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,#f8fbff_0%,#dfe8f4_100%)] text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                {getCompanyMark(profile.company)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <a
          href={buildVCardLink(profile.slug)}
          download
          className="brand-primary-btn rounded-xl px-4 py-3 text-center font-semibold transition"
        >
          Save Contact
        </a>
        <button
          type="button"
          onClick={() => void handleShare(profile, setShareLabel)}
          className="brand-outline-btn rounded-xl px-4 py-3 text-center font-semibold text-white transition"
        >
          {shareLabel}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-white/48">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/70">
            <Download size={11} />
          </span>
          Opens your phone&apos;s contact save screen
        </div>
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
                {row.helper ? (
                  <div className="mt-1 whitespace-normal break-words text-[12px] leading-snug text-white/50">
                    {row.helper}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/6 text-white/70">
              <ArrowUpRight size={18} />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-sm text-white/45">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Tap NFC to open
        </div>
        <button
          type="button"
          onClick={() => void handleCopyLink(profile.slug, setCopyLabel)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-white/72 transition hover:bg-white/10"
        >
          <Copy size={14} />
          {copyLabel}
        </button>
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

function getInitials(fullName: string) {
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "1C";
}

function getCompanyMark(company: string | null) {
  if (!company) return "BR";
  const initials = company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "BR";
}

function getCleanDomain(value: string) {
  try {
    const normalized = normalizeUrl(value);
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return value.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

function getLinkedInLabel(value: string) {
  try {
    const normalized = normalizeUrl(value);
    const url = new URL(normalized);
    const pathname = url.pathname.replace(/\/+$/, "");
    const slug = pathname.split("/").filter(Boolean).pop();
    return slug ? `LinkedIn / ${slug}` : "LinkedIn profile";
  } catch {
    return "LinkedIn profile";
  }
}

async function handleShare(
  profile: PublicProfile,
  setShareLabel: (label: string) => void
) {
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : `/u/${profile.slug}`;
  const shareData = {
    title: profile.fullName,
    text: `${profile.fullName}${profile.company ? ` • ${profile.company}` : ""}`,
    url: shareUrl,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      setShareLabel("Shared");
      window.setTimeout(() => setShareLabel("Share"), 1800);
      return;
    }

    await copyText(shareUrl);
    setShareLabel("Copied");
    window.setTimeout(() => setShareLabel("Share"), 1800);
  } catch {
    setShareLabel("Copy failed");
    window.setTimeout(() => setShareLabel("Share"), 1800);
  }
}

async function handleCopyLink(
  slug: string,
  setCopyLabel: (label: string) => void
) {
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : `/u/${slug}`;

  try {
    await copyText(shareUrl);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy Link"), 1800);
  } catch {
    setCopyLabel("Copy failed");
    window.setTimeout(() => setCopyLabel("Copy Link"), 1800);
  }
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "true");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();

  const successful = document.execCommand("copy");
  document.body.removeChild(input);

  if (!successful) {
    throw new Error("Copy failed");
  }
}
