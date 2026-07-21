import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { uploadImageToImageKit } from "@/lib/imagekit-upload";
import {
  buildProfilePayload,
  getNormalizedProfileForm,
  isValidEmail,
  isValidSlug,
  normalizePhoneLike,
  normalizeWebsite,
  slugify,
  type ProfileFormValues,
} from "@/lib/profile-form";
import {
  checkSlugAvailability,
  findPotentialDuplicates,
  type ProfileDuplicateCandidate,
} from "@/lib/supabase-profiles";

type Props = {
  form: ProfileFormValues;
  profileId?: string;
  mode: "create" | "edit";
  saving: boolean;
  deleting?: boolean;
  message?: string;
  draftStatus?: {
    state: "idle" | "saving" | "saved";
    text: string;
  };
  onChange: <K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K]
  ) => void;
  onSubmit: (nextForm?: ProfileFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function AdminProfileForm({
  form,
  profileId,
  mode,
  saving,
  deleting = false,
  message,
  draftStatus,
  onChange,
  onSubmit,
  onDelete,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [deletingNow, setDeletingNow] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [slugStatus, setSlugStatus] = useState<{
    state: "idle" | "checking" | "available" | "taken";
    text: string;
  }>({
    state: "idle",
    text: "",
  });
  const [duplicateMatches, setDuplicateMatches] = useState<ProfileDuplicateCandidate[]>([]);
  const [validationMessage, setValidationMessage] = useState("");

  const suggestedSlug = useMemo(() => {
    return form.slug.trim() || slugify(form.fullName) || "your-slug";
  }, [form.fullName, form.slug]);

  const normalizedForm = useMemo(() => getNormalizedProfileForm(form), [form]);
  const normalizedSlug = normalizedForm.slug.trim() || slugify(normalizedForm.fullName);
  const emailError = !isValidEmail(normalizedForm.emailPublic)
    ? "Enter a valid email address."
    : "";
  const slugError = normalizedForm.slug.trim() && !isValidSlug(normalizedForm.slug)
    ? "Use lowercase letters, numbers, and hyphens only."
    : "";
  const phoneError =
    normalizedForm.phone.trim() &&
    normalizedForm.phone.trim().replace(/\D/g, "").length < 7
      ? "Phone number looks too short."
      : "";
  const whatsappError =
    normalizedForm.whatsapp.trim() &&
    normalizedForm.whatsapp.trim().replace(/\D/g, "").length < 7
      ? "WhatsApp number looks too short."
      : "";

  const publicUrl = `/u/${suggestedSlug}`;
  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/60";

  const payloadPreview = buildProfilePayload(form);

  useEffect(() => {
    if (slugError) {
      setSlugStatus({
        state: "taken",
        text: slugError,
      });
      return;
    }

    if (!normalizedSlug) {
      setSlugStatus({
        state: "idle",
        text: "",
      });
      return;
    }

    let ignore = false;
    setSlugStatus({
      state: "checking",
      text: "Checking slug...",
    });

    const timer = window.setTimeout(async () => {
      const { available, error } = await checkSlugAvailability(normalizedSlug, profileId);
      if (ignore) return;

      if (error) {
        setSlugStatus({
          state: "idle",
          text: "",
        });
        return;
      }

      setSlugStatus(
        available
          ? { state: "available", text: "Slug is available." }
          : { state: "taken", text: "This slug is already in use." }
      );
    }, 350);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [normalizedSlug, profileId, slugError]);

  useEffect(() => {
    const trimmedName = normalizedForm.fullName.trim();
    if (!trimmedName && !normalizedSlug) {
      setDuplicateMatches([]);
      return;
    }

    let ignore = false;

    const timer = window.setTimeout(async () => {
      const { data, error } = await findPotentialDuplicates({
        slug: normalizedSlug,
        fullName: trimmedName,
        excludeId: profileId,
      });

      if (ignore || error) return;

      const matches = (data ?? []).filter((candidate) => {
        const sameSlug = normalizedSlug && candidate.slug.toLowerCase() === normalizedSlug.toLowerCase();
        const sameName =
          trimmedName &&
          candidate.full_name.trim().toLowerCase() === trimmedName.toLowerCase();
        const similarSlug =
          normalizedSlug &&
          candidate.slug.toLowerCase().includes(normalizedSlug.toLowerCase());
        const similarName =
          trimmedName &&
          candidate.full_name.toLowerCase().includes(trimmedName.toLowerCase());

        return sameSlug || sameName || similarSlug || similarName;
      });

      setDuplicateMatches(matches);
    }, 350);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [normalizedForm.fullName, normalizedSlug, profileId]);

  const hasBlockingValidation =
    !normalizedForm.fullName.trim() ||
    Boolean(emailError) ||
    Boolean(slugError) ||
    Boolean(phoneError) ||
    Boolean(whatsappError) ||
    slugStatus.state === "taken";

  function normalizeField<K extends keyof ProfileFormValues>(
    key: K,
    normalizer: (value: string) => string
  ) {
    const currentValue = form[key];
    if (typeof currentValue !== "string") return;
    const nextValue = normalizer(currentValue) as ProfileFormValues[K];
    if (nextValue !== currentValue) {
      onChange(key, nextValue);
    }
  }

  async function submitForm() {
    const candidateForm = getNormalizedProfileForm(form);
    const candidateSlug = candidateForm.slug.trim() || slugify(candidateForm.fullName);

    if (!candidateForm.fullName.trim()) {
      setValidationMessage("Full name is required.");
      return;
    }

    if (!isValidEmail(candidateForm.emailPublic)) {
      setValidationMessage("Please enter a valid public email address.");
      return;
    }

    if (candidateForm.slug.trim() && !isValidSlug(candidateForm.slug)) {
      setValidationMessage("Slug can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    if (
      candidateForm.phone.trim() &&
      candidateForm.phone.replace(/\D/g, "").length < 7
    ) {
      setValidationMessage("Please enter a valid phone number.");
      return;
    }

    if (
      candidateForm.whatsapp.trim() &&
      candidateForm.whatsapp.replace(/\D/g, "").length < 7
    ) {
      setValidationMessage("Please enter a valid WhatsApp number.");
      return;
    }

    const { available } = await checkSlugAvailability(candidateSlug, profileId);
    if (!available) {
      setSlugStatus({
        state: "taken",
        text: "This slug is already in use.",
      });
      setValidationMessage("Please choose a unique slug before saving.");
      return;
    }

    setValidationMessage("");
    setSubmitting(true);
    try {
      await onSubmit(candidateForm);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
      <div className="rounded-[28px] border border-white/10 bg-white/7 p-6 pb-28 shadow-[0_30px_90px_rgba(0,0,0,0.36)] backdrop-blur-2xl md:pb-6">
        {draftStatus?.state !== "idle" ? (
          <div className="mb-4 flex justify-end">
            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                draftStatus.state === "saving"
                  ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                  : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              }`}
            >
              {draftStatus.text}
            </div>
          </div>
        ) : null}

        {message || uploadMessage || validationMessage ? (
          <div className="mb-6 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white/85">
            {validationMessage || uploadMessage || message}
          </div>
        ) : null}

        {duplicateMatches.length > 0 ? (
          <div className="mb-6 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-50">
              Similar profiles already exist
            </div>
            <div className="mt-1 text-amber-100/80">
              Double-check before saving to avoid accidental duplicates.
            </div>
            <div className="mt-3 space-y-2">
              {duplicateMatches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-amber-200/10 bg-black/10 px-3 py-2"
                >
                  <div className="font-medium text-white">{match.full_name}</div>
                  <div className="text-xs text-amber-100/75">
                    /u/{match.slug}
                    {match.company ? ` • ${match.company}` : ""}
                    {match.title ? ` • ${match.title}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Full Name" hint="Required">
            <input
              className={inputClass}
              value={form.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              placeholder="e.g., Juzer Zulfikar Ali"
            />
          </Field>

          <Field label="Slug" hint={`Public link: ${publicUrl}`}>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(event) =>
                onChange("slug", slugify(event.target.value).toLowerCase())
              }
              placeholder="leave blank to auto-generate"
            />
            {slugStatus.text ? (
              <FieldNote
                tone={
                  slugStatus.state === "available"
                    ? "success"
                    : slugStatus.state === "checking"
                      ? "muted"
                      : "error"
                }
              >
                {slugStatus.text}
              </FieldNote>
            ) : null}
          </Field>

          <Field label="Title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="e.g., Technical Director"
            />
          </Field>

          <Field label="Company">
            <input
              className={inputClass}
              value={form.company}
              onChange={(event) => onChange("company", event.target.value)}
              placeholder="e.g., Ezzy Group"
            />
          </Field>

          <Field label="Department">
            <input
              className={inputClass}
              value={form.department}
              onChange={(event) => onChange("department", event.target.value)}
              placeholder="e.g., Engineering"
            />
          </Field>

          <Field label="Phone">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              onBlur={() => normalizeField("phone", normalizePhoneLike)}
              placeholder="+8801XXXXXXXXX"
            />
            {phoneError ? <FieldNote tone="error">{phoneError}</FieldNote> : null}
          </Field>

          <Field label="WhatsApp">
            <input
              className={inputClass}
              value={form.whatsapp}
              onChange={(event) => onChange("whatsapp", event.target.value)}
              onBlur={() => normalizeField("whatsapp", normalizePhoneLike)}
              placeholder="+8801XXXXXXXXX"
            />
            {whatsappError ? (
              <FieldNote tone="error">{whatsappError}</FieldNote>
            ) : null}
          </Field>

          <Field label="Public Email">
            <input
              className={inputClass}
              value={form.emailPublic}
              onChange={(event) => onChange("emailPublic", event.target.value)}
              placeholder="name@company.com"
            />
            {emailError ? <FieldNote tone="error">{emailError}</FieldNote> : null}
          </Field>

          <Field label="LinkedIn">
            <input
              className={inputClass}
              value={form.linkedin}
              onChange={(event) => onChange("linkedin", event.target.value)}
              placeholder="https://www.linkedin.com/in/username/"
            />
          </Field>

          <Field label="Website">
            <input
              className={inputClass}
              value={form.website}
              onChange={(event) => onChange("website", event.target.value)}
              onBlur={() => normalizeField("website", normalizeWebsite)}
              placeholder="ezzy.group"
            />
            {normalizedForm.website && normalizedForm.website !== form.website ? (
              <FieldNote tone="muted">
                Will save as {normalizedForm.website}
              </FieldNote>
            ) : null}
          </Field>

          <Field label="Address">
            <input
              className={inputClass}
              value={form.address}
              onChange={(event) => onChange("address", event.target.value)}
              placeholder="Gulshan, Dhaka"
            />
          </Field>

          <Field label="Map URL">
            <input
              className={inputClass}
              value={form.mapUrl}
              onChange={(event) => onChange("mapUrl", event.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </Field>

          <Field label="User Photo" hint="Upload to ImageKit or paste URL">
            <UploadPicker
              id="profile-photo"
              label={form.photoUrl ? "Replace photo" : "Upload photo"}
              uploading={uploadingPhoto}
              onPick={async (file) => {
                setUploadMessage("");
                setUploadingPhoto(true);
                try {
                  const url = await uploadImageToImageKit(file, "photo");
                  onChange("photoUrl", url);
                  setUploadMessage("Photo uploaded successfully.");
                } catch (error) {
                  setUploadMessage(
                    error instanceof Error ? error.message : "Photo upload failed."
                  );
                } finally {
                  setUploadingPhoto(false);
                }
              }}
            />
            <input
              className={inputClass}
              value={form.photoUrl}
              onChange={(event) => onChange("photoUrl", event.target.value)}
              placeholder="https://ik.imagekit.io/..."
            />
            {form.photoUrl ? (
              <img
                src={form.photoUrl}
                alt="User preview"
                className="mt-3 h-20 w-20 rounded-2xl border border-white/12 object-cover"
              />
            ) : null}
          </Field>

          <Field label="Company Logo" hint="Upload to ImageKit or paste URL">
            <UploadPicker
              id="company-logo"
              label={form.companyLogoUrl ? "Replace logo" : "Upload logo"}
              uploading={uploadingLogo}
              onPick={async (file) => {
                setUploadMessage("");
                setUploadingLogo(true);
                try {
                  const url = await uploadImageToImageKit(file, "logo");
                  onChange("companyLogoUrl", url);
                  setUploadMessage("Logo uploaded successfully.");
                } catch (error) {
                  setUploadMessage(
                    error instanceof Error ? error.message : "Logo upload failed."
                  );
                } finally {
                  setUploadingLogo(false);
                }
              }}
            />
            <input
              className={inputClass}
              value={form.companyLogoUrl}
              onChange={(event) => onChange("companyLogoUrl", event.target.value)}
              placeholder="https://ik.imagekit.io/..."
            />
            {form.companyLogoUrl ? (
              <div className="mt-3 inline-flex rounded-2xl bg-white p-3">
                <img
                  src={form.companyLogoUrl}
                  alt="Company logo preview"
                  className="h-12 w-auto rounded object-contain"
                />
              </div>
            ) : null}
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <Toggle
            label="Active"
            checked={form.isActive}
            onChange={(value) => onChange("isActive", value)}
          />
          <Toggle
            label="Published"
            checked={form.isPublished}
            onChange={(value) => onChange("isPublished", value)}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving || submitting || hasBlockingValidation}
            onClick={() => void submitForm()}
            className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving || submitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Profile"
                : "Save Changes"}
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            View Public Page
          </a>

          <Link
            to="/admin/profiles"
            className="rounded-2xl border border-white/12 bg-white/8 px-6 py-3 font-semibold text-white"
          >
            Back
          </Link>

          {mode === "edit" && onDelete ? (
            <button
              type="button"
              disabled={deleting || deletingNow}
              onClick={async () => {
                if (!window.confirm("Delete this profile permanently?")) return;
                setDeletingNow(true);
                try {
                  await onDelete();
                } finally {
                  setDeletingNow(false);
                }
              }}
              className="ml-auto rounded-2xl bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {deleting || deletingNow ? "Deleting..." : "Delete"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <SidebarCard
          title="Saved payload"
          body={`slug: ${payloadPreview.slug}\nstatus: ${
            payloadPreview.is_active && payloadPreview.is_published ? "public" : "hidden"
          }`}
        />
        {mode === "edit" && !onDelete ? (
          <SidebarCard
            title="Role permissions"
            body="Your account can create and edit profiles, but deleting profiles is restricted to higher-level admin roles."
          />
        ) : null}
        <SidebarCard
          title="Validation"
          body={`Slug: ${
            slugStatus.state === "available"
              ? "ready"
              : slugStatus.state === "checking"
                ? "checking"
                : slugStatus.state === "taken"
                  ? "needs attention"
                  : "auto"
          }\nWebsite: ${normalizedForm.website || "not set"}\nPhone: ${
            normalizedForm.phone || "not set"
          }\nWhatsApp: ${normalizedForm.whatsapp || "not set"}`}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/92 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex w-full max-w-5xl gap-3">
          <Link
            to="/admin/profiles"
            className="flex-1 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-center font-semibold text-white"
          >
            Back
          </Link>
          <button
            type="button"
            disabled={saving || submitting || hasBlockingValidation}
            onClick={() => void submitForm()}
            className="flex-[1.3] rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving || submitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Profile"
                : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-white/60">{label}</div>
      {hint ? <div className="mt-1 text-xs text-white/35">{hint}</div> : null}
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-8 w-14 rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-white/20"
        }`}
      >
        <div
          className={`h-6 w-6 rounded-full bg-white transition ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SidebarCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 p-5 text-sm leading-6 text-white/70 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-2 whitespace-pre-line">{body}</p>
    </div>
  );
}

function FieldNote({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "success" | "error" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-200"
      : tone === "error"
        ? "text-rose-200"
        : "text-white/45";

  return <div className={`mt-2 text-xs ${toneClass}`}>{children}</div>;
}

function UploadPicker({
  id,
  label,
  uploading,
  onPick,
}: {
  id: string;
  label: string;
  uploading: boolean;
  onPick: (file: File) => Promise<void>;
}) {
  return (
    <div className="mt-2">
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={uploading}
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;
          await onPick(file);
          event.currentTarget.value = "";
        }}
      />
      <label
        htmlFor={id}
        className={`inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition ${
          uploading
            ? "bg-white/10 opacity-60"
            : "bg-white/10 hover:border-blue-400/60 hover:bg-blue-500/20"
        }`}
      >
        {uploading ? "Uploading..." : label}
      </label>
    </div>
  );
}
